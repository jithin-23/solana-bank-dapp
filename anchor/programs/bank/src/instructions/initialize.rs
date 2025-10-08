use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::state::Bank;

pub fn process_initialize(ctx: Context<Initialize>) -> Result<()> {
    msg!(
        "Initializing bank account for user: {}",
        ctx.accounts.user.key()
    );
    msg!("Using mint address: {}", ctx.accounts.mint.key());

    let bank = &mut ctx.accounts.bank;
    bank.mint_address = ctx.accounts.mint.key();
    bank.owner = ctx.accounts.user.key();
    bank.balance = 0;
    bank.bump = ctx.bumps.bank;

    msg!("Bank owner set to: {}", bank.owner);
    msg!(
        "Associated bank token account: {}",
        ctx.accounts.bank_token_account.key()
    );
    msg!("Initialization process completed successfully.");

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      init,
      payer=user,
      space= 8 + Bank::INIT_SPACE,
      seeds=[user.key().as_ref()],
      bump
    )]
    pub bank: Account<'info, Bank>,

    #[account(
      init,
      token::mint = mint,
      token::authority = bank,
      payer = user,
      seeds = [b"bank",user.key().as_ref()],
      bump
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}
