export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface WhatsAppSession {
  id: string;
  name: string;
  phone: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  devices: WhatsAppDevice[];
}

export interface WhatsAppDevice {
  deviceId: string;
  name: string;
  status: 'initializing' | 'connected' | 'disconnected' | 'failed';
  qrCode?: string;
  qrExpiration?: string;
  phone?: string;
  lastActive?: string;
  createdAt: string;
}

export interface SurveyQuestion {
  _id: string;
  id?: string;
  type: 'RADIO' | 'CHECKBOX' | 'TEXT' | 'SCALE' | 'DATE' | 'IMAGE' | 'RANKING';
  title: string;
  description: string;
  required: boolean;
  min?: number;
  max?: number;
  options?: {
    _id: string;
    id?: string;
    text: string;
    value?: string;
    description?: string;
    nextQuestionId?: string;
  }[];
  conditions?: {
    questionId: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: string;
    nextQuestionId?: string;
  }[];
}

export interface Survey {
  _id: string;
  id?: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  responsesCount: number;
  settings?: {
    allowAnonymous: boolean;
    notifyOnResponse: boolean;
    expiresAt?: string;
    maxResponses?: number;
    theme?: {
      primaryColor?: string;
      backgroundColor?: string;
      buttonColor?: string;
      fontFamily?: string;
      borderRadius?: string;
      showProgressBar?: boolean;
      showQuestionNumbers?: boolean;
      customCSS?: string;
      logo?: string;
    };
  };
}

export interface SurveyResponse {
  _id: string;
  id?: string;
  surveyId: string;
  participant: {
    phone: string;
    name?: string;
  };
  respondentName?: string;
  respondentEmail?: string;
  respondentPhone?: string;
  completedAt?: string;
  answers: {
    questionId: string;
    value: string | string[] | number | boolean;
    timestamp: string;
  }[];
  status: 'in_progress' | 'completed' | 'abandoned';
  metadata: {
    startedAt: string;
    lastInteractionAt: string;
    timeSpent: number;
    deviceInfo?: string;
  };
}

export interface SurveyAnalytics {
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  questions: {
    id: string;
    title: string;
    responses: {
      option?: string;
      count: number;
      percentage: number;
    }[];
  }[];
}

export interface Conversation {
  id: string;
  sessionId: string;
  participant: string;
  status: 'active' | 'pending' | 'closed';
  tags: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'list';
  sender: 'user' | 'system';
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
} 