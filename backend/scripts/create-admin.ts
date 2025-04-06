import mongoose from 'mongoose';
import { User, UserRole } from '../src/modules/auth/models/User';
import { config } from '../src/config';

async function createAdminUser() {
  try {
    // התחברות למסד הנתונים
    await mongoose.connect(config.mongoUri);
    console.log('מחובר למסד הנתונים');

    // בדיקה אם קיים כבר משתמש מנהל
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('משתמש מנהל כבר קיים. מאפס את הסיסמה ל-Admin123!');
      existingAdmin.password = 'Admin123!';
      await existingAdmin.save();
      console.log('סיסמת מנהל אופסה בהצלחה!');
    } else {
      // יצירת משתמש מנהל חדש
      const adminUser = new User({
        email: 'admin@example.com',
        password: 'Admin123!',
        name: 'מנהל ראשי',
        role: UserRole.ADMIN,
      });

      await adminUser.save();
      console.log('משתמש מנהל נוצר בהצלחה!');
    }

    // ניתוק ממסד הנתונים
    await mongoose.disconnect();
    console.log('הסקריפט הסתיים בהצלחה');
  } catch (error) {
    console.error('שגיאה:', error);
  }
}

createAdminUser(); 