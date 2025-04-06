import mongoose, { Document, Schema } from 'mongoose';

/**
 * ממשק עבור קישור טלפון
 */
export interface IPhoneConnection extends Document {
  phoneNumber: string;
  name?: string;
  email?: string;
  tags: string[];
  metadata: Record<string, any>;
  linkedSurveys: string[];
  campaigns: string[];
  createdAt: Date;
  updatedAt: Date;
  lastContact: Date;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  optOut: boolean;
}

/**
 * סכמה עבור קישור טלפון
 */
const PhoneConnectionSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
    tags: {
      type: [String],
      default: [],
    },
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
      default: null,
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

/**
 * מודל עבור קישור טלפון
 */
export const PhoneConnection = mongoose.model<IPhoneConnection>('PhoneConnection', PhoneConnectionSchema); 