import openai
from typing import List, Dict, Any
from ..core.models import InterviewSession, InterviewFeedback, ConversationMessage
from ..core.config import settings
import json
import asyncio


class OpenAIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def generate_interview_response(
        self, 
        system_prompt: str, 
        conversation_history: List[ConversationMessage],
        max_tokens: int = 150
    ) -> str:
        """Generate interviewer response using GPT-4"""
        try:
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history
            for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                messages.append({
                    "role": "assistant" if msg.role.value == "interviewer" else "user",
                    "content": msg.content
                })
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
                presence_penalty=0.6,
                frequency_penalty=0.3
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return "I apologize, but I'm experiencing some technical difficulties. Could you please repeat your response?"
    
    async def generate_feedback(self, session: InterviewSession) -> InterviewFeedback:
        """Generate comprehensive interview feedback"""
        try:
            # Prepare conversation context
            conversation_text = ""
            candidate_responses = []
            
            for msg in session.conversation_history:
                if msg.role.value == "interviewer":
                    conversation_text += f"Interviewer: {msg.content}\n"
                else:
                    conversation_text += f"Candidate: {msg.content}\n"
                    candidate_responses.append(msg.content)
            
            # Create feedback prompt
            feedback_prompt = f"""
You are an expert interview coach. Analyze this interview conversation and provide detailed feedback.

Job Description: {session.config.job_description}
Interview Type: {session.config.interview_type}
Persona: {session.config.persona_id}

Conversation:
{conversation_text}

Please provide feedback in this exact JSON format:
{{
    "confidence": <score 0-10>,
    "clarity": <score 0-10>,
    "overall_fit": <score 0-10>,
    "improvements": [
        "Specific improvement suggestion 1",
        "Specific improvement suggestion 2",
        "Specific improvement suggestion 3"
    ],
    "conversation_summary": "Brief summary of the candidate's performance and key points discussed"
}}

Scoring criteria:
- Confidence: Body language, tone, assertiveness, hesitation
- Clarity: Communication skills, structure, articulation
- Overall_fit: Relevant experience, cultural alignment, role suitability

Focus on actionable, specific feedback that will help the candidate improve.
"""
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": feedback_prompt}],
                max_tokens=500,
                temperature=0.3
            )
            
            # Parse JSON response
            feedback_data = json.loads(response.choices[0].message.content.strip())
            
            from ..core.session_manager import session_manager
            duration = session_manager.get_session_duration(session.session_id)
            
            return InterviewFeedback(
                session_id=session.session_id,
                scores=feedback_data["scores"] if "scores" in feedback_data else {
                    "confidence": feedback_data.get("confidence", 7.0),
                    "clarity": feedback_data.get("clarity", 7.0),
                    "overall_fit": feedback_data.get("overall_fit", 7.0)
                },
                improvements=feedback_data.get("improvements", [
                    "Practice speaking more confidently",
                    "Provide more specific examples",
                    "Improve technical communication"
                ]),
                conversation_summary=feedback_data.get("conversation_summary", "Interview completed successfully."),
                duration=duration,
                total_questions=session.question_count
            )
        
        except Exception as e:
            print(f"Feedback generation error: {e}")
            # Return default feedback on error
            from ..core.session_manager import session_manager
            duration = session_manager.get_session_duration(session.session_id)
            
            return InterviewFeedback(
                session_id=session.session_id,
                scores={"confidence": 7.0, "clarity": 7.0, "overall_fit": 7.0},
                improvements=[
                    "Practice speaking more confidently during interviews",
                    "Provide more specific examples when discussing experience",
                    "Work on structuring responses more clearly"
                ],
                conversation_summary="Interview session completed. Continue practicing to improve your skills.",
                duration=duration,
                total_questions=session.question_count
            )
    
    async def transcribe_audio(self, audio_data: bytes, format: str = "wav") -> str:
        """Transcribe audio using OpenAI Whisper"""
        try:
            # Create a temporary file-like object
            import io
            audio_file = io.BytesIO(audio_data)
            audio_file.name = f"audio.{format}"
            
            transcript = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
            
            return transcript.strip()
        
        except Exception as e:
            print(f"Whisper transcription error: {e}")
            return "Sorry, I couldn't understand that. Could you please speak clearly?"


# Global service instance
openai_service = OpenAIService()