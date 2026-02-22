/// A simple guard macro: if the condition is false, return an error early.
#[macro_export] // Makes it available to users of your crate and other modules
macro_rules! ensure {
    ($cond:expr, $err:expr) => {
        if !($cond) {
            return Err($err.into());
        }
    };
}
