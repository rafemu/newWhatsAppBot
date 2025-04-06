import { Conversation, IConversation } from '../models/Conversation';
import { logger } from '../../../shared/utils/logger';

export class ConversationAnalyticsService {
  /**
   * חישוב זמני תגובה
   */
  static async calculateResponseTimes(sessionId: string, timeframe?: { startDate?: Date; endDate?: Date }) {
    try {
      const query: any = { session: sessionId };

      if (timeframe) {
        if (timeframe.startDate || timeframe.endDate) {
          query.updatedAt = {};
          
          if (timeframe.startDate) {
            query.updatedAt.$gte = timeframe.startDate;
          }
          
          if (timeframe.endDate) {
            query.updatedAt.$lte = timeframe.endDate;
          }
        }
      }

      const conversations = await Conversation.find(query);
      
      let totalResponseTime = 0;
      let responsesCount = 0;
      
      // חישוב זמן תגובה ממוצע
      for (const conversation of conversations) {
        const messages = conversation.messages;
        const userMessages = messages.filter(msg => !msg.fromMe);
        const systemMessages = messages.filter(msg => msg.fromMe);
        
        for (let i = 0; i < userMessages.length; i++) {
          const userMessage = userMessages[i];
          
          // חיפוש ההודעה הראשונה של המערכת שנשלחה אחרי הודעת המשתמש
          const systemResponse = systemMessages.find(msg => 
            msg.timestamp > userMessage.timestamp
          );
          
          if (systemResponse) {
            const responseTime = systemResponse.timestamp.getTime() - userMessage.timestamp.getTime();
            totalResponseTime += responseTime;
            responsesCount++;
          }
        }
      }
      
      const averageResponseTime = responsesCount > 0 ? totalResponseTime / responsesCount : 0;
      
      return {
        totalConversations: conversations.length,
        responsesAnalyzed: responsesCount,
        averageResponseTimeMs: averageResponseTime,
        averageResponseTimeFormatted: this.formatMilliseconds(averageResponseTime),
      };
    } catch (error) {
      logger.error(`שגיאה בחישוב זמני תגובה לסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * חישוב עומס שיחות
   */
  static async calculateConversationLoad(
    sessionId: string,
    options: { 
      timeframe?: { startDate?: Date; endDate?: Date };
      groupBy?: 'hour' | 'day' | 'week' | 'month';
    } = {}
  ) {
    try {
      const query: any = { session: sessionId };

      if (options.timeframe) {
        if (options.timeframe.startDate || options.timeframe.endDate) {
          query.createdAt = {};
          
          if (options.timeframe.startDate) {
            query.createdAt.$gte = options.timeframe.startDate;
          }
          
          if (options.timeframe.endDate) {
            query.createdAt.$lte = options.timeframe.endDate;
          }
        }
      }

      const conversations = await Conversation.find(query);
      
      // קיבוץ לפי תקופה
      const groupBy = options.groupBy || 'day';
      const groups: { [key: string]: number } = {};
      
      for (const conversation of conversations) {
        const date = conversation.createdAt;
        let groupKey: string;
        
        switch (groupBy) {
          case 'hour':
            groupKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
            break;
          case 'week':
            // חישוב מספר השבוע בשנה
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
            const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
            groupKey = `${date.getFullYear()}-W${weekNumber}`;
            break;
          case 'month':
            groupKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            break;
          default: // day
            groupKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            break;
        }
        
        groups[groupKey] = (groups[groupKey] || 0) + 1;
      }
      
      // המרה למערך לצורך התצוגה
      const result = Object.entries(groups).map(([period, count]) => ({
        period,
        count,
      })).sort((a, b) => a.period.localeCompare(b.period));
      
      return {
        totalConversations: conversations.length,
        groupBy,
        data: result,
      };
    } catch (error) {
      logger.error(`שגיאה בחישוב עומס שיחות לסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * חילוץ מילות מפתח וניתוח מגמות
   */
  static async analyzeConversationTrends(
    sessionId: string,
    options: { 
      timeframe?: { startDate?: Date; endDate?: Date };
      keywordLimit?: number;
    } = {}
  ) {
    try {
      const query: any = { session: sessionId };

      if (options.timeframe) {
        if (options.timeframe.startDate || options.timeframe.endDate) {
          query.updatedAt = {};
          
          if (options.timeframe.startDate) {
            query.updatedAt.$gte = options.timeframe.startDate;
          }
          
          if (options.timeframe.endDate) {
            query.updatedAt.$lte = options.timeframe.endDate;
          }
        }
      }

      const conversations = await Conversation.find(query);
      
      // מילון מילים שכיחות (לא כולל מילות קישור)
      const keywords: { [word: string]: number } = {};
      const stopWords = ['את', 'של', 'על', 'עם', 'אני', 'הוא', 'היא', 'אנחנו', 'הם', 'זה', 'זו', 'או', 'אם', 'כי', 'כן', 'לא', 'גם'];
      
      // איסוף מילים מכל השיחות
      for (const conversation of conversations) {
        for (const message of conversation.messages) {
          if (!message.text) continue;
          
          const words = message.text.toLowerCase()
            .replace(/[^\u0590-\u05FF\w\s]/g, '') // השארת רק אותיות עבריות ומספרים
            .split(/\s+/); // פיצול לפי רווחים
          
          for (const word of words) {
            if (word.length < 2) continue; // דילוג על מילים קצרות מדי
            if (stopWords.includes(word)) continue; // דילוג על מילות עצירה
            
            keywords[word] = (keywords[word] || 0) + 1;
          }
        }
      }
      
      // מיון המילים לפי שכיחות
      const sortedKeywords = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, options.keywordLimit || 20) // הגבלת מספר המילים
        .map(([word, count]) => ({ word, count }));
      
      // ניתוח רגשות (sentiment analysis) - דוגמה בסיסית
      const positiveWords = ['תודה', 'נהדר', 'מעולה', 'שמח', 'אשמח', 'מצוין', 'טוב', 'יופי', 'נפלא'];
      const negativeWords = ['בעיה', 'רע', 'גרוע', 'מתסכל', 'כועס', 'מאוכזב', 'נכשל', 'קשה', 'מאוד'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;
      
      for (const conversation of conversations) {
        for (const message of conversation.messages) {
          if (!message.text || message.fromMe) continue; // ניתוח רק הודעות משתמש
          
          const text = message.text.toLowerCase();
          let isPositive = false;
          let isNegative = false;
          
          for (const word of positiveWords) {
            if (text.includes(word)) {
              isPositive = true;
              break;
            }
          }
          
          for (const word of negativeWords) {
            if (text.includes(word)) {
              isNegative = true;
              break;
            }
          }
          
          if (isPositive && !isNegative) {
            positiveCount++;
          } else if (isNegative && !isPositive) {
            negativeCount++;
          } else {
            neutralCount++;
          }
        }
      }
      
      const totalAnalyzed = positiveCount + negativeCount + neutralCount;
      
      return {
        totalConversations: conversations.length,
        keywords: sortedKeywords,
        sentiment: {
          positive: positiveCount,
          negative: negativeCount,
          neutral: neutralCount,
          positivePercentage: totalAnalyzed > 0 ? (positiveCount / totalAnalyzed) * 100 : 0,
          negativePercentage: totalAnalyzed > 0 ? (negativeCount / totalAnalyzed) * 100 : 0,
          neutralPercentage: totalAnalyzed > 0 ? (neutralCount / totalAnalyzed) * 100 : 0,
        }
      };
    } catch (error) {
      logger.error(`שגיאה בניתוח מגמות בשיחות לסשן ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * יצירת דוח שביעות רצון
   */
  static async generateSatisfactionReport(sessionId: string) {
    try {
      // ניתן להרחיב בעתיד עם חיבור למערכת סקרים ודירוגים
      const trends = await this.analyzeConversationTrends(sessionId);
      const responseTimes = await this.calculateResponseTimes(sessionId);
      
      const totalMessages = await this.countTotalMessages(sessionId);
      const averageMessagesPerConversation = 
        trends.totalConversations > 0 ? totalMessages / trends.totalConversations : 0;
      
      const satisfactionScore = this.calculateSatisfactionScore(
        trends.sentiment.positivePercentage,
        responseTimes.averageResponseTimeMs,
        averageMessagesPerConversation
      );
      
      return {
        sessionId,
        totalConversations: trends.totalConversations,
        responseTimes,
        sentimentAnalysis: trends.sentiment,
        averageMessagesPerConversation,
        estimatedSatisfactionScore: satisfactionScore,
        recommendations: this.generateRecommendations(satisfactionScore, responseTimes.averageResponseTimeMs),
      };
    } catch (error) {
      logger.error(`שגיאה ביצירת דוח שביעות רצון לסשן ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * עזרי: ספירת סך כל ההודעות
   */
  private static async countTotalMessages(sessionId: string): Promise<number> {
    const conversations = await Conversation.find({ session: sessionId });
    return conversations.reduce((total, conv) => total + conv.messages.length, 0);
  }
  
  /**
   * עזרי: חישוב ציון שביעות רצון
   */
  private static calculateSatisfactionScore(
    positivePercentage: number,
    averageResponseTimeMs: number,
    averageMessagesPerConversation: number
  ): number {
    // אלגוריתם פשוט לחישוב ציון שביעות רצון (0-100)
    // 50% מהציון מבוסס על אחוז הרגש החיובי
    const sentimentScore = positivePercentage * 0.5;
    
    // 30% מהציון מבוסס על זמן תגובה
    // נניח שזמן תגובה אידיאלי הוא פחות מ-60 שניות
    const responseTimeScore = Math.max(0, 30 - (averageResponseTimeMs / 1000 / 60 * 10));
    
    // 20% מהציון מבוסס על מספר ההודעות הממוצע בשיחה
    // נניח שאידיאלי הוא 3-10 הודעות
    let conversationLengthScore = 0;
    if (averageMessagesPerConversation >= 3 && averageMessagesPerConversation <= 10) {
      conversationLengthScore = 20;
    } else if (averageMessagesPerConversation < 3) {
      conversationLengthScore = averageMessagesPerConversation / 3 * 20;
    } else {
      conversationLengthScore = Math.max(0, 20 - ((averageMessagesPerConversation - 10) / 5 * 5));
    }
    
    return Math.min(100, Math.max(0, sentimentScore + responseTimeScore + conversationLengthScore));
  }
  
  /**
   * עזרי: יצירת המלצות לשיפור
   */
  private static generateRecommendations(satisfactionScore: number, averageResponseTimeMs: number): string[] {
    const recommendations: string[] = [];
    
    if (satisfactionScore < 60) {
      recommendations.push('שיפור כללי של שביעות רצון לקוחות נדרש');
    }
    
    if (averageResponseTimeMs > 5 * 60 * 1000) { // יותר מ-5 דקות
      recommendations.push('שיפור זמני תגובה - זמן התגובה הממוצע ארוך מדי');
    } else if (averageResponseTimeMs > 2 * 60 * 1000) { // יותר מ-2 דקות
      recommendations.push('שיפור זמני תגובה - שקול הוספת תשובות אוטומטיות לשאלות נפוצות');
    }
    
    if (satisfactionScore < 40) {
      recommendations.push('הגדלת צוות התמיכה או הכשרה נוספת מומלצת');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('המערכת פועלת היטב, שמירה על רמת השירות הנוכחית');
    }
    
    return recommendations;
  }
  
  /**
   * עזרי: פורמט מילישניות לזמן קריא
   */
  private static formatMilliseconds(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else if (ms < 60000) {
      return `${Math.round(ms/1000)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.round((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }
} 