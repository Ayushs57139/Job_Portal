import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('[Socket] No token found, cannot connect');
        return null;
      }

      // Get base URL from api instance (remove /api suffix for socket.io)
      const apiBaseURL = api.baseURL || 'http://localhost:5000/api';
      const baseURL = apiBaseURL.replace('/api', '');
      
      console.log('[Socket] Connecting to:', baseURL);

      this.socket = io(baseURL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
      });

      this.setupEventHandlers();

      return this.socket;
    } catch (error) {
      console.error('[Socket] Connection error:', error);
      return null;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket_connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      this.isConnected = false;
      this.emit('socket_disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      this.reconnectAttempts++;
      this.emit('socket_error', error);
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
      this.emit('socket_error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket_reconnected', attemptNumber);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed');
      this.emit('socket_reconnect_failed');
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('[Socket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      console.log('[Socket] Joining conversation:', conversationId);
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      console.log('[Socket] Leaving conversation:', conversationId);
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Send a message via socket
  sendMessage(conversationId, content, replyTo = null) {
    if (this.socket && this.isConnected) {
      console.log('[Socket] Sending message to conversation:', conversationId);
      this.socket.emit('send_message', {
        conversationId,
        content,
        replyTo
      });
    } else {
      console.warn('[Socket] Cannot send message, socket not connected');
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (!this.socket) return () => {};

    const handler = (data) => {
      console.log('[Socket] New message received:', data);
      callback(data);
    };

    this.socket.on('new_message', handler);
    
    return () => {
      this.socket?.off('new_message', handler);
    };
  }

  // Listen for message notifications
  onMessageNotification(callback) {
    if (!this.socket) return () => {};

    const handler = (data) => {
      console.log('[Socket] Message notification received:', data);
      callback(data);
    };

    this.socket.on('message_notification', handler);
    
    return () => {
      this.socket?.off('message_notification', handler);
    };
  }

  // Typing indicators
  startTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  onUserTyping(callback) {
    if (!this.socket) return () => {};

    const handler = (data) => {
      callback(data);
    };

    this.socket.on('user_typing', handler);
    
    return () => {
      this.socket?.off('user_typing', handler);
    };
  }

  onUserStoppedTyping(callback) {
    if (!this.socket) return () => {};

    const handler = (data) => {
      callback(data);
    };

    this.socket.on('user_stopped_typing', handler);
    
    return () => {
      this.socket?.off('user_stopped_typing', handler);
    };
  }

  // Generic event listener
  on(event, callback) {
    if (!this.socket) return () => {};

    this.socket.on(event, callback);
    
    return () => {
      this.socket?.off(event, callback);
    };
  }

  // Generic event emitter (for internal use)
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Socket] Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Add listener for socket events (connection, disconnection, etc.)
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

