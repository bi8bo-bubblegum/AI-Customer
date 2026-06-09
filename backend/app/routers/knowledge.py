import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.common.dependencies import require_admin
from app.common.response import success
from app.common.exceptions import ValidationException
from app.models.user import User
from app.services.knowledge_service import KnowledgeService
from app.config import settings

router = APIRouter(prefix="/api/knowledge", tags=["知识库"])


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename.endswith(".pdf"):
        raise ValidationException("仅支持 PDF 文件")

    # 保存文件
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, file_name)

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise ValidationException(f"文件大小超过 {settings.MAX_UPLOAD_SIZE_MB}MB")

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        doc = await KnowledgeService.upload_document(db, file_path, file.filename, title, current_user.id)
        return success(data={"id": doc.id, "title": doc.title, "chunk_count": doc.chunk_count})
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise e


@router.get("/documents")
async def get_documents(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    docs = await KnowledgeService.get_documents(db)
    return success(data=[doc.__dict__ for doc in docs])


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    await KnowledgeService.delete_document(db, doc_id)
    return success(message="文档已删除")