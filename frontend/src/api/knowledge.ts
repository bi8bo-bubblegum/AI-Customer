import client from './client';
import type { KnowledgeDocumentResponse } from '@/types';

/** 上传知识库文档（FormData） */
export async function uploadDocument(
  file: File,
  title: string,
): Promise<KnowledgeDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const res = await client.post<KnowledgeDocumentResponse>(
    '/knowledge/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return res.data;
}

/** 获取知识库文档列表 */
export async function getDocuments(): Promise<KnowledgeDocumentResponse[]> {
  const res = await client.get<KnowledgeDocumentResponse[]>(
    '/knowledge/documents',
  );
  return res.data;
}

/** 删除知识库文档 */
export async function deleteDocument(docId: string): Promise<void> {
  await client.delete(`/knowledge/documents/${docId}`);
}
