import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Fetch initial notifications and unread count on login
  const refreshNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 15 });
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('[SocketContext] Error loading notifications:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshNotifications();

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log(`[Socket.IO Client] Connected with ID: ${newSocket.id}`);
        // Join private user room: user_<userId>
        newSocket.emit('join_user_room', user.id);

        if (user.role === 'admin') {
          newSocket.emit('join_admin_room');
        }
      });

      // Listen for real-time notifications directed to this user's private room
      newSocket.on('new_notification', (notification) => {
        console.log('[Socket.IO Client] Received real-time notification:', notification);
        
        // Update state
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show interactive Toast Alert
        toast.info(
          <div>
            <div className="font-semibold text-slate-900">{notification.title}</div>
            <div className="text-xs text-slate-600 mt-0.5">{notification.message}</div>
          </div>,
          {
            autoClose: 5000,
            icon: '🔔',
          }
        );
      });

      // Admin global alert
      if (user.role === 'admin') {
        newSocket.on('admin_alert', (alert) => {
          console.log('[Socket.IO Client] Admin alert received:', alert);
        });
      }

      return () => {
        if (newSocket) {
          newSocket.emit('leave_user_room', user.id);
          newSocket.disconnect();
        }
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user?.id]);

  const markAsRead = async (id) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[SocketContext] Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('[SocketContext] Error marking all notifications as read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
