from typing import Dict, List
from ..core.models import PersonaId, InterviewType, InterviewSession, PersonaInfo


class PersonaService:
    def __init__(self):
        self.personas = {
            PersonaId.HR_FRIENDLY: {
                "name": "Sarah Chen",
                "description": "Warm and encouraging HR manager who focuses on getting to know you as a person. Creates a comfortable environment to discuss your background and motivations.",
                "style": "Supportive and conversational",
                "difficulty": "Easy",
                "voice_id": "21m00Tcm4TlvDq8ikWAM"
            },
            PersonaId.MANAGER_CRITICAL: {
                "name": "Robert Martinez", 
                "description": "Experienced hiring manager with high standards. Asks challenging questions about your experience and expects detailed, well-thought-out responses.",
                "style": "Direct and analytical",
                "difficulty": "Hard",
                "voice_id": "8sZxD42zKDvoEXNxBTdX"
            },
            PersonaId.TECH_EXPERT: {
                "name": "Dr. Emily Watson",
                "description": "Technical lead with deep expertise. Focuses on problem-solving abilities, technical knowledge, and how you approach complex challenges.",
                "style": "Technical and precise", 
                "difficulty": "Medium",
                "voice_id": "pNInz6obpgDQGcFmaJgB"
            },
            PersonaId.STRESS_INTERVIEWER: {
                "name": "Marcus Thompson",
                "description": "Tests your performance under pressure with rapid-fire questions and challenging scenarios. Designed to see how you handle stress and think on your feet.",
                "style": "Intense and fast-paced",
                "difficulty": "Hard",
                "voice_id": "DMyrgzQFny3JI1Y1paM5"
            },
            PersonaId.CEO_EXECUTIVE: {
                "name": "James Wilson",
                "description": "Senior executive who evaluates strategic thinking and leadership potential. Focuses on big-picture thinking and cultural fit at the executive level.",
                "style": "Strategic and visionary",
                "difficulty": "Medium", 
                "voice_id": "TX3LPaxmHKxFdv7VOQHJ"
            }
        }
    
    def get_all_personas(self) -> List[PersonaInfo]:
        """Get all available personas"""
        personas_list = []
        for persona_id, data in self.personas.items():
            personas_list.append(PersonaInfo(
                id=persona_id,
                name=data["name"],
                description=data["description"],
                style=data["style"],
                difficulty=data["difficulty"],
                voice_id=data["voice_id"]
            ))
        return personas_list
    
    def get_persona_config(self, persona_id: PersonaId) -> Dict:
        """Get configuration for a specific persona"""
        return self.personas.get(persona_id, self.personas[PersonaId.HR_FRIENDLY])
    
    def build_system_prompt(self, session: InterviewSession) -> str:
        """Build dynamic system prompt for the interview"""
        persona_config = self.get_persona_config(session.config.persona_id)
        
        # Base prompt template
        base_prompt = f"""You are {persona_config['name']}, a professional interviewer with the following characteristics:
- Style: {persona_config['style']}
- Approach: {persona_config['description']}

INTERVIEW CONTEXT:
- Interview Type: {session.config.interview_type.replace('-', ' ').title()}
- Interview Length: {session.config.interview_length}
- Job Description: {session.config.job_description}
"""
        
        # Add CV context if available
        if session.config.cv_text:
            cv_summary = self._extract_cv_summary(session.config.cv_text)
            base_prompt += f"\nCANDIDATE BACKGROUND:\n{cv_summary}\n"
        
        # Add persona-specific instructions
        persona_instructions = self._get_persona_instructions(session.config.persona_id, session.config.interview_type)
        base_prompt += f"\nINTERVIEWER INSTRUCTIONS:\n{persona_instructions}"
        
        # Add conversation guidelines
        base_prompt += f"""

CONVERSATION GUIDELINES:
- Keep responses concise (1-3 sentences max)
- Ask one question at a time
- Listen actively to the candidate's responses
- Follow up naturally based on their answers
- Maintain your persona's style throughout
- End the interview naturally after {self._get_question_count(session.config.interview_length)} questions

Current question count: {session.question_count}
"""
        
        return base_prompt
    
    def _get_persona_instructions(self, persona_id: PersonaId, interview_type: InterviewType) -> str:
        """Get specific instructions for persona and interview type combination"""
        instructions = {
            PersonaId.HR_FRIENDLY: {
                "base": "Be warm and encouraging. Focus on cultural fit, motivations, and personal experiences.",
                InterviewType.FIRST_ROUND: "Start with icebreaker questions and basic background.",
                InterviewType.CULTURAL_FIT: "Explore values, work style preferences, and team collaboration.",
                InterviewType.SALARY_NEGOTIATION: "Be supportive but realistic about compensation discussions."
            },
            PersonaId.MANAGER_CRITICAL: {
                "base": "Be direct and analytical. Challenge responses and dig deeper into specifics.",
                InterviewType.TECHNICAL: "Focus on problem-solving methodology and technical depth.",
                InterviewType.FINAL_ROUND: "Evaluate leadership potential and decision-making skills.",
                InterviewType.GENERAL: "Ask challenging behavioral questions with follow-ups."
            },
            PersonaId.TECH_EXPERT: {
                "base": "Focus on technical competency, problem-solving approach, and system design.",
                InterviewType.TECHNICAL: "Ask detailed technical questions and coding problems.",
                InterviewType.FIRST_ROUND: "Assess fundamental technical knowledge.",
                InterviewType.GENERAL: "Balance technical and soft skills evaluation."
            },
            PersonaId.STRESS_INTERVIEWER: {
                "base": "Create pressure through rapid-fire questions and challenging scenarios.",
                InterviewType.TECHNICAL: "Present complex problems with time pressure.",
                InterviewType.FINAL_ROUND: "Test decision-making under stress.",
                InterviewType.GENERAL: "Use interruptions and follow-up questions to create pressure."
            },
            PersonaId.CEO_EXECUTIVE: {
                "base": "Evaluate strategic thinking, leadership, and long-term vision.",
                InterviewType.FINAL_ROUND: "Focus on executive presence and strategic decision-making.",
                InterviewType.CULTURAL_FIT: "Assess alignment with company vision and values.",
                InterviewType.GENERAL: "Explore big-picture thinking and industry insights."
            }
        }
        
        persona_instructions = instructions.get(persona_id, instructions[PersonaId.HR_FRIENDLY])
        base_instruction = persona_instructions["base"]
        specific_instruction = persona_instructions.get(interview_type, "")
        
        return f"{base_instruction} {specific_instruction}".strip()
    
    def _extract_cv_summary(self, cv_text: str) -> str:
        """Extract key information from CV text"""
        # Simple extraction - in a real system, you might use NLP
        lines = cv_text.split('\n')
        
        # Take first 500 characters as summary
        summary = cv_text[:500] + "..." if len(cv_text) > 500 else cv_text
        
        return summary
    
    def _get_question_count(self, interview_length: str) -> int:
        """Get expected number of questions based on interview length"""
        question_counts = {
            "quick": 3,     # 5-10 min
            "standard": 6,  # 25-30 min  
            "extended": 10  # 45-60 min
        }
        return question_counts.get(interview_length, 6)
    
    def get_initial_greeting(self, session: InterviewSession) -> str:
        """Generate initial greeting based on persona"""
        persona_config = self.get_persona_config(session.config.persona_id)
        
        greetings = {
            PersonaId.HR_FRIENDLY: f"Hello! I'm {persona_config['name']}, and I'm excited to speak with you today. How are you feeling about this interview?",
            PersonaId.MANAGER_CRITICAL: f"Good day. I'm {persona_config['name']}, the hiring manager for this position. Let's dive right in - tell me about your most relevant experience for this role.",
            PersonaId.TECH_EXPERT: f"Hi there, I'm {persona_config['name']}. I'll be evaluating your technical skills today. Are you ready to discuss some challenging problems?",
            PersonaId.STRESS_INTERVIEWER: f"I'm {persona_config['name']}. This will be a fast-paced interview - I hope you're prepared. What's your biggest weakness?",
            PersonaId.CEO_EXECUTIVE: f"Welcome. I'm {persona_config['name']}, and I'm here to understand your strategic thinking. What's your vision for this industry in the next 5 years?"
        }
        
        return greetings.get(session.config.persona_id, greetings[PersonaId.HR_FRIENDLY])


# Global service instance  
persona_service = PersonaService()