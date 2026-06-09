from PyPDF2 import PdfReader
from langchain_core.documents import Document
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings


def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    reader = PdfReader(file_path)
    for page in reader.pages:
        text = page.extract_text()
        if text and text.strip():
            text_parts.append(text)
    return '\n'.join(text_parts)

def split_text(text: str, metadata: dict = None) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.RAG_CHUNK_SIZE,
        chunk_overlap=settings.RAG_CHUNK_OVERLAP,
        separators=["\n\n", "\n", "。", "！", "？", ".", "!", "?", " ", ""]
    )
    docs = splitter.create_documents([text], metadatas=[metadata or {}])
    return docs