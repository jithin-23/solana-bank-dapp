use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{error::BankErrors, state::Bank};

pub fn process_transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    msg!(
        "Transfer started from user: {} to user: {}",
        ctx.accounts.from.key(),
        ctx.accounts.to.key()
    );
    let from_bank = &mut ctx.accounts.from_bank;
    let to_bank = &mut ctx.accounts.to_bank;

    msg!("From bank balance before transfer: {}", from_bank.balance);
    msg!("To bank balance before transfer: {}", to_bank.balance);

    if from_bank.balance < amount {
        msg!("Transfer failed: insufficient balance in sender's bank.");
        return Err(BankErrors::InsufficientBalance.into());
    }

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.from_bank_token_account.to_account_info(),
        to: ctx.accounts.to_token_account.to_account_info(),
        authority: ctx.accounts.from_bank.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
    };
    let user_key = ctx.accounts.from.key();
    let signer_seeds: &[&[&[u8]]] = &[&[user_key.as_ref(), &[ctx.accounts.from_bank.bump]]];
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    let decimals = ctx.accounts.mint.decimals;
    transfer_checked(cpi_context, amount, decimals)?;

    msg!("Token transfer successful.");

    let from_bank = &mut ctx.accounts.from_bank;
    let to_bank = &mut ctx.accounts.to_bank;

    from_bank.balance -= amount;
    to_bank.balance += amount;

    msg!("From bank balance after transfer: {}", from_bank.balance);
    msg!("To bank balance after transfer: {}", to_bank.balance);
    Ok(())
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub from: Signer<'info>,

    pub to: SystemAccount<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      seeds = [from.key().as_ref()],
      bump
    )]
    pub from_bank: Account<'info, Bank>,

    #[account(
      mut,
      seeds = [to.key().as_ref()],
      bump
    )]
    pub to_bank: Account<'info, Bank>,

    #[account(
      mut,
      seeds = [b"bank",from.key().as_ref()],
      bump
    )]
    pub from_bank_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = from,
      associated_token::token_program = token_program
    )]
    pub to_token_account: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub token_program: Interface<'info, TokenInterface>,
}
