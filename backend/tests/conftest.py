# Set isolated configuration before importing any application module during collection.
import os
os.environ['ELEVA_ENV'] = 'test'
os.environ['DATABASE_URL'] = 'sqlite://'
os.environ['ENABLE_TEST_IDENTITIES'] = 'true'
os.environ['TEST_IDENTITY_SECRET'] = 'isolated-tests-only-not-a-production-secret-123456'
os.environ['AI_ALLOW_SYNTHETIC'] = 'true'
os.environ['GROQ_API_KEY'] = ''
os.environ['AUTH_BASE_URL'] = ''
