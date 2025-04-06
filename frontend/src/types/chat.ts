export interface Message {
  id: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'location';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'blocked';
}

export interface ChatFilter {
  status?: 'active' | 'archived' | 'blocked';
  participant?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ChatStats {
  totalMessages: number;
  averageResponseTime: number;
  activeChats: number;
  messagesByType: {
    text: number;
    image: number;
    file: number;
    location: number;
  };
} 