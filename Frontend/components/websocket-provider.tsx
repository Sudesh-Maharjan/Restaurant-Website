'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import webSocketService from '@/services/websocket';
import { addOrderViaWebSocket, updateOrderViaWebSocket, removeOrderViaWebSocket } from '@/redux/slices/orderSlice';
import { addNotification, fetchNotifications } from '@/redux/slices/notificationSlice';
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
    if (user?._id) {
      // Fetch notifications when user logs in
      dispatch(fetchNotifications());
    }
  }, [dispatch, user?._id]);

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
        }      } else if (data.event === 'statusUpdated') {
        dispatch(updateOrderViaWebSocket(data.order));
        
        // Use custom notification message if provided by backend, otherwise use default
        let notificationTitle = 'Order Status Updated';
        let notificationMessage = `Order #${data.order.orderNumber || data.order._id.substr(-6)} status: ${data.order.status}`;
        
        if (data.notification) {
          notificationTitle = data.notification.title || notificationTitle;
          notificationMessage = data.notification.message || notificationMessage;
        }
        
        // Create notification for status update
        const notificationId = uuidv4();
        const notification = {
          id: notificationId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'status_update' as const,
          status: data.order.status, // Add status to the notification for appropriate icon display
          isRead: false,
          orderId: data.order._id,
          timestamp: new Date().toISOString(),
        };
          dispatch(addNotification(notification));
        
        // Show toast notification with appropriate styling based on status
        let toastVariant: 'default' | 'destructive' | undefined = 'default';
        
        if (data.order.status === 'cancelled') {
          toastVariant = 'destructive';
        }          toast({
          title: notificationTitle,
          description: notificationMessage,          variant: toastVariant,
        });
      } else if (data.event === 'paymentUpdated') {
        // Handle payment status update
        dispatch(updateOrderViaWebSocket(data.order));
        
        // Create notification for payment update
        const notificationId = uuidv4();
        const notification = {
          id: notificationId,
          title: 'Payment Status Updated',
          message: `Order #${data.order.orderNumber || data.order._id.substr(-6)} is now ${data.order.paid ? 'paid' : 'unpaid'}`,
          type: 'status_update' as const,
          isRead: false,
          orderId: data.order._id,
          timestamp: new Date().toISOString(),
        };
        
        dispatch(addNotification(notification));
        
        // Show toast notification
        toast({
          title: 'Payment Status Updated',
          description: `Order #${data.order.orderNumber || data.order._id.substr(-6)} is now ${data.order.paid ? 'paid' : 'unpaid'}`,
          variant: 'default',
        });
      } else if (data.event === 'deleted') {
        // Handle order deletion
        dispatch(removeOrderViaWebSocket(data.order._id));
        
        // Create notification for deleted order
        const notificationId = uuidv4();
        const notification = {
          id: notificationId,
          title: 'Order Deleted',
          message: `Order #${data.order.orderNumber || data.order._id.substr(-6)} has been deleted`,
          type: 'status_update' as const,
          status: 'cancelled', // Use cancelled status for styling
          isRead: false,
          orderId: data.order._id,
          timestamp: new Date().toISOString(),
        };
        
        dispatch(addNotification(notification));
        
        // Show toast notification
        toast({
          title: 'Order Deleted',
          description: `Order #${data.order.orderNumber || data.order._id.substr(-6)} has been deleted`,
          variant: 'destructive',
        });
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
