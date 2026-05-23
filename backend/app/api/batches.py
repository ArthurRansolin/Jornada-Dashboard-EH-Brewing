from fastapi import APIRouter

router = APIRouter(prefix='/batches', tags=['batches'])


@router.get('')
def list_batches():
    return []
