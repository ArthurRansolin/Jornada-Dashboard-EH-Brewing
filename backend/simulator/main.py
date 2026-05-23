import asyncio
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext
from pymodbus.server import StartTcpServer
from simulator.n1050_state import N1050State

state = N1050State()
block = ModbusSequentialDataBlock(0, [0] * 200)
store = ModbusSlaveContext(hr=block)
context = ModbusServerContext(slaves=store, single=True)


def sync_state_to_store():
    for address, value in state.registers.items():
        store.setValues(3, address, [int(value)])


def sync_store_to_state():
    for address in list(state.registers.keys()):
        state.registers[address] = store.getValues(3, address, count=1)[0]


async def updater():
    while True:
        sync_store_to_state()
        sync_state_to_store()
        await asyncio.sleep(1)


if __name__ == '__main__':
    state.start()
    loop = asyncio.get_event_loop()
    loop.create_task(updater())
    StartTcpServer(context=context, address=('0.0.0.0', 5020))
