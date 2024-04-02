use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::{buy::*, init_master::*, list::*};
use state::*;

declare_id!("GrWK5uLfnVwhWDaLpFVFgwF8qZMzBYfKsjsuP1vbPApW");

#[program]
pub mod marketplace {
    use super::*;

    pub fn init_master(ctx: Context<InitMaster>, fee: u8) -> Result<()> {
        instructions::init_master::process(ctx, fee)
    }

    pub fn list(ctx: Context<List>, price: u64) -> Result<()> {
        instructions::list::process(ctx, price)
    }

    pub fn buy(ctx: Context<Buy>) -> Result<()> {
        instructions::buy::process(ctx)
    }
}
