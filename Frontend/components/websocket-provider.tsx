'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import webSocketService from '@/services/websocket';
import { addOrderViaWebSocket, updateOrderViaWebSocket } from '@/redux/slices/orderSlice';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup event listener for order updates from WebSocket
    const handleOrderUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;
      
      if (data.event === 'created') {
        dispatch(addOrderViaWebSocket(data.order));
      } else {
        dispatch(updateOrderViaWebSocket(data.order));
      }
    };

    // Setup event listener for WebSocket connection status
    const handleWsConnection = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('WebSocket connection status:', customEvent.detail.connected);
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
  }, [dispatch, user]);

  // This component doesn't render anything itself
  return <>{children}</>;
}
