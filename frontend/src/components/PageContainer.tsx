import React, { ReactNode } from 'react';
import { Box, Container, Paper, SxProps, Theme } from '@mui/material';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
  disablePadding?: boolean;
  usePaper?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  maxWidth = 'lg', 
  sx = {},
  disablePadding = false,
  usePaper = false
}) => {
  const content = (
    <Box 
      sx={{ 
        py: disablePadding ? 0 : 3, 
        px: disablePadding ? 0 : { xs: 2, sm: 3 },
        height: '100%',
        ...sx
      }}
    >
      {children}
    </Box>
  );

  return (
    <Container 
      maxWidth={maxWidth} 
      disableGutters 
      sx={{ my: 2 }}
    >
      {usePaper ? (
        <Paper 
          elevation={1} 
          sx={{ borderRadius: 2, overflow: 'hidden' }}
        >
          {content}
        </Paper>
      ) : (
        content
      )}
    </Container>
  );
};

export default PageContainer; 