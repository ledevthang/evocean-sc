use crate::listing::Listing;
use anchor_lang::prelude::*;
use anchor_spl::token;

pub fn process(ctx: Context<List>, price: u64) -> Result<()> {
    let listing_account = &mut ctx.accounts.listing_account;

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.market_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        },
    );

    token::transfer(cpi_ctx, 1)?;

    listing_account.price = price;
    listing_account.seller = ctx.accounts.seller.key();
    listing_account.token_mint = ctx.accounts.token_mint.key();

    msg!("listing submitted!");

    Ok(())
}

#[derive(Accounts)]
pub struct List<'info> {
    pub token_mint: Account<'info, token::Mint>,

    #[account(
        init,
        payer = seller,
        space = 8 + std::mem::size_of::<Listing>(),
        seeds = [
            b"listing_account_",
            token_mint.key().as_ref(),
        ],
        bump
    )]
    pub listing_account: Account<'info, Listing>,

    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [
            b"market_token_account_",
            token_mint.key().as_ref()
        ],
        payer = seller,
        bump,
        token::mint = token_mint,
        token::authority = market_token_account
    )]
    pub market_token_account: Account<'info, token::TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = seller,
    )]
    pub user_token_account: Account<'info, token::TokenAccount>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, token::Token>,
}
