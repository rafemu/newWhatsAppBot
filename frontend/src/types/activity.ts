export enum ActivityType {
  USER = 'USER',
  WHATSAPP = 'WHATSAPP',
  SURVEY = 'SURVEY',
  SYSTEM = 'SYSTEM',
  CONVERSATION = 'CONVERSATION'
}

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE'
}

export enum ActivityStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface ActivityLogFilters {
  userId?: string;
  type?: ActivityType[];
  action?: ActivityAction[];
  status?: ActivityStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLog {
  _id?: string;
  id?: string;
  userId: string;
  username: string;
  type: ActivityType;
  action: ActivityAction;
  details?: string;
  targetId?: string;
  targetType?: string;
  status: ActivityStatus;
  ipAddress?: string;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 