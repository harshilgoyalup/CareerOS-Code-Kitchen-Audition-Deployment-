from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerOS Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # Google Cloud & Firebase Settings
    GCP_PROJECT_ID: str = "coding-ninja-74acf"
    GOOGLE_CLOUD_PROJECT: str = ""
    GCP_REGION: str = "us-central1"
    GOOGLE_CLOUD_LOCATION: str = "us-central1"
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    FIREBASE_PROJECT_ID: str = "coding-ninja-74acf"
    FIREBASE_SERVICE_ACCOUNT_PATH: str = ""
    
    # Gemini Enterprise Agent Platform / Vertex AI Settings
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_API_KEY: str = ""
    
    # Internal Cloud Scheduler Secret for authentication
    INTERNAL_SCHEDULER_SECRET: str = "careeros-scheduler-dev-key"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "https://careeros.app",
        "*"
    ]
    
    # Enable In-Memory / Test Store when cloud credentials are not supplied
    USE_MOCK_STORAGE: bool = True
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

    def get_project_id(self) -> str:
        return self.GOOGLE_CLOUD_PROJECT or self.GCP_PROJECT_ID

settings = Settings()

