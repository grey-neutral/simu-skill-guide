from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Keys
    openai_api_key: str
    elevenlabs_api_key: str
    
    # CORS Configuration
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:8080"
    
    # Session Configuration
    max_session_duration: int = 3600  # 1 hour in seconds
    max_concurrent_sessions: int = 10
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env


settings = Settings()