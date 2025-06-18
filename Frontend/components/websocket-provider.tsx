'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import webSocketService from '@/services/websocket';
import { addOrderViaWebSocket, updateOrderViaWebSocket } from '@/redux/slices/orderSlice';
import { useToast } from '@/hooks/use-toast';

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
        // Show notification for new order
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
        // Show notification for status update
        const statusMessages: Record<string, string> = {
          pending: 'Your order has been received',
          preparing: 'Your order is being prepared',
          ready: 'Your order is ready for pickup/delivery',
          delivered: 'Your order has been delivered',
          cancelled: 'Your order has been cancelled'
        };
        
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
