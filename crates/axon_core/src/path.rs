use core::fmt;
use std::{
    borrow::Borrow,
    path::{Component, Path},
};

use serde::Serialize;
use ts_rs::TS;

use crate::error::{AxonError, AxonResult};

#[derive(Clone, PartialEq, Eq, Hash, Serialize, TS)]
pub struct RelativeAxonPath(String);

impl RelativeAxonPath {
    pub fn base() -> Self {
        Self(String::new())
    }

    pub fn is_base(&self) -> bool {
        self.0.is_empty()
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub fn segments(&self) -> impl Iterator<Item = &str> {
        self.0.split('/').filter(|s| !s.is_empty())
    }
    /// Join a single segment onto this path.
    pub fn join_segment(&self, seg: impl AsRef<str>) -> AxonResult<Self> {
        let seg = seg.as_ref();

        // 1. Guard clauses
        if seg.is_empty() || seg == "." {
            return Ok(self.clone());
        }

        ensure!(
            !seg.contains(['\\', '/']),
            AxonError::InvalidPathSegment(seg.to_string())
        );

        // 2. Construction
        let inner = if self.is_base() {
            seg.to_string()
        } else {
            let mut s = String::with_capacity(self.0.len() + 1 + seg.len());
            s.push_str(&self.0);
            s.push('/');
            s.push_str(seg);
            s
        };

        Ok(Self(inner))
    }

    /// Returns the parent path if any (root has no parent).
    pub fn parent(&self) -> Option<Self> {
        let idx = self.0.rfind('/')?;
        Some(Self(self.0[..idx].to_string()))
    }

    pub fn from_absolute(root: &Path, abs: &Path) -> AxonResult<Self> {
        let rel = abs.strip_prefix(root).map_err(|_| AxonError::StripPrefix {
            root: root.to_path_buf(),
            path: abs.to_path_buf(),
        })?;

        let mut out = String::new();
        rel.components().try_for_each(|c| match c {
            Component::CurDir => Ok(()),
            Component::Normal(os) => {
                let seg = os
                    .to_str()
                    .ok_or_else(|| AxonError::NonUtf8Path(abs.to_path_buf()))?;

                if !out.is_empty() {
                    out.push('/');
                }

                out.push_str(seg);
                Ok(())
            }
            Component::Prefix(_) | Component::RootDir | Component::ParentDir => {
                Err(AxonError::UnsupportedPath {
                    component: format!("{c:?}"),
                    path: abs.to_path_buf(),
                })
            }
        })?;

        Ok(Self(out))
    }

    pub fn file_name(&self) -> Option<&str> {
        self.segments().last()
    }

    pub fn join(&self, other: &Self) -> Self {
        if self.is_base() {
            return other.clone();
        }
        if other.is_base() {
            return self.clone();
        }
        Self(format!("{}/{}", self.0, other.0))
    }
}

impl Borrow<str> for RelativeAxonPath {
    fn borrow(&self) -> &str {
        self.as_str()
    }
}

impl fmt::Debug for RelativeAxonPath {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_tuple("RelativeAxonPath").field(&self.0).finish()
    }
}

impl fmt::Display for RelativeAxonPath {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.is_base() {
            write!(f, ".")
        } else {
            write!(f, "{}", self.0)
        }
    }
}

impl From<&str> for RelativeAxonPath {
    fn from(s: &str) -> Self {
        let normalized = s.replace('\\', "/");
        let cleaned = normalized.trim_start_matches('/').trim_end_matches('/');

        Self(cleaned.to_string())
    }
}
impl PartialEq<str> for RelativeAxonPath {
    fn eq(&self, other: &str) -> bool {
        self.0 == other
    }
}

impl PartialEq<&str> for RelativeAxonPath {
    fn eq(&self, other: &&str) -> bool {
        self.0 == *other
    }
}

impl std::ops::Deref for RelativeAxonPath {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_base_logic() {
        let p = RelativeAxonPath::base();
        assert!(p.is_base());
        assert_eq!(p.to_string(), ".");
        assert_eq!(p.segments().count(), 0);
    }

    #[test]
    fn test_joining() {
        let p = RelativeAxonPath::base()
            .join_segment("src")
            .unwrap()
            .join_segment("main.rs")
            .unwrap();

        assert_eq!(p.as_str(), "src/main.rs");
        assert_eq!(p.segments().collect::<Vec<_>>(), vec!["src", "main.rs"]);
    }

    #[test]
    fn test_invalid_segments() {
        let p = RelativeAxonPath::base();
        // Test slash prevention
        assert!(p.join_segment("src/code").is_err());
        // Test backslash prevention
        assert!(p.join_segment("src\\code").is_err());
        // Test empty/dot handling (should return clone)
        assert_eq!(p.join_segment("").unwrap(), p);
        assert_eq!(p.join_segment(".").unwrap(), p);
    }

    #[test]
    fn test_parent() {
        let p = RelativeAxonPath::from("src/main.rs");
        let parent = p.parent().unwrap();
        assert_eq!(parent.as_str(), "src");
        assert!(parent.parent().is_none()); // "src" has no slash, so parent is None (base)
    }

    #[test]
    fn test_from_absolute() {
        let root = Path::new("/projects/axon");
        let file = Path::new("/projects/axon/src/lib.rs");

        let rel = RelativeAxonPath::from_absolute(root, file).unwrap();
        assert_eq!(rel.as_str(), "src/lib.rs");
    }

    #[test]
    fn test_normalization() {
        let p = RelativeAxonPath::from("/leading/slash");
        assert_eq!(p.as_str(), "leading/slash");
    }

    #[test]
    fn test_windows_path_normalization() {
        // Input with backslashes
        let p = RelativeAxonPath::from("src\\features\\workspace.ts");
        assert_eq!(p.as_str(), "src/features/workspace.ts");

        // Input with mixed slashes and leading/trailing junk
        let p2 = RelativeAxonPath::from("/src\\components/Button.tsx/");
        assert_eq!(p2.as_str(), "src/components/Button.tsx");
    }

    #[test]
    fn test_equality_with_str() {
        let p = RelativeAxonPath::from("src/main.rs");
        // This works because of your PartialEq implementations!
        assert_eq!(p, "src/main.rs");
    }
}
