use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::error::BankErrors;
use crate::state::Bank;

pub fn process_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    msg!("Withdraw started for user: {}", ctx.accounts.user.key());

    let bank_balance = ctx.accounts.bank.balance;
    msg!("Bank balance before withdraw: {}", bank_balance);

    if bank_balance < amount {
      msg!("Withdraw failed: insufficient bank balance.");
        return Err(BankErrors::InsufficientBalance.into());
    }

    let decimals = ctx.accounts.mint.decimals;

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.bank_token_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        authority: ctx.accounts.bank.to_account_info(),
    };

    let user_key = ctx.accounts.user.key();
    let signer_seeds: &[&[&[u8]]] = &[&[user_key.as_ref(), &[ctx.accounts.bank.bump]]];

    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    transfer_checked(cpi_context, amount, decimals)?;

    let bank = &mut ctx.accounts.bank;
    bank.balance -= amount;

    msg!("Bank balance after withdraw: {}", bank.balance);
    msg!("Withdraw successful for user: {}", ctx.accounts.user.key());

    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
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
      seeds = [b"bank",user.key().as_ref()],
      bump
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = user,
      associated_token::token_program = token_program,

    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
}
