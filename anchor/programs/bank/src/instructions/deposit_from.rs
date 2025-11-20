use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::error::BankErrors;
use crate::state::Bank;

pub fn process_deposit_from(ctx: Context<DepositFrom>, amount: u64) -> Result<()> {
    msg!("DepositFrom started by user: {}", ctx.accounts.user.key());
    let from_user_balance = ctx.accounts.from_token_account.amount;

    if from_user_balance < amount {
        msg!("Deposit failed: insufficient balance: {}", from_user_balance);
        return Err(BankErrors::InsufficientBalance.into());
    }

    let decimals = ctx.accounts.mint.decimals;

    let bank = &mut ctx.accounts.bank;
    msg!("Bank balance before deposit of user: {}", bank.balance);

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.from_token_account.to_account_info(),
        to: ctx.accounts.bank_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };

    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer_checked(cpi_context, amount, decimals)?;

    let bank = &mut ctx.accounts.bank;
    bank.balance += amount;

    msg!("Bank balance after deposit of user: {}", bank.balance);
    msg!("Deposit successful for user: {}", ctx.accounts.user.key());

    Ok(())
}

#[derive(Accounts)]
pub struct DepositFrom<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [user.key().as_ref()],
        bump
    )]
    pub bank: Account<'info, Bank>,

    #[account(
        mut,
        seeds = [b"bank", user.key().as_ref()],
        bump
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    pub from_user: SystemAccount<'info>,

    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = from_user,
      associated_token::token_program = token_program,

    )]
    pub from_token_account: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
}
