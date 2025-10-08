use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bank {
    pub mint_address: Pubkey,
    pub balance: u64,
    pub owner: Pubkey,
    pub bump: u8,
}
