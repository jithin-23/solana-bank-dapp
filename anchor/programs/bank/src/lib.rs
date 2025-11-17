#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::*;

pub mod error;
pub mod state;

declare_id!("9ojBDTe6p69cwfk5b2x8McD8TtFieAgTQdvWzDYpXs2z");

#[program]
pub mod bank {

    use super::*;

    pub fn init_bank(ctx: Context<Initialize>) -> Result<()> {
        process_initialize(ctx)?;
        Ok(())
    }

    // Instruction to send tokens to bank for safekeeping
    pub fn deposit_to_bank(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        process_deposit(ctx, amount)?;
        Ok(())
    }

    // Instruction to withdraw tokens from user's bank
    pub fn withdraw_from_bank(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        process_withdraw(ctx, amount)?;
        Ok(())
    }

    // Instruction to transfer tokens to another person from the user's bank
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        process_transfer(ctx, amount)?;
        Ok(())
    }

    pub fn deposit_from(ctx: Context<DepositFrom>, amount: u64) -> Result<()> {
        process_deposit_from(ctx, amount)?;
        Ok(())
    }

    // Instruction to send token from another person's bank to do later
    // pub fn transfer_from(ctx: Context<TransferFrom>, from: Pubkey, to: Pubkey, amount: u64 ) -> Result<()> {
    //     Ok(())
    // }
}
