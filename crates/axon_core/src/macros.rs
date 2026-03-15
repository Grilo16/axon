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
    ($name:expr, $block:expr) => {{
        let start = std::time::Instant::now();
        let result = $block;
        let duration = start.elapsed();
        tracing::info!("⏱️ [PROFILING] {} took {:?}", $name, duration);
        result
    }};
}