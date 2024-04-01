use anchor_lang::prelude::*;

#[account]
pub struct Listing {
    pub price: u64,
    pub seller: Pubkey,
    pub token_mint: Pubkey,
}
