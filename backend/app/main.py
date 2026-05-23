from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.alarms import router as alarms_router
from app.api.batches import router as batches_router
from app.api.commands import router as commands_router
from app.api.controllers import router as controllers_router
from app.api.logs import router as logs_router
from app.api.profiles import router as profiles_router
from app.api.readings import router as readings_router
from app.api.tanks import router as tanks_router
from app.core.config import settings
from app.core.database import Base, engine
from app.workers.polling_worker import PollingWorker
import app.models  # noqa

Base.metadata.create_all(bind=engine)
app = FastAPI(title=settings.APP_NAME)
worker = PollingWorker()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(controllers_router)
app.include_router(tanks_router)
app.include_router(readings_router)
app.include_router(profiles_router)
app.include_router(batches_router)
app.include_router(alarms_router)
app.include_router(commands_router)
app.include_router(logs_router)


@app.on_event('startup')
def startup_event():
    worker.start()


@app.on_event('shutdown')
def shutdown_event():
    worker.stop()


@app.get('/')
def root():
    return {'name': settings.APP_NAME, 'status': 'ok'}
