from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.command_log_repo import create_command_log
from app.repositories.controller_repo import (
    create_controller,
    delete_controller,
    get_controller,
    list_controllers,
    update_controller,
)
from app.schemas.command import ManualMVCommand, ModeCommand, RunCommand, SetpointCommand
from app.schemas.controller import ControllerCreate, ControllerOut, ControllerUpdate
from app.services import n1050_registers as reg
from app.services.n1050_client import N1050Client

router = APIRouter(prefix='/controllers', tags=['controllers'])


@router.get('', response_model=list[ControllerOut])
def get_all(db: Session = Depends(get_db)):
    return list_controllers(db)


@router.post('', response_model=ControllerOut)
def create(payload: ControllerCreate, db: Session = Depends(get_db)):
    return create_controller(db, payload.model_dump())


@router.put('/{controller_id}', response_model=ControllerOut)
def update(controller_id: int, payload: ControllerUpdate, db: Session = Depends(get_db)):
    controller = get_controller(db, controller_id)
    if not controller:
        raise HTTPException(status_code=404, detail='Controller not found')
    data = payload.model_dump(exclude_none=True)
    return update_controller(db, controller, data)


@router.delete('/{controller_id}')
def delete(controller_id: int, db: Session = Depends(get_db)):
    controller = get_controller(db, controller_id)
    if not controller:
        raise HTTPException(status_code=404, detail='Controller not found')
    delete_controller(db, controller)
    return {'success': True}


@router.post('/{controller_id}/test-connection')
def test_connection(controller_id: int, db: Session = Depends(get_db)):
    controller = get_controller(db, controller_id)
    if not controller:
        raise HTTPException(status_code=404, detail='Controller not found')
    client = N1050Client()
    ok = client.connect()
    client.close()
    return {'success': bool(ok)}


@router.post('/{controller_id}/setpoint')
def setpoint(controller_id: int, payload: SetpointCommand, db: Session = Depends(get_db)):
    controller = get_controller(db, controller_id)
    if not controller:
        raise HTTPException(status_code=404, detail='Controller not found')

    client = N1050Client()
    try:
        client.connect()
        result = client.write_setpoint(controller.slave_id, int(payload.value))
        success = not result.isError()
        response_text = str(result)
    except Exception as exc:
        success = False
        response_text = str(exc)
    finally:
        client.close()

    create_command_log(db, {
        'controller_id': controller.id,
        'tank_id': controller.tank.id if controller.tank else None,
        'command_type': 'setpoint',
        'register_address': reg.REG_SP_MAIN,
        'value_sent': str(payload.value),
        'success': success,
        'response_text': response_text,
    })

    if not success:
        raise HTTPException(status_code=500, detail=response_text)
    return {'success': True, 'value': payload.value}


@router.post('/{controller_id}/run')
def run(controller_id: int, payload: RunCommand, db: Session = Depends(get_db)):
    controller = get_controller(db, controller_id)
    if not controller:
        raise HTTPException(status_code=404, detail='Controller not found')

    client = N1050Client()
    try:
        client.connect()
        result = client.set_run(controller.slave_id, payload.enabled)
        success = not result.isError()
        response_text = str(result)
    except Exception as exc:
        success = False
        response_text = str(exc)
    finally:
        client.close()

    create_command_log(db, {
        'controller_id': controller.id,
        'tank_id': controller.tank.id if controller.tank else None,
        'command_type': 'run',
        'register_address': reg.REG_RUN,
        'value_sent': '1' if payload.enabled else '0',
        'success': success,
        'response_text': response_text,
    })

    if not success:
        raise HTTPException(status_code=500, detail=response_text)
    return {'success': True, 'enabled': payload.enabled}


@router.post('/{controller_id}/mode')
def mode(controller_id: int, payload: ModeCommand, db: Session = Depends(get_db)):
    controller = get_controller(db, controller_id)
    if not controller:
        raise HTTPException(status_code=404, detail='Controller not found')

    client = N1050Client()
    try:
        client.connect()
        result = client.set_auto_manual(controller.slave_id, payload.mode)
        success = not result.isError()
        response_text = str(result)
    except Exception as exc:
        success = False
        response_text = str(exc)
    finally:
        client.close()

    create_command_log(db, {
        'controller_id': controller.id,
        'tank_id': controller.tank.id if controller.tank else None,
        'command_type': 'mode',
        'register_address': reg.REG_CTRL_MODE,
        'value_sent': payload.mode,
        'success': success,
        'response_text': response_text,
    })

    if not success:
        raise HTTPException(status_code=500, detail=response_text)
    return {'success': True, 'mode': payload.mode}


@router.post('/{controller_id}/manual-mv')
def manual_mv(controller_id: int, payload: ManualMVCommand, db: Session = Depends(get_db)):
    controller = get_controller(db, controller_id)
    if not controller:
        raise HTTPException(status_code=404, detail='Controller not found')

    client = N1050Client()
    try:
        client.connect()
        result = client.set_manual_mv(controller.slave_id, int(payload.value))
        success = not result.isError()
        response_text = str(result)
    except Exception as exc:
        success = False
        response_text = str(exc)
    finally:
        client.close()

    create_command_log(db, {
        'controller_id': controller.id,
        'tank_id': controller.tank.id if controller.tank else None,
        'command_type': 'manual_mv',
        'register_address': reg.REG_MV_MANUAL,
        'value_sent': str(payload.value),
        'success': success,
        'response_text': response_text,
    })

    if not success:
        raise HTTPException(status_code=500, detail=response_text)
    return {'success': True, 'value': payload.value}
