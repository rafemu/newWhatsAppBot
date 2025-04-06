import React, { ReactNode } from 'react';
import { Typography, Box, Breadcrumbs, Link, SxProps, Theme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: {
    to?: string;
    label: string;
  }[];
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  breadcrumbs, 
  action,
  sx = {}
}) => {
  return (
    <Box 
      sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: 'column',
        ...sx
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, index) => 
            crumb.to ? (
              <Link 
                key={index} 
                component={RouterLink} 
                to={crumb.to}
                underline="hover"
                color="inherit"
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={index} color="text.primary">
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader; 