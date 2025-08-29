from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Any
import json
import base64
import asyncio
from ...core.models import ConversationMessage, ConversationRole, SessionStatus
from ...core.session_manager import session_manager
from ...services.openai_service import openai_service
from ...services.elevenlabs_service import elevenlabs_service
from ...services.persona_service import persona_service
from datetime import datetime


class VoiceConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept WebSocket connection for voice communication"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection",
            "status": "connected",
            "message": "Voice connection established",
            "session_id": session_id
        }))
    
    def disconnect(self, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_message(self, session_id: str, message: Dict[str, Any]):
        """Send message to specific session"""
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Failed to send message to {session_id}: {e}")
                # Remove dead connection
                self.disconnect(session_id)
    
    async def send_audio(self, session_id: str, audio_data: bytes, text: str):
        """Send audio data to client"""
        if session_id in self.active_connections:
            # Convert audio to base64 for transmission
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            message = {
                "type": "audio_response",
                "audio_data": audio_base64,
                "text": text,
                "timestamp": datetime.now().isoformat()
            }
            
            await self.send_message(session_id, message)


voice_manager = VoiceConnectionManager()


async def handle_voice_websocket(websocket: WebSocket, session_id: str):
    """Handle WebSocket connection for voice communication"""
    
    # Validate session exists and is active
    session = session_manager.get_session(session_id)
    if not session:
        await websocket.close(code=4004, reason="Session not found")
        return
    
    if session.status != SessionStatus.ACTIVE:
        await websocket.close(code=4003, reason="Session not active")
        return
    
    # Connect to voice manager
    await voice_manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            await process_voice_message(session_id, message_data, websocket)
    
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session: {session_id}")
        voice_manager.disconnect(session_id)
    except Exception as e:
        print(f"WebSocket error for session {session_id}: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Voice processing error: {str(e)}"
            }))
        except:
            pass  # Connection already closed
        voice_manager.disconnect(session_id)


async def process_voice_message(session_id: str, message_data: Dict[str, Any], websocket: WebSocket):
    """Process incoming voice message"""
    message_type = message_data.get("type")
    
    try:
        if message_type == "audio_chunk":
            # Handle audio from candidate
            await handle_audio_input(session_id, message_data, websocket)
        
        elif message_type == "text_message":
            # Handle text message from candidate
            await handle_text_input(session_id, message_data, websocket)
        
        elif message_type == "ping":
            # Handle ping for connection keep-alive
            await websocket.send_text(json.dumps({
                "type": "pong",
                "timestamp": datetime.now().isoformat()
            }))
        
        else:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Unknown message type: {message_type}"
            }))
    
    except Exception as e:
        print(f"Error processing voice message: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Processing error: {str(e)}"
            }))
        except:
            pass  # Connection already closed


async def handle_audio_input(session_id: str, message_data: Dict[str, Any], websocket: WebSocket):
    """Handle audio input from candidate"""
    session = session_manager.get_session(session_id)
    if not session:
        return
    
    try:
        # Get audio data
        audio_base64 = message_data.get("audio_data", "")
        audio_bytes = base64.b64decode(audio_base64)
        
        # Send processing status
        try:
            await websocket.send_text(json.dumps({
                "type": "status",
                "message": "Processing audio...",
                "status": "transcribing"
            }))
        except:
            return  # Connection closed
        
        # Transcribe audio using OpenAI Whisper
        transcribed_text = await openai_service.transcribe_audio(audio_bytes)
        
        # Send transcription result
        try:
            await websocket.send_text(json.dumps({
                "type": "transcription",
                "text": transcribed_text,
                "timestamp": datetime.now().isoformat()
            }))
        except:
            return  # Connection closed
        
        # Process the transcribed text
        await process_candidate_response(session_id, transcribed_text, websocket)
    
    except Exception as e:
        print(f"Audio processing error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Failed to process audio input"
            }))
        except:
            pass  # Connection already closed


async def handle_text_input(session_id: str, message_data: Dict[str, Any], websocket: WebSocket):
    """Handle text input from candidate"""
    text_content = message_data.get("content", "")
    await process_candidate_response(session_id, text_content, websocket)


async def process_candidate_response(session_id: str, content: str, websocket: WebSocket):
    """Process candidate response and generate interviewer reply"""
    session = session_manager.get_session(session_id)
    if not session:
        return
    
    try:
        # Add candidate message to conversation
        candidate_message = ConversationMessage(
            role=ConversationRole.CANDIDATE,
            content=content,
            timestamp=datetime.now()
        )
        session_manager.add_message(session_id, candidate_message)
        
        # Send thinking status
        try:
            await websocket.send_text(json.dumps({
                "type": "status",
                "message": "Generating response...",
                "status": "thinking"
            }))
        except:
            return  # Connection closed
        
        # Generate system prompt
        system_prompt = persona_service.build_system_prompt(session)
        
        # Generate interviewer response
        interviewer_response = await openai_service.generate_interview_response(
            system_prompt=system_prompt,
            conversation_history=session.conversation_history,
            max_tokens=200
        )
        
        # Add interviewer message to conversation
        interviewer_message = ConversationMessage(
            role=ConversationRole.INTERVIEWER,
            content=interviewer_response,
            timestamp=datetime.now()
        )
        session_manager.add_message(session_id, interviewer_message)
        
        # Send text response first
        try:
            await websocket.send_text(json.dumps({
                "type": "text_response",
                "text": interviewer_response,
                "question_count": session.question_count,
                "timestamp": datetime.now().isoformat()
            }))
        except:
            return  # Connection closed
        
        # Generate voice response
        try:
            await websocket.send_text(json.dumps({
                "type": "status",
                "message": "Converting to speech...",
                "status": "generating_voice"
            }))
        except:
            return  # Connection closed
        
        # Convert to speech using ElevenLabs
        audio_data = await elevenlabs_service.text_to_speech(
            interviewer_response, 
            session.config.persona_id
        )
        
        if audio_data:
            # Send audio response
            await voice_manager.send_audio(session_id, audio_data, interviewer_response)
        else:
            # Fallback if TTS fails
            try:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Failed to generate voice response, but text response is available"
                }))
            except:
                pass  # Connection already closed
    
    except Exception as e:
        print(f"Response generation error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Failed to generate interviewer response"
            }))
        except:
            pass  # Connection already closed