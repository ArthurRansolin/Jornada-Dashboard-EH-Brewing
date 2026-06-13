from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    APP_NAME: str = 'EH Brewing Backend'
    APP_ENV: str = 'dev'
    DATABASE_URL: str = 'sqlite:///./brewery.db'

    MODBUS_ENABLED: bool = False
    MODBUS_MODE: str = 'tcp'
    MODBUS_HOST: str = '127.0.0.1'
    MODBUS_PORT: int = 5020
    MODBUS_SERIAL_PORT: str = '/dev/ttyUSB0'
    MODBUS_BAUDRATE: int = 9600
    MODBUS_PARITY: str = 'N'
    MODBUS_STOPBITS: int = 1
    MODBUS_BYTESIZE: int = 8
    POLL_INTERVAL_SECONDS: int = 5


settings = Settings()


def normalize_sqlite_url(database_url: str) -> str:
    prefix = 'sqlite:///'
    if not database_url.startswith(prefix):
        return database_url

    database_path = database_url.removeprefix(prefix)
    if database_path in (':memory:', ''):
        return database_url

    path = Path(database_path)
    if path.is_absolute():
        return database_url

    return f'{prefix}{(BACKEND_DIR / path).resolve().as_posix()}'


settings.DATABASE_URL = normalize_sqlite_url(settings.DATABASE_URL)
