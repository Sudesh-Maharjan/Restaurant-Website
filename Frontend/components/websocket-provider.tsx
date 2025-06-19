'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import webSocketService from '@/services/websocket';
import { addOrderViaWebSocket, updateOrderViaWebSocket } from '@/redux/slices/orderSlice';
import { addNotification } from '@/redux/slices/notificationSlice';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup event listener for WebSocket connection status
    const handleWsConnection = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsConnected(customEvent.detail.connected);
      if (customEvent.detail.connected) {
        toast({
          title: 'Connected to Restaurant',
          description: 'You will receive real-time updates for your orders',
          variant: 'default',
        });
      }
    };

    // Setup event listener for order updates from WebSocket
    const handleOrderUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;
      
      console.log('Order update received:', data);
      
      if (data.event === 'created') {
        dispatch(addOrderViaWebSocket(data.order));
        
        // Add notification for new order
        const notificationId = uuidv4();
        const notification = {
          id: notificationId,
          title: user?.role === 'admin' ? 'New Order Received' : 'Order Placed',
          message: user?.role === 'admin' 
            ? `Order #${data.order._id.substr(-6)} has been placed` 
            : 'Your order has been received by the restaurant',
          type: 'order_placed' as const,
          isRead: false,
          orderId: data.order._id,
          timestamp: new Date().toISOString(),
        };
        
        dispatch(addNotification(notification));
        
        // Show toast notification
        if (user?.role === 'admin') {
          toast({
            title: 'New Order Received',
            description: `Order #${data.order._id.substr(-6)} has been placed`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Order Placed',
            description: 'Your order has been received by the restaurant',
            variant: 'default',
          });
        }
      } else if (data.event === 'statusUpdated') {
        dispatch(updateOrderViaWebSocket(data.order));
        
        // Status message mapping
        const statusMessages: Record<string, string> = {
          pending: 'Your order has been received',
          preparing: 'Your order is being prepared',
          ready: 'Your order is ready for pickup/delivery',
          delivered: 'Your order has been delivered',
          cancelled: 'Your order has been cancelled'
        };
        
        // Create notification for status update
        const notificationId = uuidv4();
        const notification = {
          id: notificationId,
          title: 'Order Status Updated',
          message: statusMessages[data.order.status] || `Status: ${data.order.status}`,
          type: 'status_update' as const,
          isRead: false,
          orderId: data.order._id,
          timestamp: new Date().toISOString(),
        };
        
        dispatch(addNotification(notification));
        
        // Show toast notification for customer
        if (user?.role !== 'admin') {
          toast({
            title: 'Order Status Updated',
            description: statusMessages[data.order.status] || `Status: ${data.order.status}`,
            variant: 'default',
          });
        }
      }
    };

    window.addEventListener('orderUpdate', handleOrderUpdate);
    window.addEventListener('wsConnected', handleWsConnection);

    // Connect to WebSocket if user is logged in
    if (user) {
      const clientType = user.role === 'admin' ? 'admin' : 'customer';
      webSocketService?.connect(clientType, user._id);
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener('orderUpdate', handleOrderUpdate);
      window.removeEventListener('wsConnected', handleWsConnection);
      webSocketService?.disconnect();
    };
  }, [dispatch, user, toast]);

  // This component doesn't render anything itself
  return <>{children}</>;
}
