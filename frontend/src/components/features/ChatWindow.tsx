import React, { useState, useEffect, useRef } from 'react';
import { Box, VStack, HStack, Input, IconButton, Text, useToast } from '@chakra-ui/react';
import { IoSend, IoImage, IoAttach } from 'react-icons/io5';
import { Message, Chat } from '../../types/chat';
import { chatService } from '../../services/chat';

interface ChatWindowProps {
  chatId: string;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // טעינת הודעות
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const fetchedMessages = await chatService.getChatMessages(chatId);
        setMessages(fetchedMessages);
      } catch (error) {
        toast({
          title: 'שגיאה בטעינת ההודעות',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // גלילה לסוף הצ'אט
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // שליחת הודעה
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = await chatService.sendMessage(chatId, {
        content: newMessage,
        type: 'text',
        sender: 'current-user', // יש להחליף עם המזהה האמיתי של המשתמש
        recipient: chatId
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'שגיאה בשליחת ההודעה',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // העלאת קובץ
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const message = await chatService.uploadFile(chatId, file);
      setMessages(prev => [...prev, message]);
    } catch (error) {
      toast({
        title: 'שגיאה בהעלאת הקובץ',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* אזור ההודעות */}
      <VStack flex="1" overflowY="auto" p={4} spacing={4}>
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.sender === 'current-user' ? 'flex-end' : 'flex-start'}
            bg={message.sender === 'current-user' ? 'blue.500' : 'gray.100'}
            color={message.sender === 'current-user' ? 'white' : 'black'}
            p={2}
            borderRadius="lg"
            maxW="70%"
          >
            <Text>{message.content}</Text>
            <Text fontSize="xs" opacity={0.7}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      {/* תיבת שליחת הודעה */}
      <HStack p={4} bg="white" borderTop="1px" borderColor="gray.200">
        <IconButton
          aria-label="העלאת תמונה"
          icon={<IoImage />}
          onClick={() => fileInputRef.current?.click()}
        />
        <IconButton
          aria-label="צירוף קובץ"
          icon={<IoAttach />}
          onClick={() => fileInputRef.current?.click()}
        />
        <Input
          placeholder="הקלד הודעה..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <IconButton
          aria-label="שלח הודעה"
          icon={<IoSend />}
          colorScheme="blue"
          onClick={handleSendMessage}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx"
        />
      </HStack>
    </Box>
  );
}; 