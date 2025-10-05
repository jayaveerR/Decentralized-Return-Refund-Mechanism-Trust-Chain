import React from 'react';

interface ToastNotificationProps {
  showToast: boolean;
  toastMessage: string;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ 
  showToast, 
  toastMessage 
}) => {
  if (!showToast) return null;

  return (
    <div className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50 animate-fade-in">
      <div className="bg-gray-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-xs sm:max-w-sm">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm sm:text-base truncate">{toastMessage}</span>
      </div>
    </div>
  );
};