from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    INTERNAL_API_SECRET: str = "studysync-internal-secret-2026"
    
    # Neon PostgreSQL
    DATABASE_URL: str = ""
    
    # Google Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-2"
    
    # Cloudflare R2
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "study-sync"
    R2_ENDPOINT_URL: str = ""
    
    # Sentry
    SENTRY_DSN: str = ""

    @property
    def r2_endpoint(self) -> str:
        if self.R2_ENDPOINT_URL:
            return self.R2_ENDPOINT_URL
        if self.R2_ACCOUNT_ID:
            return f"https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        return ""

    class Config:
        from pathlib import Path
        env_file = str(Path(__file__).resolve().parent.parent / ".env")
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
