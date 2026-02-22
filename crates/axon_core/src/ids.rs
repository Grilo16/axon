use serde::{Deserialize, Serialize};
use ts_rs::TS;

macro_rules! define_id {
    ($name:ident) => {
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
        #[ts(export_to = "ids.ts")]
        pub struct $name(pub u32);

        impl From<u32> for $name {
            fn from(id: u32) -> Self {
                Self(id)
            }
        }

        impl $name {
            pub fn as_u32(self) -> u32 {
                self.0
            }
            pub fn as_usize(self) -> usize {
                self.0 as usize
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }
    };
}

define_id!(FileId);
define_id!(DirectoryId);
define_id!(SymbolId);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_id_conversions() {
        let id = FileId::from(42);

        assert_eq!(id.as_u32(), 42);
        assert_eq!(id.as_usize(), 42);
        assert_eq!(format!("{}", id), "42");
    }

    #[test]
    fn test_type_safety() {
        // This test is mostly "conceptual" - the compiler
        // ensures FileId and DirectoryId can't be swapped.

        // let f_id = FileId::from(1);
        // let d_id = DirectoryId::from(1);

        // assert_eq!(f_id, d_id); // <-- This would fail to compile!
    }
}

#[cfg(test)]
mod debug_tests {
    use super::*;

    #[test]
    fn check_id_serialization() {
        let id = FileId(123);

        // Serialize the ID to a JSON string
        let json_output = serde_json::to_string(&id).unwrap();

        println!("\n--- ID SERIALIZATION CHECK ---");
        println!("Raw JSON: {}", json_output);
        println!("------------------------------\n");

        // If transparent is OFF: This will likely be [123]
        // If transparent is ON: This will be 123
    }
}
