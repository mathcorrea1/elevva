from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    eleva_env: str = 'development'
    database_url: str = 'sqlite:///./eleva-development.db'
    auth_base_url: str = ''
    cors_origins: str = 'http://localhost:8081'
    enable_test_identities: bool = False
    test_identity_secret: str = ''
    groq_api_key: str = ''
    groq_model: str = 'openai/gpt-oss-120b'
    ai_timeout_seconds: int = 45
    ai_project_daily_limit: int = 20
    ai_user_daily_limit: int = 5
    ai_allow_synthetic: bool = False
    ai_min_start_interval_seconds: int = 60
    ai_max_snapshot_characters: int = 6000
    ai_max_completion_tokens: int = Field(default=1500, ge=128, le=3000)
    ai_lesson_max_completion_tokens: int = Field(default=6000, ge=1000, le=10000)
    pedagogical_reviewer_subjects: str = ''

    def validate_environment(self):
        if self.eleva_env not in ('development', 'test'):
            trusted_identity = self.auth_base_url.startswith('https://') or self.auth_base_url == 'http://127.0.0.1:3001'
            if self.enable_test_identities or not self.database_url.startswith('postgresql') or not trusted_identity:
                raise RuntimeError('Production requires PostgreSQL, HTTPS Better Auth and disabled test identities')
        if self.enable_test_identities and len(self.test_identity_secret) < 32:
            raise RuntimeError('Use a random TEST_IDENTITY_SECRET of at least 32 characters')


@lru_cache
def settings():
    value = Settings()
    value.validate_environment()
    return value
