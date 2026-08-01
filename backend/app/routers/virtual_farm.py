from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.database import get_db
from app.services.virtual_farm_service import get_virtual_farm_state, run_what_if_simulation

router = APIRouter(prefix="/virtual-farm", tags=["Virtual Farm Simulator"])


class WhatIfSimulationRequest(BaseModel):
    farm_id: int = 1
    irrigation_level_pct: float = Field(60.0, ge=0.0, le=100.0)
    rainfall_mm: float = Field(20.0, ge=0.0, le=200.0)
    temperature_c: float = Field(32.0, ge=10.0, le=50.0)
    fertilizer_npk_pct: float = Field(80.0, ge=0.0, le=100.0)
    scenario_name: str = "Scenario 1"


@router.get("/state/{farm_id}")
def get_farm_state(farm_id: int, db: Session = Depends(get_db)):
    """Retrieve current physical virtual farm state for a farm."""
    try:
        return get_virtual_farm_state(db, farm_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/simulate")
def simulate_scenario_post(req: WhatIfSimulationRequest, db: Session = Depends(get_db)):
    """Run what-if scenario simulation for a farm (POST method)."""
    try:
        return run_what_if_simulation(
            db,
            farm_id=req.farm_id,
            irrigation_level_pct=req.irrigation_level_pct,
            rainfall_mm=req.rainfall_mm,
            temperature_c=req.temperature_c,
            fertilizer_npk_pct=req.fertilizer_npk_pct,
            scenario_name=req.scenario_name
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/simulate")
def simulate_scenario_get(
    farm_id: int = Query(1),
    irrigation_level_pct: float = Query(60.0),
    rainfall_mm: float = Query(20.0),
    temperature_c: float = Query(32.0),
    fertilizer_npk_pct: float = Query(80.0),
    scenario_name: str = Query("Scenario 1"),
    db: Session = Depends(get_db)
):
    """Run what-if scenario simulation for a farm (GET method fallback)."""
    try:
        return run_what_if_simulation(
            db,
            farm_id=farm_id,
            irrigation_level_pct=irrigation_level_pct,
            rainfall_mm=rainfall_mm,
            temperature_c=temperature_c,
            fertilizer_npk_pct=fertilizer_npk_pct,
            scenario_name=scenario_name
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
