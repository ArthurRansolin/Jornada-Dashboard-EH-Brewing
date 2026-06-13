from app.services.modbus_transport import ModbusTransport
from app.services import n1050_registers as reg
from app.services.n1050_parser import parse_full_snapshot


class N1050Client:
    def __init__(self, transport: ModbusTransport | None = None):
        self.transport = transport or ModbusTransport()

    def connect(self):
        return self.transport.connect()

    def close(self):
        self.transport.close()

    def read_process_data(self, slave_id: int) -> dict:
        addresses = [
            reg.REG_SP_ACTIVE,
            reg.REG_PV,
            reg.REG_MV,
            reg.REG_STATUS1,
            reg.REG_STATUS2,
            reg.REG_STATUS3,
            reg.REG_RUN,
            reg.REG_CTRL_MODE,
            reg.REG_ACTIVE_SEGMENT,
            reg.REG_SEGMENT_TIME,
        ]
        raw = {}
        for address in addresses:
            result = self.transport.read_holding_registers(address=address, count=1, slave=slave_id)
            if result.isError():
                raise RuntimeError(f'Erro ao ler registrador {address} do slave {slave_id}')
            raw[address] = result.registers[0]
        return parse_full_snapshot(raw)

    def write_setpoint(self, slave_id: int, value: int):
        return self.transport.write_register(address=reg.REG_SP_MAIN, value=int(value), slave=slave_id)

    def set_run(self, slave_id: int, enabled: bool):
        return self.transport.write_register(address=reg.REG_RUN, value=1 if enabled else 0, slave=slave_id)

    def set_auto_manual(self, slave_id: int, mode: str):
        mode_value = 1 if mode.lower() == 'manual' else 0
        return self.transport.write_register(address=reg.REG_CTRL_MODE, value=mode_value, slave=slave_id)

    def set_manual_mv(self, slave_id: int, value: int):
        return self.transport.write_register(address=reg.REG_MV_MANUAL, value=int(value), slave=slave_id)
