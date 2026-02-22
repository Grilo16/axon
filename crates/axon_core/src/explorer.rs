use crate::error::{AxonError, AxonResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[ts(export_to = "explorer.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ExplorerFile {
    pub name: String,
    pub path: PathBuf,
    pub size: u64,
    pub extension: String,
}

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[ts(export_to = "explorer.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ExplorerFolder {
    pub name: String,
    pub path: PathBuf,
    pub has_children: bool,
}

#[derive(Serialize, Deserialize, TS, Debug, Clone)]
#[serde(tag = "type", content = "data")]
#[ts(export_to = "explorer.ts", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum ExplorerEntry {
    File(ExplorerFile),
    Folder(ExplorerFolder),
}

// 1. Implementing TryFrom for DirEntry makes the list_contents logic 10x cleaner
impl TryFrom<std::fs::DirEntry> for ExplorerEntry {
    type Error = AxonError;

    fn try_from(entry: std::fs::DirEntry) -> AxonResult<Self> {
        let path = entry.path();
        let metadata = entry.metadata().map_err(|e| AxonError::io(e, &path))?;
        let name = entry.file_name().to_string_lossy().into_owned();

        if metadata.is_dir() {
            Ok(ExplorerEntry::Folder(ExplorerFolder::from_path(path)))
        } else {
            let extension = path
                .extension()
                .map(|e| e.to_string_lossy().into_owned())
                .unwrap_or_default();

            Ok(ExplorerEntry::File(ExplorerFile {
                name,
                extension,
                size: metadata.len(),
                path,
            }))
        }
    }
}

impl ExplorerFolder {
    pub fn from_path(path: PathBuf) -> Self {
        let has_children = path
            .read_dir()
            .map(|mut i| i.next().is_some())
            .unwrap_or(false);

        Self {
            name: path
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .unwrap_or_else(|| "Root".to_string()),
            path,
            has_children,
        }
    }

    pub fn list_contents(&self) -> AxonResult<Vec<ExplorerEntry>> {
        // Functional approach: Read -> Map to Result -> Collect into Vec
        let mut entries: Vec<ExplorerEntry> = std::fs::read_dir(&self.path)
            .map_err(|e| AxonError::io(e, &self.path))?
            .map(|res| {
                res.map_err(|e| AxonError::io(e, &self.path))
                    .and_then(ExplorerEntry::try_from)
            })
            .collect::<AxonResult<Vec<_>>>()?;

        // Use sort_by_key for cleaner syntax
        entries.sort_by(|a, b| match (a, b) {
            (ExplorerEntry::Folder(_), ExplorerEntry::File(_)) => std::cmp::Ordering::Less,
            (ExplorerEntry::File(_), ExplorerEntry::Folder(_)) => std::cmp::Ordering::Greater,
            _ => a.get_name().to_lowercase().cmp(&b.get_name().to_lowercase()),
        });

        Ok(entries)
    }
}

impl ExplorerFile {
    pub fn read_content(&self) -> AxonResult<String> {
        // FIX: Added return value and removed trailing semicolon logic
        std::fs::read_to_string(&self.path).map_err(|e| AxonError::io(e, &self.path))
    }
}

impl ExplorerEntry {
    pub fn get_name(&self) -> &str {
        match self {
            ExplorerEntry::File(f) => &f.name,
            ExplorerEntry::Folder(f) => &f.name,
        }
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};
    use std::io::Write;

    #[test]
    fn test_explorer_sorting_and_mapping() -> AxonResult<()> {
        let temp_dir = std::env::temp_dir().join("axon_explorer_test");
        if temp_dir.exists() {
            fs::remove_dir_all(&temp_dir)?;
        }
        fs::create_dir_all(&temp_dir)?;

        // 2. Create a mix of files and folders
        // Folder 'b', Folder 'a', File 'z.txt', File 'm.txt'
        fs::create_dir(temp_dir.join("b_folder"))?;
        fs::create_dir(temp_dir.join("a_folder"))?;
        File::create(temp_dir.join("z_file.txt"))?;
        File::create(temp_dir.join("m_file.rs"))?;

        // 3. Run the explorer
        let explorer = ExplorerFolder::from_path(temp_dir.clone());
        let contents = explorer.list_contents()?;

        // 4. Assertions
        assert_eq!(contents.len(), 4);

        // Check Sorting: Folders first (a, b), then Files (m, z)
        if let ExplorerEntry::Folder(f) = &contents[0] {
            assert_eq!(f.name, "a_folder");
        } else { panic!("First item should be a folder"); }

        if let ExplorerEntry::Folder(f) = &contents[1] {
            assert_eq!(f.name, "b_folder");
        } else { panic!("Second item should be a folder"); }

        if let ExplorerEntry::File(f) = &contents[2] {
            assert_eq!(f.name, "m_file.rs");
            assert_eq!(f.extension, "rs");
        } else { panic!("Third item should be a file"); }

        // Clean up
        fs::remove_dir_all(&temp_dir)?;
        Ok(())
    }

    #[test]
    fn test_read_file_content() -> AxonResult<()> {
        let temp_dir = std::env::temp_dir().join("axon_file_test");
        fs::create_dir_all(&temp_dir)?;
        
        let file_path = temp_dir.join("hello.txt");
        let mut file = File::create(&file_path)?;
        writeln!(file, "Hello Axon!")?;

        let explorer_file = ExplorerFile {
            name: "hello.txt".to_string(),
            path: file_path,
            size: 11,
            extension: "txt".to_string(),
        };

        let content = explorer_file.read_content()?;
        assert_eq!(content.trim(), "Hello Axon!");

        fs::remove_dir_all(&temp_dir)?;
        Ok(())
    }
}