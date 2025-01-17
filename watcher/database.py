from sqlalchemy import Column, String, DateTime, Enum, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import ENUM
from datetime import datetime

DATABASE_URL = "postgresql+psycopg2://user:password@db:5432/uploads"

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define the named ENUM type
status_enum = ENUM(
    "Uploaded",
    "Processing",
    "Completed",
    "Failed",
    name="upload_status_enum",
    create_type=True,
)


class Upload(Base):
    __tablename__ = "uploads"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    # Default status is Uploaded
    status = Column(status_enum, default="Uploaded")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    error_message = Column(String, nullable=True)


def init_db():
    """Initialize the database tables."""
    Base.metadata.create_all(engine)


def get_session():
    """Return a new database session."""
    return SessionLocal()
