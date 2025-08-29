from elevenlabs.client import ElevenLabs
from typing import Dict, List, Optional
import asyncio
from ..core.config import settings
from ..core.models import PersonaId


class ElevenLabsService:
    def __init__(self):
        self.client = ElevenLabs(api_key=settings.elevenlabs_api_key)
        
        # Map personas to ElevenLabs voice IDs
        self.persona_voices = {
            PersonaId.HR_FRIENDLY: "21m00Tcm4TlvDq8ikWAM",  # Rachel - warm female voice
            PersonaId.MANAGER_CRITICAL: "29vD33N1CtxCmqQRPOHJ",  # Drew - authoritative male
            PersonaId.TECH_EXPERT: "pNInz6obpgDQGcFmaJgB",  # Adam - clear male voice
            PersonaId.STRESS_INTERVIEWER: "Yko7PKHZNXotIFUBG7I9",  # Antoni - intense male
            PersonaId.CEO_EXECUTIVE: "TX3LPaxmHKxFdv7VOQHJ",  # Liam - professional male
        }
    
    async def text_to_speech(self, text: str, persona_id: PersonaId) -> bytes:
        """Convert text to speech using ElevenLabs"""
        try:
            voice_id = self.persona_voices.get(persona_id, self.persona_voices[PersonaId.HR_FRIENDLY])
            
            # Use the correct API method
            audio = self.client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            
            # Convert generator/iterator to bytes if needed
            if hasattr(audio, '__iter__') and not isinstance(audio, bytes):
                audio_bytes = b"".join(audio)
            else:
                audio_bytes = audio
                
            return audio_bytes
        
        except Exception as e:
            print(f"ElevenLabs TTS error: {e}")
            # Return empty bytes on error
            return b""
    
    async def get_available_voices(self) -> List[Dict]:
        """Get list of available voices from ElevenLabs"""
        try:
            voices = self.client.voices.get_all()
            
            voice_list = []
            for voice in voices.voices:
                voice_list.append({
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category,
                    "description": getattr(voice, 'description', ''),
                })
            
            return voice_list
        
        except Exception as e:
            print(f"ElevenLabs voices error: {e}")
            return []
    
    def get_persona_voice_id(self, persona_id: PersonaId) -> str:
        """Get voice ID for a specific persona"""
        return self.persona_voices.get(persona_id, self.persona_voices[PersonaId.HR_FRIENDLY])
    
    async def stream_text_to_speech(self, text: str, persona_id: PersonaId):
        """Stream text to speech for real-time applications"""
        try:
            voice_id = self.persona_voices.get(persona_id, self.persona_voices[PersonaId.HR_FRIENDLY])
            
            # Generate streaming audio
            audio_stream = self.client.text_to_speech.stream(
                text=text,
                voice_id=voice_id,
                model_id="eleven_multilingual_v2"
            )
            
            for chunk in audio_stream:
                if isinstance(chunk, bytes):
                    yield chunk
        
        except Exception as e:
            print(f"ElevenLabs streaming error: {e}")
            yield b""


# Global service instance
elevenlabs_service = ElevenLabsService()