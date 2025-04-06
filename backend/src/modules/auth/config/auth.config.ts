export const authConfig = {
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      sameSite: 'strict' as const,
    },
  },

  // Password configuration
  password: {
    saltRounds: 12,
    resetTokenExpiresIn: 10 * 60 * 1000, // 10 minutes
  },

  // 2FA configuration
  twoFactor: {
    issuer: 'WhatsApp Bot',
    window: 1, // Time window in which tokens are valid (1 means only the current token)
  },

  // Rate limiting configuration
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per windowMs
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per windowMs
    },
  },

  // Session configuration
  session: {
    name: 'refresh_token',
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },

  // User roles and permissions
  roles: {
    VIEWER: ['read:own'],
    AGENT: ['read:own', 'write:own'],
    MANAGER: ['read:own', 'write:own', 'read:all'],
    ADMIN: ['read:own', 'write:own', 'read:all', 'write:all'],
    SUPER_ADMIN: ['read:own', 'write:own', 'read:all', 'write:all', 'manage:all'],
  } as const,
}; 