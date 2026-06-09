import os
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_openai import OpenAIEmbeddings
from app.repositories.knowledge_repo import KnowledgeDocumentRepo, KnowledgeChunkRepo
from app.utils.pdf_parser import extract_text_from_pdf, split_text
from app.models.knowledge import KnowledgeChunk, KnowledgeDocument
from app.config import settings

# 延迟初始化 Embedding 模型
_embeddings = None


def get_embeddings() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL_NAME,
            api_key=settings.EMBEDDING_API_KEY,
            base_url=settings.EMBEDDING_BASE_URL,
            dimensions=settings.EMBEDDING_DIMENSION,
        )
    return _embeddings


class KnowledgeService:
    @staticmethod
    async def upload_document(db: AsyncSession, file_path: str, file_name: str, title: str, user_id: str):
        # 1. 解析 PDF
        text = extract_text_from_pdf(file_path)
        if not text.strip():
            raise ValueError("PDF 文件内容为空或无法解析")

        # 2. 切片
        docs = split_text(text, metadata={"file_name": file_name, "title": title})

        # 3. 生成 Embedding
        embeddings = get_embeddings()
        texts = [doc.page_content for doc in docs]
        embedding_vectors = await embeddings.aembed_documents(texts)

        # 4. 保存文档记录
        doc_record = KnowledgeDocument(
            title=title,
            file_name=file_name,
            file_path=file_path,
            uploaded_by=user_id,
            chunk_count=len(docs),
        )
        doc_record = await KnowledgeDocumentRepo.create(db, doc_record)

        # 5. 保存切片
        chunks = []
        for i, (doc, embedding) in enumerate(zip(docs, embedding_vectors)):
            chunk = KnowledgeChunk(
                document_id=doc_record.id,
                content=doc.page_content,
                chunk_index=i,
                embedding=embedding,
                metadata_=doc.metadata,
            )
            chunks.append(chunk)

        await KnowledgeChunkRepo.create_batch(db, chunks)
        return doc_record

    @staticmethod
    async def get_documents(db: AsyncSession):
        return await KnowledgeDocumentRepo.get_all(db)

    @staticmethod
    async def delete_document(db: AsyncSession, doc_id: str):
        doc = await KnowledgeDocumentRepo.get_by_id(db, doc_id)
        if not doc:
            raise ValueError("文档不存在")

        # 删除文件
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)

        # 删除数据库记录（切片也会被级联删除）
        await KnowledgeDocumentRepo.delete_by_id(db, doc_id)

    @staticmethod
    async def search(db: AsyncSession, query: str, top_k: int = None) -> list[dict]:
        """RAG 检索：查询 -> embedding -> pgvector 搜索"""
        embeddings = get_embeddings()
        query_embedding = await embeddings.aembed_query(query)

        top_k = top_k or settings.RAG_TOP_K
        chunks = await KnowledgeChunkRepo.search_by_embedding(db, query_embedding, top_k)

        return [
            {
                "content": chunk.content,
                "metadata": chunk.metadata_,
                "document_id": chunk.document_id,
            }
            for chunk in chunks
        ]