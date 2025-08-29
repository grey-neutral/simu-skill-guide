from typing import Dict, Optional, List
from datetime import datetime
import threading
from .models import InterviewSession, InterviewConfig, ConversationMessage, SessionStatus
from .config import settings


class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, InterviewSession] = {}
        self._lock = threading.Lock()
    
    def create_session(self, config: InterviewConfig) -> str:
        """Create a new interview session"""
        with self._lock:
            # Check concurrent session limit
            active_sessions = len([s for s in self._sessions.values() 
                                 if s.status in [SessionStatus.PENDING, SessionStatus.ACTIVE]])
            
            if active_sessions >= settings.max_concurrent_sessions:
                raise ValueError("Maximum concurrent sessions reached")
            
            session = InterviewSession(config=config)
            self._sessions[session.session_id] = session
            
            return session.session_id
    
    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        """Get session by ID"""
        with self._lock:
            return self._sessions.get(session_id)
    
    def update_session(self, session_id: str, updates: dict) -> bool:
        """Update session with provided data"""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            
            for key, value in updates.items():
                if hasattr(session, key):
                    setattr(session, key, value)
            
            return True
    
    def start_session(self, session_id: str) -> bool:
        """Mark session as active"""
        return self.update_session(session_id, {
            "status": SessionStatus.ACTIVE,
            "start_time": datetime.now()
        })
    
    def complete_session(self, session_id: str) -> bool:
        """Mark session as completed"""
        return self.update_session(session_id, {
            "status": SessionStatus.COMPLETED,
            "end_time": datetime.now()
        })
    
    def add_message(self, session_id: str, message: ConversationMessage) -> bool:
        """Add message to conversation history"""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            
            session.conversation_history.append(message)
            if message.role.value == "interviewer":
                session.current_question = message.content
                session.question_count += 1
            
            return True
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False
    
    def get_active_sessions(self) -> List[InterviewSession]:
        """Get all active sessions"""
        with self._lock:
            return [s for s in self._sessions.values() 
                   if s.status in [SessionStatus.PENDING, SessionStatus.ACTIVE]]
    
    def cleanup_expired_sessions(self):
        """Remove sessions that have exceeded max duration"""
        with self._lock:
            now = datetime.now()
            expired_sessions = []
            
            for session_id, session in self._sessions.items():
                if session.start_time:
                    duration = now - session.start_time
                    if duration.total_seconds() > settings.max_session_duration:
                        expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                del self._sessions[session_id]
    
    def get_session_duration(self, session_id: str) -> str:
        """Get formatted session duration"""
        session = self.get_session(session_id)
        if not session or not session.start_time:
            return "00:00"
        
        end_time = session.end_time or datetime.now()
        duration = end_time - session.start_time
        
        minutes = int(duration.total_seconds() // 60)
        seconds = int(duration.total_seconds() % 60)
        
        return f"{minutes:02d}:{seconds:02d}"


# Global session manager instance
session_manager = SessionManager()