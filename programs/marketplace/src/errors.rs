use anchor_lang::error_code;

#[error_code]
pub enum MarketError {
    #[msg("Master already has been initialized")]
    MasterAlreadyInitialized,
}
