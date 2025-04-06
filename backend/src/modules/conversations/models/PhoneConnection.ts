import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoneConnection extends Document {
  phoneNumber: string;
  name?: string;
  email?: string;
  tags: string[];
  metadata: Record<string, any>;
  linkedSurveys: mongoose.Types.ObjectId[];
  campaigns: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastContact: Date;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  optOut: boolean;
}

const PhoneConnectionSchema = new Schema<IPhoneConnection>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    linkedSurveys: [{
      type: Schema.Types.ObjectId,
      ref: 'Survey',
    }],
    campaigns: [{
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    }],
    lastContact: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    notes: {
      type: String,
    },
    optOut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// אינדקסים להאצת חיפושים נפוצים
PhoneConnectionSchema.index({ tags: 1 });
PhoneConnectionSchema.index({ status: 1 });
PhoneConnectionSchema.index({ lastContact: 1 });
PhoneConnectionSchema.index({ optOut: 1 });

export const PhoneConnection = mongoose.model<IPhoneConnection>('PhoneConnection', PhoneConnectionSchema); 