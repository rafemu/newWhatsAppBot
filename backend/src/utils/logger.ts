import winston from 'winston';

// יצירת פורמט מותאם ללוגים
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// פורמט ללוגים בקונסול עם צבעים
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

// יצירת הלוגר
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // כתיבת כל השגיאות לקובץ error.log
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // כתיבת כל הלוגים לקובץ combined.log
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// הוספת תמיכה בלוגים לקונסול
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
} else {
  // בסביבת ייצור - רק שגיאות יופיעו בקונסול
  logger.add(
    new winston.transports.Console({
      level: 'error',
      format: consoleFormat
    })
  );
} 