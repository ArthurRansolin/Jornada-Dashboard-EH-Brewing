from app.core.database import SessionLocal


def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
