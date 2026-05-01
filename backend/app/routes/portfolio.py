from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.portfolio import PositionRow
from app.schemas.portfolio import PositionCreate, PositionRead, PositionUpdate

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


@router.patch("/portfolio/{position_id}", response_model=PositionRead)
def update_position(
    position_id: int,
    body: PositionUpdate,
    db: Session = Depends(get_db),
) -> PositionRead:
    row = db.get(PositionRow, position_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Position not found")

    if body.symbol is not None:
        sym = body.symbol.strip().upper()
        if not sym:
            raise HTTPException(status_code=400, detail="Invalid symbol")
        row.symbol = sym
    if body.quantity is not None:
        row.quantity = body.quantity
    if body.averageCost is not None:
        row.average_cost = body.averageCost

    db.commit()
    db.refresh(row)
    return _to_read(row)


@router.delete("/portfolio/{position_id}", status_code=204)
def delete_position(position_id: int, db: Session = Depends(get_db)) -> None:
    row = db.get(PositionRow, position_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Position not found")
    db.delete(row)
    db.commit()
