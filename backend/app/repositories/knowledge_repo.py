from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeDocument, KnowledgeChunk


class KnowledgeDocumentRepo:

    @staticmethod
    async def create(db: AsyncSession, knowledge_document: KnowledgeDocument):
        db.add(knowledge_document)
        await db.flush()
        return knowledge_document

    @staticmethod
    async def get_all(db: AsyncSession) -> list[KnowledgeDocument]:
        sql = select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc())
        result = await db.execute(sql)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, knowledge_document_id: str) -> KnowledgeDocument | None:
        sql = select(KnowledgeDocument).where(KnowledgeDocument.id == knowledge_document_id)
        result = await db.execute(sql)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_chunk_count(db: AsyncSession, knowledge_document_id: str, chunk_count: int):
        doc = await KnowledgeDocumentRepo.get_by_id(db, knowledge_document_id)
        if doc:
            doc.chunk_count = chunk_count
            await db.flush()

    @staticmethod
    async def delete_by_id(db: AsyncSession, knowledge_document_id: str):
        await db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.document_id == knowledge_document_id))
        await db.execute(delete(KnowledgeDocument).where(KnowledgeDocument.id == knowledge_document_id))
        await db.flush()

class KnowledgeChunkRepo:

    @staticmethod
    async def create_batch(db: AsyncSession, chunks: list[KnowledgeChunk]):
        db.add_all(chunks)
        await db.flush()

    @staticmethod
    async def search_by_embedding(db: AsyncSession, query_embedding: list[float], top_k: int = 5):
        result = await db.execute(
            select(KnowledgeChunk)
            .order_by(KnowledgeChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k)
        )
        return list(result.scalars().all())