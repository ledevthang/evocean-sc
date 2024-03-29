use anchor_lang::prelude::*;

declare_id!("JBTvPecuG2GQTShKFVk48dq3pPMpeLAURmQXuw8Rm4os");

#[program]
pub mod marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
