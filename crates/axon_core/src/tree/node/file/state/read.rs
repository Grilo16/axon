use crate::{
    error::AxonResult,
    parser::AxonParser,
    tree::node::file::{
        state::{Outlined, Read},
        AxonFile,
    },
};
use std::sync::Arc;

impl AxonFile<Read> {
    pub fn content(&self) -> &str {
        &self.state.content
    }

    pub fn line_count(&self) -> usize {
        self.state.content.lines().count()
    }

    pub fn arc_content(&self) -> Arc<str> {
        Arc::clone(&self.state.content)
    }

    /// Primary transition: Use a parser to move from raw text to semantic symbols.
    pub fn outline_with<P: AxonParser>(self, parser: &P) -> AxonResult<AxonFile<Outlined>> {
        let output = crate::time_it!(
            format!("Parsing {}", self.path.as_str()),
            parser.parse(self.content(), self.source_type())?
        );
        Ok(AxonFile::transition(
            self.id,
            self.path,
            self.parent,
            self.source_type,
            Outlined {
                content: self.state.content,
                symbols: output.symbols,
                imports: output.imports,
                exports: output.exports,
            },
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ids::{DirectoryId, FileId};
    use oxc_span::SourceType;
    use std::sync::Arc;

    #[test]
    fn test_line_counting() {
        let content = Arc::from("line1\nline2\nline3");
        let file = AxonFile::transition(
            FileId(1),
            "test.txt".into(),
            DirectoryId(0),
            SourceType::default(),
            Read { content },
        );
        assert_eq!(file.line_count(), 3);
    }
}
