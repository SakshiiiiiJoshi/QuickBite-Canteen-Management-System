import os
from dotenv import load_dotenv

load_dotenv()


def _build_db_uri():
    # Render (and most PaaS) inject DATABASE_URL for PostgreSQL
    db_url = os.getenv('DATABASE_URL', '')
    if db_url:
        # SQLAlchemy requires "postgresql://" not "postgres://"
        return db_url.replace('postgres://', 'postgresql://', 1)
    # Local MySQL fallback
    return (
        f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}"
        f"@{os.getenv('DB_HOST', 'localhost')}/{os.getenv('DB_NAME', 'canteen')}"
    )


class Config:
    SECRET_KEY = os.getenv('JWT_SECRET', 'canteen_super_secret_key_2024')
    SQLALCHEMY_DATABASE_URI = _build_db_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PORT = int(os.getenv('PORT', 5000))
