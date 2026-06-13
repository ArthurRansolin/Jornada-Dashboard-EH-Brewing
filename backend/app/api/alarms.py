from fastapi import APIRouter

router = APIRouter(prefix='/alarms', tags=['alarms'])


@router.get('')
def list_alarms():
    return []
