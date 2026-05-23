from pydantic_settings import BaseSettings, SettingsConfigDict


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
