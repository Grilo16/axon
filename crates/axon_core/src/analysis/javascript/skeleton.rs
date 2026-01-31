use std::path::Path;
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::{SourceType, Span};
use oxc_ast::ast::*;
use oxc_ast::visit::{walk, Visit};

#[derive(Debug, Clone)]
pub enum SkeletonTarget {
    All,
    KeepOnly(Vec<String>),
    StripOnly(Vec<String>),
}

pub fn make_skeleton(source_text: &str, path: &Path, target: SkeletonTarget) -> String {
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(path).unwrap_or_default();
    let ret = Parser::new(&allocator, source_text, source_type).parse();

    let file_name = path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();

    let mut visitor = BodyStripper {
        spans_to_remove: Vec::new(),
        target,
        current_file: file_name,
        is_inside_kept: false, // 🆕 The "Shield"
    };
    
    visitor.visit_program(&ret.program);

    visitor.spans_to_remove.sort_by(|a, b| b.start.cmp(&a.start));
    visitor.spans_to_remove.dedup_by(|a, b| a.start == b.start && a.end == b.end);

    let mut result = source_text.to_string();
    for span in visitor.spans_to_remove {
        let start = span.start as usize;
        let end = span.end as usize;
        if start < result.len() && end <= result.len() {
            result.replace_range(start..end, " /* implementation hidden */ ");
        }
    }
    result
}

struct BodyStripper {
    spans_to_remove: Vec<Span>,
    target: SkeletonTarget,
    current_file: String,
    is_inside_kept: bool, // If true, we don't add any spans to remove
}

impl BodyStripper {
    fn check_should_strip(&self, name: Option<&str>) -> bool {
        // If we are already inside a "Kept" node, we NEVER strip children
        if self.is_inside_kept { return false; }

        match &self.target {
            SkeletonTarget::All => true,
            SkeletonTarget::KeepOnly(keep_list) => {
                match name {
                    Some(n) => {
                        let qualified = format!("{}:{}", self.current_file, n);
                        !keep_list.iter().any(|k| k == n || k == &qualified)
                    },
                    None => true, 
                }
            }
            SkeletonTarget::StripOnly(strip_list) => {
                match name {
                    Some(n) => {
                        let qualified = format!("{}:{}", self.current_file, n);
                        strip_list.iter().any(|k| k == n || k == &qualified)
                    },
                    None => false,
                }
            }
        }
    }
}
impl<'a> Visit<'a> for BodyStripper {
    fn visit_function(&mut self, func: &Function<'a>, flags: Option<oxc_syntax::scope::ScopeFlags>) {
        let name = func.id.as_ref().map(|id| id.name.as_str());
        let strip = self.check_should_strip(name);

        if strip {
            if let Some(body) = &func.body {
                self.spans_to_remove.push(body.span);
            }
        } else {
            // 🛡️ SHIELD: Only activate if we are explicitly in KeepOnly mode
            let is_keep_mode = matches!(self.target, SkeletonTarget::KeepOnly(_));
            let old_shield = self.is_inside_kept;
            if is_keep_mode { self.is_inside_kept = true; }
            
            walk::walk_function(self, func, flags);
            self.is_inside_kept = old_shield;
        }
    }

    fn visit_object_property(&mut self, prop: &ObjectProperty<'a>) {
        let name = match &prop.key {
            PropertyKey::StaticIdentifier(id) => Some(id.name.as_str()),
            PropertyKey::Identifier(id) => Some(id.name.as_str()),
            _ => None,
        };

        let strip = self.check_should_strip(name);

        if strip {
            match &prop.value {
                Expression::ArrowFunctionExpression(expr) => {
                    self.spans_to_remove.push(expr.body.span);
                }
                Expression::FunctionExpression(expr) => {
                    if let Some(body) = &expr.body {
                        self.spans_to_remove.push(body.span);
                    }
                }
                _ => { walk::walk_object_property(self, prop); }
            }
        } else {
            // 🛡️ SHIELD: Only activate for KeepOnly
            let is_keep_mode = matches!(self.target, SkeletonTarget::KeepOnly(_));
            let old_shield = self.is_inside_kept;
            if is_keep_mode { self.is_inside_kept = true; }
            
            walk::walk_object_property(self, prop);
            self.is_inside_kept = old_shield;
        }
    }

    fn visit_method_definition(&mut self, method: &MethodDefinition<'a>) {
        let name = match &method.key {
            PropertyKey::StaticIdentifier(id) => Some(id.name.as_str()),
            PropertyKey::Identifier(id) => Some(id.name.as_str()),
            _ => None,
        };

        let strip = self.check_should_strip(name);

        if strip {
             if let Some(body) = &method.value.body {
                self.spans_to_remove.push(body.span);
             }
        } else {
            // 🛡️ SHIELD: Only activate for KeepOnly
            let is_keep_mode = matches!(self.target, SkeletonTarget::KeepOnly(_));
            let old_shield = self.is_inside_kept;
            if is_keep_mode { self.is_inside_kept = true; }

            walk::walk_method_definition(self, method);
            self.is_inside_kept = old_shield;
        }
    }

    fn visit_arrow_expression(&mut self, expr: &ArrowFunctionExpression<'a>) {
        // Arrow functions usually don't have names themselves, 
        // they rely on the property key or variable name above them.
        if self.check_should_strip(None) {
             self.spans_to_remove.push(expr.body.span);
        } else {
            walk::walk_arrow_expression(self, expr);
        }
    }
}