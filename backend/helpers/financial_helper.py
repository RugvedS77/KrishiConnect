from sqlalchemy.orm import Session
from decimal import Decimal
from models.all_model import Contract as ContractModel, Transaction as TransactionModel

def get_contract_financials(contract: ContractModel, db: Session) -> dict:
    """Calculates the financial summary for a given contract."""
    transactions = db.query(TransactionModel).filter(TransactionModel.contract_id == contract.id).all()

    # Ensure the calculation is always done with Decimals for precision
    total_value = Decimal(contract.quantity_proposed) * contract.price_per_unit_agreed

    escrowed_amount = sum(t.amount for t in transactions if t.type == 'escrow')
    released_amount = sum(t.amount for t in transactions if t.type == 'release')

    return {
        "total_value": total_value,
        "escrow_amount": escrowed_amount - released_amount,
        "amount_paid": released_amount
    }