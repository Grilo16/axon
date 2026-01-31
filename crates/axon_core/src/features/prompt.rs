use log::{info, warn};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;

use crate::paths;
// Import the module and the Enum
use crate::analysis::javascript::{self, skeleton::SkeletonTarget};
use crate::error::Result;

pub struct PromptConfig {
    pub files: HashSet<PathBuf>,
    pub project_root: PathBuf,
    pub redactions: Vec<String>,
    pub show_line_numbers: bool,
    pub remove_comments: bool,
    pub skeleton_config: Option<SkeletonTarget>,
}

pub fn build_context(config: PromptConfig) -> Result<String> {
    let mut output = String::new();

    let mut sorted_paths: Vec<&PathBuf> = config.files.iter().collect();
    sorted_paths.sort();

    info!("📝 Building context from {} files...", sorted_paths.len());
    output.push_str("# Context Map\n");
    for path in &sorted_paths {
        output.push_str(&format!(
            "- {}\n",
            paths::make_relative(&config.project_root, path)
        ));
    }
    output.push_str("\n");

    for path in sorted_paths {
        let relative_path = paths::make_relative(&config.project_root, path);
        if relative_path.contains("node_modules") {
            continue;
        }

        match fs::read_to_string(path) {
            Ok(raw_content) => {
                let mut content = raw_content;

                // --- PIPE 1: SKELETON MODE ---
                // If config exists (Some), run the skeletonizer
                if let Some(target) = &config.skeleton_config {
                    if path.extension().map_or(false, |ext| {
                        let s = ext.to_string_lossy();
                        s == "ts" || s == "tsx" || s == "js" || s == "jsx"
                    }) {
                        // Pass the cloned target configuration
                        content = javascript::make_skeleton(&content, path, target.clone());
                    }
                }

                // --- PIPE 2: MINIFICATION ---
                if config.remove_comments {
                    content = strip_comments(&content);
                }

                // --- PIPE 3: REDACTION ---
                if !config.redactions.is_empty() {
                    // Pass the filename so we can do qualified matching
                    content = redact_specific_vars(&content, &config.redactions, &relative_path);
                }

                // --- PIPE 4: LINE NUMBERS ---
                if config.show_line_numbers {
                    content = add_line_numbers(&content);
                }

                output.push_str(&format!("<file path=\"{}\">\n", relative_path));
                output.push_str(&content);
                output.push_str("\n</file>\n\n");
            }
            Err(e) => {
                warn!("⚠️ Could not read {:?}: {}", path, e);
            }
        }
    }

    Ok(output)
}

fn redact_specific_vars(
    content: &str,
    redaction_keys: &[String],
    current_file_path: &str,
) -> String {
    if redaction_keys.is_empty() {
        return content.to_string();
    }

    // 1) Filter keys that apply to THIS file
    let active_keys: Vec<String> = redaction_keys
        .iter()
        .filter_map(|key| {
            if let Some((file_target_raw, var_target)) = key.rsplit_once(':') {
                let current = current_file_path.replace('\\', "/");
                let file_target = file_target_raw.replace('\\', "/");

                let file_basename = std::path::Path::new(&file_target)
                    .file_name()
                    .and_then(|s| s.to_str())
                    .unwrap_or("");

                let matches = current.ends_with(&file_target) || current.ends_with(file_basename);
                if matches {
                    Some(var_target.to_string())
                } else {
                    None
                }
            } else {
                // global key: applies everywhere
                Some(key.clone())
            }
        })
        .collect();

    if active_keys.is_empty() {
        return content.to_string();
    }

    // 2) Build alternation for keys
    let joined_keys = active_keys
        .iter()
        .map(|k| regex::escape(k))
        .collect::<Vec<_>>()
        .join("|");

    // A "literal-ish" value pattern to avoid destroying type/interface declarations.
    // You can widen this later if you want to redact arbitrary expressions.
    let value_lit = r#"(?:"[^"\n]*"|'[^'\n]*'|`[^`\n]*`|\d+(?:\.\d+)?|true|false|null)"#;

    // Helper: replace "prefix + value" with "prefix + [REDACTED]"
    let replace_with_redacted = |caps: &regex::Captures| {
        format!("{}\"[REDACTED]\"", &caps[1])
    };

    let mut out = content.to_string();

    // PASS A: Typed assignment:  name: Type = VALUE
    // This fixes the main TS issue.
    {
        let pat = format!(
            r#"(?mi)(\b(?:{})\b\s*:\s*[^=;\n]+=\s*){}"#,
            joined_keys, value_lit
        );
        let re = regex::Regex::new(&pat).unwrap();
        out = re.replace_all(&out, replace_with_redacted).to_string();
    }

    // PASS B: Normal assignment:  name = VALUE
    {
        let pat = format!(r#"(?mi)(\b(?:{})\b\s*=\s*){}"#, joined_keys, value_lit);
        let re = regex::Regex::new(&pat).unwrap();
        out = re.replace_all(&out, replace_with_redacted).to_string();
    }

    // PASS C: Object/JSON property:  name: VALUE
    // We intentionally only redact literal-ish values here to avoid matching:
    //   interface X { name: string; }
    // or:
    //   function f(name: string) {}
    //
    // We also require context that looks like an object/JSON entry:
    // start-of-line OR after '{' OR after ',' (cheap and effective).
    {
        let pat = format!(
            r#"(?mi)(^|[{{,]\s*)("?)(?:{})\2\s*:\s*{}"#,
            joined_keys, value_lit
        );
        // NOTE: no backreferences in Rust regex, so the \2 won't work.
        // We'll use a simpler pattern without trying to match quote symmetry:
        let pat = format!(
            r#"(?mi)(^|[{{,]\s*)("?)(?:{})"?(?:\s*:\s*){}"#,
            joined_keys, value_lit
        );

        // Capture group 1 needs to include the prefix we want to preserve,
        // so we make a second regex that captures the "head" as group 1.
        let pat2 = format!(
            r#"(?mi)((?:^|[{{,]\s*)"?\b(?:{})\b"?\s*:\s*){}"#,
            joined_keys, value_lit
        );
        let re = regex::Regex::new(&pat2).unwrap();
        out = re.replace_all(&out, replace_with_redacted).to_string();
    }

    out
}


// fn redact_specific_vars(
//     content: &str,
//     redaction_keys: &[String],
//     current_file_path: &str,
// ) -> String {
//     if redaction_keys.is_empty() {
//         return content.to_string();
//     }

//     // 1. Filter keys: which ones apply to THIS file?
//     let active_keys: Vec<String> = redaction_keys
//     .iter()
//     .filter_map(|key| {
//         // Qualified: "file:target"
//         if let Some((file_target_raw, var_target)) = key.rsplit_once(':') {
//             let current = current_file_path.replace('\\', "/");
//             let file_target = file_target_raw.replace('\\', "/");

//             // basename match fallback
//             let file_basename = std::path::Path::new(&file_target)
//                 .file_name()
//                 .and_then(|s| s.to_str())
//                 .unwrap_or("");

//             let matches = current.ends_with(&file_target) || current.ends_with(file_basename);

//             if matches {
//                 return Some(var_target.to_string());
//             }
//             None
//         } else {
//             // Global name applies everywhere
//             Some(key.clone())
//         }
//     })
//     .collect();

//     if active_keys.is_empty() {
//         return content.to_string();
//     }

//     // 2. Build the Regex for the active keys
//     let joined_keys = active_keys
//         .iter()
//         .map(|k| regex::escape(k))
//         .collect::<Vec<_>>()
//         .join("|");

//     // This looks for KEY followed by : or =
//     let pattern = format!(
//         r#"(?i)\b({})\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^,\s;}}]+)"#,
//         joined_keys
//     );

//     let regex = regex::RegexBuilder::new(&pattern)
//         .multi_line(true)
//         .build()
//         .unwrap();
//     let key_re = regex::Regex::new(&format!(r#"(?i)\b({})\b\s*[:=]\s*"#, joined_keys)).unwrap();

//     regex
//         .replace_all(content, |caps: &regex::Captures| {
//             let matched = &caps[0];
//             if let Some(key_match) = key_re.find(matched) {
//                 format!("{} \"[REDACTED]\"", key_match.as_str())
//             } else {
//                 matched.to_string()
//             }
//         })
//         .to_string()
// }

fn strip_comments(content: &str) -> String {
    content
        .lines()
        .filter(|line| !line.trim().starts_with("//"))
        .collect::<Vec<&str>>()
        .join("\n")
}

fn add_line_numbers(content: &str) -> String {
    content
        .lines()
        .enumerate()
        .map(|(i, line)| format!("{:4} | {}", i + 1, line))
        .collect::<Vec<String>>()
        .join("\n")
}
