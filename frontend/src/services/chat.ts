import axios from 'axios';
import { Chat, Message, ChatFilter, ChatStats } from '../types/chat';

const API_URL = import.meta.env.VITE_API_URL;

export const chatService = {
  // קבלת כל הצ'אטים
  async getChats(filter?: ChatFilter): Promise<Chat[]> {
    const response = await axios.get(`${API_URL}/chats`, { params: filter });
    return response.data;
  },

  // קבלת צ'אט ספציפי
  async getChat(chatId: string): Promise<Chat> {
    const response = await axios.get(`${API_URL}/chats/${chatId}`);
    return response.data;
  },

  // שליחת הודעה
  async sendMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<Message> {
    const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, message);
    return response.data;
  },

  // קבלת הודעות של צ'אט
  async getChatMessages(chatId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  // סימון הודעות כנקראו
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    await axios.put(`${API_URL}/chats/${chatId}/messages/read`, { messageIds });
  },

  // ארכוב צ'אט
  async archiveChat(chatId: string): Promise<Chat> {
    const response = await axios.put(`${API_URL}/chats/${chatId}/archive`);
    return response.data;
  },

  // חסימת צ'אט
  async blockChat(chatId: string): Promise<Chat> {
    const response = await axios.put(`${API_URL}/chats/${chatId}/block`);
    return response.data;
  },

  // קבלת סטטיסטיקות
  async getChatStats(chatId: string): Promise<ChatStats> {
    const response = await axios.get(`${API_URL}/chats/${chatId}/stats`);
    return response.data;
  },

  // העלאת קובץ
  async uploadFile(chatId: string, file: File): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/chats/${chatId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}; 