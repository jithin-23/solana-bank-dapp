use anchor_lang::prelude::*;

#[error_code]
pub enum BankErrors {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    
    #[msg("Insufficient balance for this operation")]
    InsufficientBalance,
    
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    
    #[msg("Allowance exceeded")]
    AllowanceExceeded,
    
    #[msg("Cannot approve yourself")]
    SelfApproval,
}
