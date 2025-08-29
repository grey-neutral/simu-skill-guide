from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ...core.models import (
    InterviewConfig, 
    SessionStartResponse, 
    SessionStatusResponse, 
    InterviewFeedback,
    SessionStatus
)
from ...core.session_manager import session_manager
from ...services.persona_service import persona_service
from ...services.openai_service import openai_service

router = APIRouter()

@router.post("/interview/start", response_model=SessionStartResponse)
async def start_interview(config: InterviewConfig):
    """Start a new interview session"""
    try:
        # Create new session
        session_id = session_manager.create_session(config)
        
        # Start the session
        session_manager.start_session(session_id)
        
        # Get the session to generate greeting
        session = session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        # Generate initial greeting
        initial_greeting = persona_service.get_initial_greeting(session)
        
        return SessionStartResponse(
            session_id=session_id,
            initial_greeting=initial_greeting,
            status=SessionStatus.ACTIVE
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@router.get("/interview/status/{session_id}", response_model=SessionStatusResponse)
async def get_interview_status(session_id: str):
    """Get current interview session status"""
    session = session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    duration = session_manager.get_session_duration(session_id)
    
    return SessionStatusResponse(
        session_id=session_id,
        status=session.status,
        question_count=session.question_count,
        duration=duration,
        current_question=session.current_question
    )

@router.post("/interview/stop/{session_id}", response_model=InterviewFeedback)
async def stop_interview(session_id: str):
    """Stop interview session and generate feedback"""
    session = session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status == SessionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Session already completed")
    
    try:
        # Mark session as completed
        session_manager.complete_session(session_id)
        
        # Generate feedback using OpenAI
        feedback = await openai_service.generate_feedback(session)
        
        # Clean up session after a delay (optional)
        # Could implement background task here
        
        return feedback
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate feedback: {str(e)}")

@router.post("/interview/message/{session_id}")
async def add_message_to_conversation(session_id: str, message_data: Dict[str, Any]):
    """Add a message to the conversation and get interviewer response"""
    session = session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Session is not active")
    
    try:
        from ...core.models import ConversationMessage, ConversationRole
        from datetime import datetime
        
        # Add candidate message
        candidate_message = ConversationMessage(
            role=ConversationRole.CANDIDATE,
            content=message_data.get("content", ""),
            timestamp=datetime.now()
        )
        
        session_manager.add_message(session_id, candidate_message)
        
        # Generate system prompt
        system_prompt = persona_service.build_system_prompt(session)
        
        # Generate interviewer response
        interviewer_response = await openai_service.generate_interview_response(
            system_prompt=system_prompt,
            conversation_history=session.conversation_history
        )
        
        # Add interviewer message
        interviewer_message = ConversationMessage(
            role=ConversationRole.INTERVIEWER,
            content=interviewer_response,
            timestamp=datetime.now()
        )
        
        session_manager.add_message(session_id, interviewer_message)
        
        return {
            "response": interviewer_response,
            "question_count": session.question_count,
            "session_status": session.status
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")