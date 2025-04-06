import React, { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { IoSearch } from 'react-icons/io5';
import { Chat } from '../../types/chat';
import { chatService } from '../../services/chat';

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // טעינת רשימת הצ'אטים
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const fetchedChats = await chatService.getChats({ status: 'active' });
        setChats(fetchedChats);
      } catch (error) {
        toast({
          title: 'שגיאה בטעינת הצ'אטים',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  // סינון צ'אטים לפי חיפוש
  const filteredChats = chats.filter(chat =>
    chat.participants.some(participant =>
      participant.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // פורמט תאריך אחרון
  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString();
  };

  return (
    <Box w="100%" h="100%" borderRight="1px" borderColor="gray.200">
      {/* תיבת חיפוש */}
      <InputGroup p={4}>
        <InputLeftElement pointerEvents="none">
          <IoSearch />
        </InputLeftElement>
        <Input
          placeholder="חפש צ'אט..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {/* רשימת הצ'אטים */}
      <VStack spacing={0} overflowY="auto" h="calc(100% - 72px)">
        {isLoading ? (
          <Spinner m={4} />
        ) : (
          filteredChats.map((chat) => (
            <Box
              key={chat.id}
              w="100%"
              p={4}
              cursor="pointer"
              bg={selectedChatId === chat.id ? 'gray.100' : 'white'}
              _hover={{ bg: 'gray.50' }}
              onClick={() => onChatSelect(chat.id)}
              borderBottom="1px"
              borderColor="gray.100"
            >
              <HStack spacing={4}>
                <Avatar size="sm" name={chat.participants[0]} />
                <Box flex="1">
                  <Text fontWeight="bold">
                    {chat.participants[0]}
                    {chat.unreadCount > 0 && (
                      <Badge ml={2} colorScheme="blue">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </Text>
                  {chat.lastMessage && (
                    <>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {chat.lastMessage.content}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatLastMessageTime(chat.lastMessage.timestamp)}
                      </Text>
                    </>
                  )}
                </Box>
              </HStack>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}; 