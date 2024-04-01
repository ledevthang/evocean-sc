use crate::{errors::MarketError, master::Master};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitMaster<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + std::mem::size_of::<Master>(),
        seeds = [
            b"master_account_",
        ],
        bump
    )]
    pub master_account: Account<'info, Master>,

    #[account(mut)]
    pub signer: Signer<'info>, // admin

    pub system_program: Program<'info, System>,
}

pub fn process(ctx: Context<InitMaster>, fee: u8) -> Result<()> {
    let master_acc = &mut ctx.accounts.master_account;

    if master_acc.initialized {
        return err!(MarketError::MasterAlreadyInitialized);
    }

    master_acc.market_fee = fee;
    master_acc.authority = ctx.accounts.signer.key();
    master_acc.initialized = true;

    msg!("initialized master");

    Ok(())
}
