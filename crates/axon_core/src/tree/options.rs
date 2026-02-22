use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct AxonScanOptions {
    /// Extensions allowed (without dot), e.g. {"js","ts","tsx","jsx"}.
    pub allowed_extensions: HashSet<String>,
}

impl Default for AxonScanOptions {
    fn default() -> Self {
        let allowed_extensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"]
            .into_iter()
            .map(str::to_string)
            .collect();
        Self { allowed_extensions }
    }
}
