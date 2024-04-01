use anchor_lang::prelude::*;

#[account]
pub struct Master {
    pub authority: Pubkey,
    pub market_fee: u8,
    pub initialized: bool,
}
