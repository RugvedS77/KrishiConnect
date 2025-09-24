from sqlalchemy.orm import Session
from decimal import Decimal
from sqlalchemy import func, case
from models.all_model import Contract as ContractModel, Transaction as TransactionModel

def get_contract_financials(contract: ContractModel, db: Session) -> dict:
    """Calculates the financial summary for a given contract with safe Decimal handling."""

    # Ensure everything is Decimal
    total_value = Decimal(str(contract.quantity_proposed)) * Decimal(str(contract.price_per_unit_agreed))

    # Let DB handle aggregation
    result = (
        db.query(
            func.coalesce(func.sum(case((TransactionModel.type == 'escrow', TransactionModel.amount))), 0),
            func.coalesce(func.sum(case((TransactionModel.type == 'release', TransactionModel.amount))), 0),
        )
        .filter(TransactionModel.contract_id == contract.id)
        .first()
    )

    escrowed_amount, released_amount = result

    # Force Decimal consistency
    escrowed_amount = Decimal(str(escrowed_amount))
    released_amount = Decimal(str(released_amount))

    return {
        "total_value": total_value,
        "escrow_amount": escrowed_amount - released_amount,  # i.e. balance still in escrow
        "amount_paid": released_amount
    }
