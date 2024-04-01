use anchor_lang::prelude::*;

use crate::listing::Listing;

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub counter: Account<'info, Listing>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
