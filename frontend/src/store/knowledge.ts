import { create } from 'zustand';
import * as knowledgeApi from '@/api/knowledge';
import type { KnowledgeDocumentResponse } from '@/types';

interface KnowledgeState {
  documents: KnowledgeDocumentResponse[];
  isLoading: boolean;
  uploading: boolean;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, title: string) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  documents: [],
  isLoading: false,
  uploading: false,

  fetchDocuments: async () => {
    set({ isLoading: true });
    try {
      const documents = await knowledgeApi.getDocuments();
      set({ documents });
    } catch (error) {
      console.error('获取文档列表失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (file: File, title: string) => {
    set({ uploading: true });
    try {
      await knowledgeApi.uploadDocument(file, title);
    } catch (error) {
      console.error('上传文档失败:', error);
      throw error;
    } finally {
      set({ uploading: false });
    }
  },

  deleteDocument: async (docId: string) => {
    try {
      await knowledgeApi.deleteDocument(docId);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== docId),
      }));
    } catch (error) {
      console.error('删除文档失败:', error);
      throw error;
    }
  },
}));
