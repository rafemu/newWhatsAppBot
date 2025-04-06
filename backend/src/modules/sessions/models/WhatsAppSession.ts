import mongoose, { Schema, Document } from 'mongoose';

// בדיקת סטטוס אפשריים למכשיר
export type WhatsAppDeviceStatus = 'initializing' | 'connected' | 'disconnected' | 'failed';

// ממשק עבור מכשיר WhatsApp
export interface IWhatsAppDevice {
  deviceId: string; // מזהה מכשיר ייחודי
  name: string; // שם המכשיר
  status: WhatsAppDeviceStatus; // סטטוס המכשיר
  phone?: string; // מספר טלפון המכשיר (אופציונלי, מתמלא אחרי חיבור)
  qrCode?: string; // קוד QR לסריקה (base64)
  qrExpiration?: Date; // תאריך תפוגה של קוד ה-QR
  failReason?: string; // סיבת כישלון (במקרה של סטטוס 'failed')
  createdAt: Date; // תאריך יצירת המכשיר
  statusUpdatedAt?: Date; // תאריך עדכון אחרון של הסטטוס
}

export interface IWhatsAppSession extends Document {
  name: string;
  description?: string;
  user: mongoose.Types.ObjectId;
  status: 'initializing' | 'connected' | 'disconnected' | 'failed';
  qrCode?: string;
  qrExpiration?: Date;
  phone?: string;
  devices: IWhatsAppDevice[]; // מערך של מכשירים מחוברים
  autoReconnect: boolean;
  webhookUrl?: string;
  messageDelay?: number;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  notifications?: {
    enabled: boolean;
    email?: string;
    onDisconnect: boolean;
    onMessage: boolean;
  };
}

const WhatsAppDeviceSchema = new Schema<IWhatsAppDevice>(
  {
    deviceId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['initializing', 'connected', 'disconnected', 'failed'],
      default: 'initializing',
    },
    qrCode: String,
    qrExpiration: Date,
    phone: String,
    lastActive: Date,
    statusUpdatedAt: Date,
  },
  {
    timestamps: true,
    _id: false, // אין צורך ב-_id נפרד לכל מכשיר
  }
);

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    name: {
      type: String,
      required: [true, 'שם הסשן נדרש'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'משתמש נדרש לסשן'],
    },
    status: {
      type: String,
      enum: ['initializing', 'connected', 'disconnected', 'failed'],
      default: 'initializing',
    },
    qrCode: String,
    qrExpiration: Date,
    phone: String,
    devices: {
      type: [WhatsAppDeviceSchema],
      default: [],
    },
    autoReconnect: {
      type: Boolean,
      default: true,
    },
    webhookUrl: String,
    messageDelay: {
      type: Number,
      default: 1000,
      min: 0,
      max: 5000,
    },
    lastActive: Date,
    notifications: {
      enabled: {
        type: Boolean,
        default: false,
      },
      email: String,
      onDisconnect: {
        type: Boolean,
        default: true,
      },
      onMessage: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// הוספת אינדקסים
WhatsAppSessionSchema.index({ user: 1 });
WhatsAppSessionSchema.index({ status: 1 });

// pre-save hook
WhatsAppSessionSchema.pre('save', function (next) {
  // אם הסטטוס השתנה ל-'connected', עדכן את lastActive
  if (this.isModified('status') && this.status === 'connected') {
    this.lastActive = new Date();
  }
  
  // עדכון סטטוס הסשן בהתאם למכשירים המחוברים
  if (this.devices && this.devices.length > 0) {
    const hasConnectedDevices = this.devices.some(device => device.status === 'connected');
    if (hasConnectedDevices && this.status !== 'connected') {
      this.status = 'connected';
      this.lastActive = new Date();
    } else if (!hasConnectedDevices && this.status === 'connected') {
      this.status = 'disconnected';
    }
  }
  
  next();
});

export const WhatsAppSession = mongoose.model<IWhatsAppSession>('WhatsAppSession', WhatsAppSessionSchema); 