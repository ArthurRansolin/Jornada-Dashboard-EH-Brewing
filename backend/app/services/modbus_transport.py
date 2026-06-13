from app.core.config import settings
from pymodbus.client import ModbusSerialClient, ModbusTcpClient


class ModbusTransport:
    def __init__(self):
        self.mode = settings.MODBUS_MODE.lower()
        self.client = None

    def connect(self):
        if self.mode == 'tcp':
            self.client = ModbusTcpClient(host=settings.MODBUS_HOST, port=settings.MODBUS_PORT)
        else:
            self.client = ModbusSerialClient(
                port=settings.MODBUS_SERIAL_PORT,
                baudrate=settings.MODBUS_BAUDRATE,
                parity=settings.MODBUS_PARITY,
                stopbits=settings.MODBUS_STOPBITS,
                bytesize=settings.MODBUS_BYTESIZE,
                timeout=1,
            )
        return self.client.connect()

    def close(self):
        if self.client:
            self.client.close()

    def read_holding_registers(self, address: int, count: int, slave: int):
        return self.client.read_holding_registers(address=address, count=count, slave=slave)

    def write_register(self, address: int, value: int, slave: int):
        return self.client.write_register(address=address, value=value, slave=slave)
