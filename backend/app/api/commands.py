from fastapi import APIRouter

router = APIRouter(prefix='/commands', tags=['commands'])


@router.get('')
def list_commands():
    return []
