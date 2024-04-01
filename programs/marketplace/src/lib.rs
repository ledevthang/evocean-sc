use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::{buy::*, init_master::*, list::*};
use state::*;

declare_id!("JBTvPecuG2GQTShKFVk48dq3pPMpeLAURmQXuw8Rm4os");

#[program]
pub mod marketplace {
    use super::*;

    pub fn init_master(ctx: Context<InitMaster>, fee: u8) -> Result<()> {
        instructions::init_master::process(ctx, fee)
    }

    pub fn list(ctx: Context<List>, token_id: String, price: u64) -> Result<()> {
        instructions::list::process(ctx, token_id, price)
    }

    pub fn buy(_ctx: Context<Buy>) -> Result<()> {
        Ok(())
    }
}
