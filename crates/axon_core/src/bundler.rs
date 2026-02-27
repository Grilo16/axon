use std::collections::{HashMap};

use crate::{
    bundler::rules::{BundleOptions, RedactionRule, TargetScope, RedactionType}, 
    error::{AxonError, AxonResult}, 
    ids::FileId, 
    tree::{AxonTree, state::{Analyzed, RegistryAccess}}
};

pub mod rules;

pub struct AxonBundler<'a> {
    tree: &'a AxonTree<Analyzed>,
    options: BundleOptions,
}

/// A lightweight internal struct to hold our byte replacements
struct SpanReplacement {
    start: usize,
    end: usize,
    text: String,
}

impl<'a> AxonBundler<'a> {
    pub fn new(tree: &'a AxonTree<Analyzed>, options: BundleOptions) -> Self {
        Self { tree, options }
    }

    /// Executes the redactions and returns a map of File Paths -> Redacted Source Code
    pub fn generate_bundle(&self) -> AxonResult<HashMap<String, String>> {
        let mut output = HashMap::new();

        // 1. Group rules by FileId internally for maximum performance
        let grouped_rules = self.group_rules_by_file();

        // 2. ONLY process the exact files the frontend asked for!
        for path in &self.options.target_files {
            // Convert string to FileId instantly
            if let Some(file_id) = self.tree.file_id_by_path(path) {
                
                let rules_for_file = grouped_rules.get(&file_id).map(|v| v.as_slice()).unwrap_or(&[]);
                let redacted_text = self.redact_file(file_id, rules_for_file)?;
                
                output.insert(path.clone(), redacted_text);
            }
        }

        Ok(output)
    }

    /// Maps rules to the specific files they target to achieve O(1) lookups during bundling
    fn group_rules_by_file(&self) -> HashMap<FileId, Vec<&RedactionRule>> {
        let mut grouped: HashMap<FileId, Vec<&RedactionRule>> = HashMap::new();

        for rule in &self.options.rules {
            match &rule.target {
                TargetScope::SpecificSymbol { file_path, .. } | TargetScope::EntireFile(file_path) => {
                    // Instantly resolve the string to an ID. If it's invalid, we just skip it.
                    if let Some(file_id) = self.tree.file_id_by_path(file_path) {
                        grouped.entry(file_id).or_default().push(rule);
                    }
                }
                TargetScope::Global(kind) => {
                    for file in self.tree.files() {
                        // Using your exact struct layout!
                        if file.symbols().iter().any(|s| s.kind == *kind) {
                            grouped.entry(file.id()).or_default().push(rule);
                        }
                    }
                }
            }
        }

        grouped
    }

 fn redact_file(&self, file_id: FileId, rules: &[&RedactionRule]) -> AxonResult<String> {
        let file = self.tree.file(file_id).ok_or_else(|| AxonError::NotFound {
            entity: "File",
            id: file_id.to_string(),
        })?;

        let mut content = file.content().to_string();

        if let Some(file_rule) = rules.iter().find(|r| matches!(r.target, TargetScope::EntireFile(_))) {
            return Ok(match &file_rule.action {
                RedactionType::RemoveEntirely => String::new(),
                RedactionType::HideImplementation => "// FILE IMPLEMENTATION HIDDEN\n".to_string(),
                RedactionType::ReplaceWith(s) => s.clone(),
            });
        }

        let mut replacements = Vec::new();

        for symbol in file.symbols() {
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

        replacements.sort_by(|a, b| {
            a.start.cmp(&b.start).then_with(|| b.end.cmp(&a.end))
        });

        let mut valid_replacements = Vec::new();
        let mut current_max_end = 0;

        // 2. Filter out nested/overlapping spans
        for rep in replacements {
            if rep.start >= current_max_end {
                // No overlap! Safe to keep.
                current_max_end = rep.end;
                valid_replacements.push(rep);
            } else {
                println!("🛡️ Absorbed nested replacement at {}..{}", rep.start, rep.end);
                continue; 
            }
        }

        // 3. NOW sort our clean, non-overlapping spans in REVERSE order for safe text modification
        valid_replacements.sort_by(|a, b| b.start.cmp(&a.start));

        for rep in valid_replacements {
            if rep.start <= rep.end && rep.end <= content.len() {
                content.replace_range(rep.start..rep.end, &rep.text);
            }
        }

        Ok(content)
    }
}
