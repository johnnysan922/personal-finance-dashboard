from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.portfolio import PositionRow
from app.schemas.portfolio import PositionCreate, PositionRead

router = APIRouter()


def _to_read(row: PositionRow) -> PositionRead:
    return PositionRead(
        id=row.id,
        symbol=row.symbol,
        quantity=row.quantity,
        averageCost=row.average_cost,
    )


@router.get("/portfolio", response_model=list[PositionRead])
def list_positions(db: Session = Depends(get_db)) -> list[PositionRead]:
    rows = db.scalars(select(PositionRow).order_by(PositionRow.id.asc())).all()
    return [_to_read(r) for r in rows]


@router.post("/portfolio", response_model=PositionRead, status_code=201)
def create_position(
    body: PositionCreate,
    db: Session = Depends(get_db),
) -> PositionRead:
    sym = body.symbol.strip().upper()
    if not sym:
        raise HTTPException(status_code=400, detail="Invalid symbol")
    row = PositionRow(
        symbol=sym,
        quantity=body.quantity,
        average_cost=body.averageCost,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_read(row)
