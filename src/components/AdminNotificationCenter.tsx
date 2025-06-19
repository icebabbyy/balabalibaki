
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellRing } from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

interface AdminNotificationCenterProps {
  className?: string;
}

const AdminNotificationCenter = ({ className }: AdminNotificationCenterProps) => {
  const { unreadCount } = useRealtimeOrders();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-purple-700 hover:text-white relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {unreadCount > 0 && (
        <span className="text-sm text-white">
          {unreadCount} ออเดอร์ใหม่
        </span>
      )}
    </div>
  );
};

export default AdminNotificationCenter;
