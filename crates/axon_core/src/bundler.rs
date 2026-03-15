use std::collections::HashMap;

use crate::{
    bundler::rules::{RedactionRule, RedactionType, TargetScope},
    domain::bundle::BundleOptions,
    error::{AxonResult},
    ids::FileId,
    spool::AxonSpool,
    tree::{state::Analyzed, state::RegistryAccess, AxonTree},
};

pub mod rules;

pub struct AxonBundler<'a> {
    tree: &'a AxonTree<Analyzed>,
    spool: &'a AxonSpool,
    commit_hash: &'a str,
    options: BundleOptions,
}

struct SpanReplacement {
    start: usize,
    end: usize,
    text: String,
}

impl<'a> AxonBundler<'a> {
    pub fn new(tree: &'a AxonTree<Analyzed>, spool: &'a AxonSpool, commit_hash: &'a str, options: BundleOptions) -> Self {
        Self { tree, spool, commit_hash, options }
    }

    pub fn generate_bundle(&self) -> AxonResult<HashMap<String, String>> {
        let mut output = HashMap::new();
        let grouped_rules = self.group_rules_by_file();

        for path in &self.options.target_files {
            if let Some(file_id) = self.tree.file_id_by_path(path) {
                let rules_for_file = grouped_rules.get(&file_id).map(|v| v.as_slice()).unwrap_or(&[]);
                
                // ⏱️ Wrap the O(N) sequential redaction process
                let redacted_text = crate::time_it!(
                    format!("Redacting {}", path),
                    self.redact_file(file_id, path, rules_for_file)?
                );
                
                output.insert(path.clone(), redacted_text);
            }
        }

        Ok(output)
    }

    fn group_rules_by_file(&self) -> HashMap<FileId, Vec<&RedactionRule>> {
        let mut grouped: HashMap<FileId, Vec<&RedactionRule>> = HashMap::new();

        for rule in &self.options.rules {
            match &rule.target {
                TargetScope::SpecificSymbol { file_path, .. } | TargetScope::EntireFile(file_path) => {
                    if let Some(file_id) = self.tree.file_id_by_path(file_path) {
                        grouped.entry(file_id).or_default().push(rule);
                    }
                }
                TargetScope::Global(kind) => {
                    for file in self.tree.files() {
                        if let Ok(chunk) = self.tree.get_file_chunk(self.spool, self.commit_hash, file.id()) {
                            if chunk.symbols.iter().any(|s| s.kind == *kind) {
                                grouped.entry(file.id()).or_default().push(rule);
                            }
                        }
                    }
                }
            }
        }

        grouped
    }

    fn redact_file(&self, file_id: FileId, path: &str, rules: &[&RedactionRule]) -> AxonResult<String> {
        let content = self.tree.read_file_content(self.spool, self.commit_hash, path)?;

        if let Some(file_rule) = rules.iter().find(|r| matches!(r.target, TargetScope::EntireFile(_))) {
            return Ok(match &file_rule.action {
                RedactionType::RemoveEntirely => String::new(),
                RedactionType::HideImplementation => "// FILE IMPLEMENTATION HIDDEN\n".to_string(),
                RedactionType::ReplaceWith(s) => s.clone(),
            });
        }

        let chunk = self.tree.get_file_chunk(self.spool, self.commit_hash, file_id)?;
        let mut replacements = Vec::new();

        for symbol in chunk.symbols {
            let applicable_rule = rules.iter().find(|rule| match &rule.target {
                TargetScope::SpecificSymbol { symbol_id: target_id, .. } => *target_id == symbol.id,
                TargetScope::Global(kind) => *kind == symbol.kind,
                TargetScope::EntireFile(_) => false, 
            });

            if let Some(rule) = applicable_rule {
                let (target_range, text) = match &rule.action {
                    RedactionType::RemoveEntirely => (symbol.range.as_range(), String::new()),
                    RedactionType::ReplaceWith(s) => (symbol.range.as_range(), s.clone()),
                    RedactionType::HideImplementation => {
                        let r = symbol.body_range.as_ref().unwrap_or(&symbol.range).as_range();
                        (r, "{ /* REDACTED */ }".to_string())
                    }
                };

                replacements.push(SpanReplacement {
                    start: target_range.start,
                    end: target_range.end,
                    text,
                });
            }
        }

        replacements.sort_by(|a, b| a.start.cmp(&b.start).then_with(|| b.end.cmp(&a.end)));

        let mut valid_replacements = Vec::new();
        let mut current_max_end = 0;

        for rep in replacements {
            if rep.start >= current_max_end {
                current_max_end = rep.end;
                valid_replacements.push(rep);
            }
        }

        let mut final_capacity = content.len();
        for rep in &valid_replacements {
            final_capacity = final_capacity.saturating_sub(rep.end - rep.start) + rep.text.len();
        }

        let mut output = String::with_capacity(final_capacity);
        let mut last_end = 0;

        for rep in valid_replacements {
            if rep.start <= rep.end && rep.end <= content.len() {
                output.push_str(&content[last_end..rep.start]);
                output.push_str(&rep.text);
                last_end = rep.end;
            }
        }

        if last_end < content.len() {
            output.push_str(&content[last_end..]);
        }

        Ok(output)
    }
}