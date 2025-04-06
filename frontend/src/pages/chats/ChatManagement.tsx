import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Grid, 
  GridItem,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '@/types/chat';
import { chatService } from '@/services/chat';
import { useNotification } from '@/components/NotificationProvider';

const ChatManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const fetchedChats = await chatService.getChats({ status: 'active' });
        setChats(fetchedChats);
      } catch (error) {
        showNotification({
          title: "שגיאה בטעינת הצ'אטים",
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  return (
    <Container maxW="container.xl" py={5}>
      <Box mb={5}>
        <Text fontSize="2xl" fontWeight="bold">ניהול שיחות</Text>
      </Box>
      
      <Grid templateColumns="350px 1fr" gap={4} h="calc(100vh - 200px)">
        <GridItem
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
        >
          {/* רשימת הצ'אטים */}
          <Box>
            {isLoading ? (
              <Box p={4} textAlign="center">טוען...</Box>
            ) : chats.length === 0 ? (
              <Box p={4} textAlign="center">אין שיחות פעילות</Box>
            ) : (
              <Box>
                {chats.map((chat) => (
                  <Box
                    key={chat.id}
                    p={4}
                    cursor="pointer"
                    borderBottomWidth="1px"
                    onClick={() => setSelectedChatId(chat.id)}
                    bg={selectedChatId === chat.id ? 'gray.50' : 'white'}
                    _hover={{ bg: 'gray.50' }}
                  >
                    <Text fontWeight="bold">{chat.participants.join(', ')}</Text>
                    {chat.lastMessage && (
                      <Text fontSize="sm" color="gray.600">
                        {chat.lastMessage.content}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </GridItem>

        <GridItem
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
        >
          {/* תצוגת צ'אט */}
          {selectedChatId ? (
            <Box h="100%" p={4}>
              {/* כאן תהיה תצוגת הצ'אט הנבחר */}
              <Text>צ'אט מספר: {selectedChatId}</Text>
            </Box>
          ) : (
            <Box
              h="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="gray.50"
            >
              <Text color="gray.500">בחר צ'אט להצגה</Text>
            </Box>
          )}
        </GridItem>
      </Grid>
    </Container>
  );
};

export default ChatManagement; 