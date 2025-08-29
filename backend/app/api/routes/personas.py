from fastapi import APIRouter
from typing import List
from ...core.models import PersonaInfo
from ...services.persona_service import persona_service

router = APIRouter()

@router.get("/personas", response_model=List[PersonaInfo])
async def get_personas():
    """Get all available interviewer personas"""
    return persona_service.get_all_personas()