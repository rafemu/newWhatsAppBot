import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../../../config';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER'
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  permissions?: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  twoFactorTempSecret?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  generateTwoFactorSecret(): string;
  verifyTwoFactorToken(token: string): boolean;
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'אימייל הוא שדה חובה'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'סיסמה היא שדה חובה'],
    minlength: 8,
    select: false,
  },
  name: {
    type: String,
    required: [true, 'שם הוא שדה חובה'],
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.VIEWER,
  },
  permissions: [{
    type: String,
  }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: {
    type: String,
    select: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorTempSecret: {
    type: String,
    select: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('שגיאה בהשוואת סיסמאות');
  }
};

// יצירת טוקן לאיפוס סיסמה
UserSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// יצירת סוד חדש ל-2FA
UserSchema.methods.generateTwoFactorSecret = function(): string {
  const secret = crypto.randomBytes(20).toString('hex');
  this.twoFactorTempSecret = secret;
  return secret;
};

// אימות קוד 2FA
UserSchema.methods.verifyTwoFactorToken = function(token: string): boolean {
  const secret = this.twoFactorEnabled ? this.twoFactorSecret : this.twoFactorTempSecret;
  if (!secret) return false;

  try {
    const speakeasy = require('speakeasy');
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'hex',
      token: token,
      window: 1 // מאפשר סטייה של 30 שניות קדימה או אחורה
    });
  } catch (error) {
    return false;
  }
};

export const User = mongoose.model<IUser>('User', UserSchema); 