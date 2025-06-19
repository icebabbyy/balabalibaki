
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeNotifications = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current notification permission
    setNotificationPermission(Notification.permission);
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationPermission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  return {
    notificationPermission,
    requestNotificationPermission,
    showNotification
  };
};
