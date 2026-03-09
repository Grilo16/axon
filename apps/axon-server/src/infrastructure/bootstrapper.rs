use crate::infrastructure::config::AppConfig;

pub mod db_ready;
pub mod unconfigured;

pub struct Bootstrapper<State> {
    pub config: AppConfig,
    pub state: State,
}