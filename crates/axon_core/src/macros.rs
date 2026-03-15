/// A simple guard macro: if the condition is false, return an error early.
#[macro_export] // Makes it available to users of your crate and other modules
macro_rules! ensure {
    ($cond:expr, $err:expr) => {
        if !($cond) {
            return Err($err.into());
        }
    };
}

#[macro_export]
macro_rules! time_it {
    // Variant with lazy format args — avoids format!() allocation when tracing is disabled.
    // Usage: time_it!("Parsing {}", path; expr)
    ($fmt:literal, $($arg:expr),+; $block:expr) => {{
        let start = std::time::Instant::now();
        let result = $block;
        if tracing::enabled!(tracing::Level::INFO) {
            let duration = start.elapsed();
            tracing::info!(concat!("⏱️ [PROFILING] ", $fmt, " took {:?}"), $($arg),+, duration);
        }
        result
    }};
    // Simple variant with a pre-built name.
    // Usage: time_it!("Phase Name", expr)
    ($name:expr, $block:expr) => {{
        let start = std::time::Instant::now();
        let result = $block;
        if tracing::enabled!(tracing::Level::INFO) {
            let duration = start.elapsed();
            tracing::info!("⏱️ [PROFILING] {} took {:?}", $name, duration);
        }
        result
    }};
}