export const config = {
  env: (import.meta.env.MODE as string) || 'development',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  
  app: {
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  },
  
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  },
  
  features: {
    emailScheduling: import.meta.env.VITE_ENABLE_EMAIL_SCHEDULING !== 'false',
    sms: import.meta.env.VITE_ENABLE_SMS === 'true',
    webhooks: import.meta.env.VITE_ENABLE_WEBHOOKS !== 'false',
    apiPlayground: import.meta.env.VITE_ENABLE_API_PLAYGROUND !== 'false',
    debugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
  },
  
  security: {
    rateLimit: {
      windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS || '900000'),
      maxRequests: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS || '100'),
    },
  },
  
  gdpr: {
    dataRetentionDays: parseInt(import.meta.env.VITE_DATA_RETENTION_DAYS || '730'),
    enableDataExport: import.meta.env.VITE_ENABLE_DATA_EXPORT !== 'false',
  },
}

export function validateConfig() {
  const errors: string[] = []
  
  if (config.isProd) {
    if (!import.meta.env.VITE_APP_URL) {
      errors.push('VITE_APP_URL is required in production')
    }
    
    if (!import.meta.env.VITE_API_BASE_URL) {
      errors.push('VITE_API_BASE_URL is required in production')
    }
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    return false
  }
  
  return true
}

if (config.features.debugLogs) {
  console.log('App Configuration:', {
    ...config,
    env: config.env,
    isProd: config.isProd,
    isDev: config.isDev,
  })
}

validateConfig()
