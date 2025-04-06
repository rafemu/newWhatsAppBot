import React, { useState } from 'react';
import { Grid, GridItem, Box, Text } from '@chakra-ui/react';
import { ChatList } from '@/components/features/ChatList';
import { ChatWindow } from '@/components/features/ChatWindow';

export const ChatsPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <Grid
      h="100vh"
      templateColumns="350px 1fr"
      gap={0}
    >
      <GridItem>
        <ChatList
          onChatSelect={(chatId) => setSelectedChatId(chatId)}
          selectedChatId={selectedChatId || undefined}
        />
      </GridItem>
      <GridItem>
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
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
  );
}; 