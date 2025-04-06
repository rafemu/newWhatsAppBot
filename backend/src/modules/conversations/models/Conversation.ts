import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  id: string;
  text?: string;
  timestamp: Date;
  from: string;
  fromMe: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
  metadata?: {
    messageType?: 'text' | 'media' | 'list' | 'button';
    title?: string;
    buttonText?: string;
    sections?: {
      title: string;
      options: {
        id: string;
        title: string;
        description?: string;
      }[];
    }[];
    buttons?: {
      id: string;
      text: string;
    }[];
    selection?: string; // המזהה של האפשרות שנבחרה ע"י המשתמש
    buttonId?: string; // המזהה של הכפתור שנלחץ
    surveyId?: mongoose.Types.ObjectId; // זיהוי הסקר שקשור להודעה
    campaignId?: mongoose.Types.ObjectId; // זיהוי הקמפיין שקשור להודעה
  };
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface IConversation extends Document {
  session: mongoose.Types.ObjectId;
  contact: {
    name: string;
    phone: string;
    profilePicture?: string;
  };
  messages: IMessage[];
  unreadCount: number;
  lastMessage?: {
    text: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  text: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  from: {
    type: String,
    required: true,
  },
  fromMe: {
    type: Boolean,
    required: true,
  },
  mediaUrl: String,
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
  },
  caption: String,
  metadata: {
    messageType: {
      type: String,
      enum: ['text', 'media', 'list', 'button'],
    },
    title: String,
    buttonText: String,
    sections: [{
      title: String,
      options: [{
        id: String,
        title: String,
        description: String,
      }],
    }],
    buttons: [{
      id: String,
      text: String,
    }],
    selection: String,
    buttonId: String,
    surveyId: {
      type: Schema.Types.ObjectId,
      ref: 'Survey',
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
  },
});

const ConversationSchema = new Schema<IConversation>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: 'WhatsAppSession',
      required: [true, 'סשן נדרש לשיחה'],
    },
    contact: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      profilePicture: String,
    },
    messages: [MessageSchema],
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastMessage: {
      text: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// הוספת אינדקסים
ConversationSchema.index({ session: 1, 'contact.phone': 1 }, { unique: true });
ConversationSchema.index({ updatedAt: -1 });

// עדכון lastMessage בעת הוספת הודעה חדשה
ConversationSchema.pre('save', function (next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    
    // קביעת טקסט לפי סוג ההודעה
    let messageText = lastMsg.text || lastMsg.caption || '(מדיה)';
    if (lastMsg.metadata) {
      if (lastMsg.metadata.messageType === 'list') {
        messageText = `רשימה: ${lastMsg.metadata.title || lastMsg.text || ''}`;
      } else if (lastMsg.metadata.messageType === 'button') {
        messageText = `כפתורים: ${lastMsg.metadata.title || lastMsg.text || ''}`;
      } else if (lastMsg.metadata.selection) {
        messageText = `נבחר: ${lastMsg.metadata.selection}`;
      } else if (lastMsg.metadata.buttonId) {
        messageText = `נלחץ כפתור: ${lastMsg.metadata.buttonId}`;
      }
    }
    
    this.lastMessage = {
      text: messageText,
      timestamp: lastMsg.timestamp,
    };
    
    // עדכון מונה הודעות שלא נקראו
    if (!lastMsg.fromMe) {
      this.unreadCount += 1;
    }
  }
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema); 