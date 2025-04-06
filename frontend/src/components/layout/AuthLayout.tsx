import { Outlet } from 'react-router-dom'
import { Box, Container, Paper } from '@mui/material'

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{ width: 150, height: 'auto', mb: 4 }}
          />
          <Outlet />
        </Paper>
      </Container>
    </Box>
  )
}

export default AuthLayout 