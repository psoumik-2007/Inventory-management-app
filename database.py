import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

db_url = os.environ["DATABASE_URL"]
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
