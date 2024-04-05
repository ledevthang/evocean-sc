use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::{buy::*, init_master::*, list::*};
use state::*;

//58PaLbpXsJbiNdJhebM1Prx2o9XecQ9ftXvwrJ8Q2BsL

declare_id!("58PaLbpXsJbiNdJhebM1Prx2o9XecQ9ftXvwrJ8Q2BsL");

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
