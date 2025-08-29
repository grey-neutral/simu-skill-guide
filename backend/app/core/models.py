from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
import uuid


class InterviewType(str, Enum):
    FIRST_ROUND = "first-round"
    FINAL_ROUND = "final-round"
    TECHNICAL = "technical"
    CULTURAL_FIT = "cultural-fit"
    GENERAL = "general"
    SALARY_NEGOTIATION = "salary-negotiation"


class InterviewLength(str, Enum):
    QUICK = "quick"  # 5-10 min
    STANDARD = "standard"  # 25-30 min
    EXTENDED = "extended"  # 45-60 min


class PersonaId(str, Enum):
    HR_FRIENDLY = "hr-friendly"
    MANAGER_CRITICAL = "manager-critical"
    TECH_EXPERT = "tech-expert"
    STRESS_INTERVIEWER = "stress-interviewer"
    CEO_EXECUTIVE = "ceo-executive"


class SessionStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    ERROR = "error"


class ConversationRole(str, Enum):
    INTERVIEWER = "interviewer"
    CANDIDATE = "candidate"


# Request/Response Models
class InterviewConfig(BaseModel):
    persona_id: PersonaId
    interview_type: InterviewType
    interview_length: InterviewLength
    job_description: str = Field(..., min_length=10, max_length=2000)
    cv_text: Optional[str] = None


class ConversationMessage(BaseModel):
    role: ConversationRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    audio_url: Optional[str] = None


class InterviewSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    config: InterviewConfig
    status: SessionStatus = SessionStatus.PENDING
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    conversation_history: List[ConversationMessage] = Field(default_factory=list)
    current_question: Optional[str] = None
    question_count: int = 0


# Response Models
class CVExtractionResponse(BaseModel):
    success: bool
    extracted_text: str = ""
    error_message: Optional[str] = None


class InterviewFeedback(BaseModel):
    session_id: str
    scores: Dict[str, float] = Field(description="Scores for confidence, clarity, overall_fit (0-10)")
    improvements: List[str] = Field(description="List of improvement suggestions")
    conversation_summary: str
    duration: str = Field(description="Duration in MM:SS format")
    total_questions: int
    completed_at: datetime = Field(default_factory=datetime.now)


class SessionStartResponse(BaseModel):
    session_id: str
    initial_greeting: str
    status: SessionStatus


class SessionStatusResponse(BaseModel):
    session_id: str
    status: SessionStatus
    question_count: int
    duration: str
    current_question: Optional[str] = None


class PersonaInfo(BaseModel):
    id: PersonaId
    name: str
    description: str
    style: str
    difficulty: str
    voice_id: Optional[str] = None  # ElevenLabs voice ID


# WebSocket Message Models
class VoiceMessage(BaseModel):
    type: str  # "audio", "text", "status"
    data: str  # base64 audio data or text content
    timestamp: datetime = Field(default_factory=datetime.now)


class VoiceResponse(BaseModel):
    type: str  # "audio", "text", "error"
    data: str
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.now)