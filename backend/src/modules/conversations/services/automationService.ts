import { Conversation, IConversation } from '../models/Conversation';
import { ConversationService } from './conversationService';
import { logger } from '../../../shared/utils/logger';

interface IMessageTemplate {
  id: string;
  name: string;
  content: string;
  tags: string[];
}

interface IAutomationRule {
  id: string;
  name: string;
  condition: {
    type: 'keyword' | 'newConversation' | 'inactivity' | 'time';
    value?: string | string[] | number;
    timeUnit?: 'minutes' | 'hours' | 'days';
  };
  action: {
    type: 'sendMessage' | 'tagConversation' | 'assignAgent';
    value: string;
    delay?: number;
  };
  isActive: boolean;
}

export class ConversationAutomationService {
  private static messageTemplates: IMessageTemplate[] = [
    {
      id: 'welcome',
      name: 'הודעת ברוכים הבאים',
      content: 'שלום וברוכים הבאים! כיצד אוכל לעזור לך היום?',
      tags: ['ברכה', 'פתיחה'],
    },
    {
      id: 'thankYou',
      name: 'תודה',
      content: 'תודה על פנייתך! נשמח לעמוד לשירותך בכל עת.',
      tags: ['סיום', 'תודה'],
    },
    {
      id: 'outOfHours',
      name: 'מחוץ לשעות פעילות',
      content: 'שלום, תודה על פנייתך. שעות הפעילות שלנו הן 9:00-17:00 בימים א-ה. נחזור אליך בהקדם בשעות הפעילות.',
      tags: ['הודעה אוטומטית', 'שעות פעילות'],
    },
    {
      id: 'assistance',
      name: 'הצעת עזרה',
      content: 'האם אוכל לעזור לך במשהו נוסף?',
      tags: ['שירות', 'עזרה'],
    },
  ];

  private static automationRules: IAutomationRule[] = [
    {
      id: 'welcome_new',
      name: 'ברכת שלום לשיחה חדשה',
      condition: {
        type: 'newConversation',
      },
      action: {
        type: 'sendMessage',
        value: 'welcome',
        delay: 1000, // שניה אחת
      },
      isActive: true,
    },
    {
      id: 'inactive_reminder',
      name: 'תזכורת בחוסר פעילות',
      condition: {
        type: 'inactivity',
        value: 30,
        timeUnit: 'minutes',
      },
      action: {
        type: 'sendMessage',
        value: 'assistance',
        delay: 0,
      },
      isActive: true,
    },
    {
      id: 'tag_question',
      name: 'תיוג שאלות',
      condition: {
        type: 'keyword',
        value: ['שאלה', 'איך', 'מתי', 'למה', 'כיצד', 'האם'],
      },
      action: {
        type: 'tagConversation',
        value: 'שאלה',
      },
      isActive: true,
    },
  ];

  /**
   * הוספת תבנית הודעה חדשה
   */
  static addMessageTemplate(template: Omit<IMessageTemplate, 'id'>): IMessageTemplate {
    const id = Math.random().toString(36).substring(2, 15);
    const newTemplate = {
      id,
      ...template,
    };
    
    this.messageTemplates.push(newTemplate);
    return newTemplate;
  }

  /**
   * עדכון תבנית הודעה קיימת
   */
  static updateMessageTemplate(id: string, template: Partial<IMessageTemplate>): IMessageTemplate | null {
    const index = this.messageTemplates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.messageTemplates[index] = {
      ...this.messageTemplates[index],
      ...template,
    };
    
    return this.messageTemplates[index];
  }

  /**
   * קבלת כל תבניות ההודעות
   */
  static getMessageTemplates(): IMessageTemplate[] {
    return [...this.messageTemplates];
  }

  /**
   * קבלת תבנית הודעה לפי מזהה
   */
  static getMessageTemplate(id: string): IMessageTemplate | null {
    return this.messageTemplates.find(t => t.id === id) || null;
  }

  /**
   * מחיקת תבנית הודעה
   */
  static deleteMessageTemplate(id: string): boolean {
    const initialLength = this.messageTemplates.length;
    this.messageTemplates = this.messageTemplates.filter(t => t.id !== id);
    return initialLength > this.messageTemplates.length;
  }

  /**
   * הוספת כלל אוטומציה חדש
   */
  static addAutomationRule(rule: Omit<IAutomationRule, 'id'>): IAutomationRule {
    const id = Math.random().toString(36).substring(2, 15);
    const newRule = {
      id,
      ...rule,
    };
    
    this.automationRules.push(newRule);
    return newRule;
  }

  /**
   * עדכון כלל אוטומציה קיים
   */
  static updateAutomationRule(id: string, rule: Partial<IAutomationRule>): IAutomationRule | null {
    const index = this.automationRules.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.automationRules[index] = {
      ...this.automationRules[index],
      ...rule,
    };
    
    return this.automationRules[index];
  }

  /**
   * קבלת כל כללי האוטומציה
   */
  static getAutomationRules(): IAutomationRule[] {
    return [...this.automationRules];
  }

  /**
   * קבלת כלל אוטומציה לפי מזהה
   */
  static getAutomationRule(id: string): IAutomationRule | null {
    return this.automationRules.find(r => r.id === id) || null;
  }

  /**
   * מחיקת כלל אוטומציה
   */
  static deleteAutomationRule(id: string): boolean {
    const initialLength = this.automationRules.length;
    this.automationRules = this.automationRules.filter(r => r.id !== id);
    return initialLength > this.automationRules.length;
  }

  /**
   * הפעלת אוטומציות על הודעה נכנסת
   */
  static async processIncomingMessage(
    sessionId: string,
    conversationId: string,
    message: { text: string; from: string }
  ): Promise<void> {
    try {
      // קבלת השיחה
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        throw new Error(`שיחה עם מזהה ${conversationId} לא נמצאה`);
      }
      
      // החלת כללי אוטומציה מבוססי מילות מפתח
      const keywordRules = this.automationRules.filter(
        rule => rule.isActive && rule.condition.type === 'keyword'
      );
      
      for (const rule of keywordRules) {
        const keywords = rule.condition.value as string[];
        
        if (typeof keywords === 'string') {
          if (message.text.toLowerCase().includes(keywords.toLowerCase())) {
            await this.executeAction(sessionId, conversation, rule.action);
          }
        } else if (Array.isArray(keywords)) {
          const found = keywords.some(keyword => 
            message.text.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (found) {
            await this.executeAction(sessionId, conversation, rule.action);
          }
        }
      }
    } catch (error) {
      logger.error(`שגיאה בעיבוד אוטומטי של הודעה בשיחה ${conversationId}:`, error);
    }
  }

  /**
   * הוספת תיוג לשיחה
   */
  static async tagConversation(conversationId: string, tag: string): Promise<IConversation> {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        throw new Error(`שיחה עם מזהה ${conversationId} לא נמצאה`);
      }
      
      if (!conversation.tags) {
        conversation.tags = [];
      }
      
      if (!conversation.tags.includes(tag)) {
        conversation.tags.push(tag);
        await conversation.save();
      }
      
      return conversation;
    } catch (error) {
      logger.error(`שגיאה בתיוג שיחה ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * הקצאת סוכן לשיחה
   */
  static async assignAgentToConversation(
    conversationId: string,
    agentId: string
  ): Promise<IConversation> {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        throw new Error(`שיחה עם מזהה ${conversationId} לא נמצאה`);
      }
      
      conversation.assignedTo = agentId;
      await conversation.save();
      
      return conversation;
    } catch (error) {
      logger.error(`שגיאה בהקצאת סוכן לשיחה ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * יצירת הודעת ברוכים הבאים לשיחה חדשה
   */
  static async sendWelcomeMessage(sessionId: string, conversation: IConversation): Promise<void> {
    try {
      const welcomeRule = this.automationRules.find(
        rule => rule.isActive && rule.condition.type === 'newConversation'
      );
      
      if (welcomeRule) {
        await this.executeAction(sessionId, conversation, welcomeRule.action);
      }
    } catch (error) {
      logger.error(`שגיאה בשליחת הודעת ברוכים הבאים לשיחה ${conversation._id}:`, error);
    }
  }

  /**
   * ביצוע פעולת אוטומציה
   */
  private static async executeAction(
    sessionId: string,
    conversation: IConversation,
    action: IAutomationRule['action']
  ): Promise<void> {
    if (action.delay && action.delay > 0) {
      setTimeout(() => {
        this.executeActionNow(sessionId, conversation, action);
      }, action.delay);
    } else {
      await this.executeActionNow(sessionId, conversation, action);
    }
  }

  /**
   * ביצוע מיידי של פעולת אוטומציה
   */
  private static async executeActionNow(
    sessionId: string,
    conversation: IConversation,
    action: IAutomationRule['action']
  ): Promise<void> {
    try {
      switch (action.type) {
        case 'sendMessage':
          const templateId = action.value;
          const template = this.getMessageTemplate(templateId);
          
          if (template) {
            await ConversationService.sendMessage(sessionId, {
              recipient: conversation.contact.phone,
              message: template.content,
            });
            
            logger.info(`הודעה אוטומטית נשלחה בשיחה ${conversation._id}: ${templateId}`);
          }
          break;
          
        case 'tagConversation':
          await this.tagConversation(conversation._id.toString(), action.value);
          logger.info(`תיוג אוטומטי הוסף לשיחה ${conversation._id}: ${action.value}`);
          break;
          
        case 'assignAgent':
          await this.assignAgentToConversation(conversation._id.toString(), action.value);
          logger.info(`סוכן הוקצה אוטומטית לשיחה ${conversation._id}: ${action.value}`);
          break;
          
        default:
          logger.warn(`סוג פעולה לא מוכר: ${(action as any).type}`);
      }
    } catch (error) {
      logger.error(`שגיאה בביצוע פעולת אוטומציה בשיחה ${conversation._id}:`, error);
    }
  }

  /**
   * הפעלת אוטומציה מבוססת זמן על שיחות
   */
  static async processTimeBasedAutomation(): Promise<void> {
    try {
      // מציאת כללי אוטומציה מבוססי זמן
      const inactivityRules = this.automationRules.filter(
        rule => rule.isActive && rule.condition.type === 'inactivity'
      );
      
      if (inactivityRules.length === 0) {
        return;
      }
      
      // עיבוד כל כלל
      for (const rule of inactivityRules) {
        const inactivityMinutes = typeof rule.condition.value === 'number' 
          ? rule.condition.value 
          : 30; // ברירת מחדל
        
        // חישוב זמן אי פעילות
        const inactivityThreshold = new Date();
        inactivityThreshold.setMinutes(inactivityThreshold.getMinutes() - inactivityMinutes);
        
        // מציאת שיחות עם אי פעילות
        const inactiveConversations = await Conversation.find({
          'lastMessage.timestamp': { $lt: inactivityThreshold },
          status: { $ne: 'closed' },
        });
        
        // החלת הכלל על כל שיחה
        for (const conversation of inactiveConversations) {
          const sessionId = conversation.session;
          await this.executeAction(sessionId.toString(), conversation, rule.action);
          
          logger.info(`פעולת אוטומציה מבוססת זמן בוצעה בשיחה ${conversation._id}`);
        }
      }
    } catch (error) {
      logger.error('שגיאה בעיבוד אוטומציה מבוססת זמן:', error);
    }
  }
} 