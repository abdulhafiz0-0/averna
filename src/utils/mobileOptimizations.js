// Mobile optimization utilities for Telegram Mini App

export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isTelegramWebApp = () => {
  return window.Telegram && window.Telegram.WebApp;
};

export const setupTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    const tg = window.Telegram.WebApp;
    
    // Configure the app
    tg.ready();
    tg.expand();
    
    // Set theme
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#f9fafb');
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    return tg;
  }
  return null;
};

export const showTelegramAlert = (message) => {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    alert(message);
  }
};

export const showTelegramConfirm = (message, callback) => {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.showConfirm(message, callback);
  } else {
    const result = window.confirm(message);
    callback(result);
  }
};

export const closeTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.close();
  }
};

export const getTelegramUser = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp.initDataUnsafe?.user;
  }
  return null;
};

// Viewport height fix for mobile browsers
export const setViewportHeight = () => {
  const setHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setHeight();
  window.addEventListener('resize', setHeight);
  window.addEventListener('orientationchange', setHeight);
};

// Touch-friendly button sizes
export const getTouchTargetSize = () => {
  return isMobile() ? 'min-h-[44px] min-w-[44px]' : '';
};

// Mobile-specific styles
export const getMobileStyles = () => {
  return {
    container: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
    card: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6',
    button: `${getTouchTargetSize()} flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200`,
    input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    modal: 'fixed inset-0 z-50 overflow-y-auto',
    modalContent: 'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'
  };
};
