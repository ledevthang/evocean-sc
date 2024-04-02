use anchor_lang::{prelude::*, system_program};
use anchor_spl::token;

use crate::listing::Listing;

pub fn process(ctx: Context<Buy>) -> Result<()> {
    let listing_account = &mut ctx.accounts.listing_account;
    let seller_account = ctx.accounts.seller.to_account_info();

    let cpi_transfer_sol_ctx = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.seller.to_account_info(),
        },
    );

    system_program::transfer(cpi_transfer_sol_ctx, listing_account.price)?;

    let bump = ctx.bumps.market_token_account;
    let token_mint_key = ctx.accounts.token_mint.key();
    let seed = &[b"market_token_account_", token_mint_key.as_ref(), &[bump]];
    let signer = &[&seed[..]];

    let cpi_transfer_token_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.market_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.market_token_account.to_account_info(),
        },
        signer,
    );

    token::transfer(cpi_transfer_token_ctx, 1)?;

    listing_account.close(seller_account)?;

    Ok(())
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(
        mut,
        seeds = [
            b"listing_account_",
            token_mint.key().as_ref(),
        ],
        bump
    )]
    pub listing_account: Account<'info, Listing>,

    pub token_mint: Account<'info, token::Mint>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK
    #[account(
        mut,
        address = listing_account.seller
    )]
    pub seller: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"market_token_account_",
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = market_token_account
    )]
    pub market_token_account: Account<'info, token::TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
    )]
    pub user_token_account: Account<'info, token::TokenAccount>,

    pub token_program: Program<'info, token::Token>,

    pub system_program: Program<'info, System>,
}
