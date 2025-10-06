// Application configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://10.65.148.34:8001/:8001',
  
  // App Configuration
  APP_NAME: 'Center Management',
  APP_VERSION: '1.0.0',
  
  // Mobile Configuration
  MOBILE_BREAKPOINT: 768,
  TOUCH_TARGET_SIZE: 44, // Minimum touch target size in pixels
  
  // Telegram Mini App Configuration
  TELEGRAM_BOT_TOKEN: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || null,
  
  // Theme Configuration
  THEME_COLORS: {
    primary: '#0ea5e9',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  }
};

export default config;
