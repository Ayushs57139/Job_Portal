import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import api from '../../config/api';
import socketService from '../../services/socketService';

const ChatConversationScreen = ({ navigation, route }) => {
  const conversationId = route?.params?.conversationId;
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const typingTimeoutRef = useRef(null);

  // Safety check - if no conversationId, show error and go back
  useEffect(() => {
    if (!conversationId) {
      Alert.alert('Error', 'Conversation ID is missing', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
  }, [conversationId, navigation]);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    // Load data with proper error handling
    const initializeScreen = async () => {
      try {
        // First load current user (non-blocking)
        loadCurrentUser().catch(err => {
          console.error('Error loading user (non-blocking):', err);
        });
        
        // Load conversation and messages in parallel with individual error handling
        Promise.all([
          loadConversation().catch(err => {
            console.error('Error loading conversation (non-blocking):', err);
          }),
          loadMessages().catch(err => {
            console.error('Error loading messages (non-blocking):', err);
          })
        ]).finally(() => {
          // Always set loading to false after attempts
          setLoading(false);
        });
        
        // Mark conversation as read after loading (non-blocking)
        setTimeout(() => {
          markAsRead().catch(err => {
            console.error('Error marking as read (non-blocking):', err);
          });
        }, 1000);

        // Connect to socket and join conversation (non-blocking)
        socketService.connect().then(() => {
          setIsConnected(true);
          if (conversationId) {
            socketService.joinConversation(conversationId);
          }
        }).catch(socketError => {
          console.error('Socket connection error (non-blocking):', socketError);
          setIsConnected(false);
        });
      } catch (error) {
        console.error('Error initializing screen:', error);
        setLoading(false);
      }
    };

    initializeScreen();
  }, [conversationId]);

  // Set up socket listeners in a separate effect after connection is established
  useEffect(() => {
    if (!isConnected || !conversationId) return;

    // Listen for new messages
    const unsubscribeNewMessage = socketService.onNewMessage((data) => {
      if (data.conversationId === conversationId) {
        // Check if message already exists
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === data.message._id);
          if (!exists) {
            return [...prev, data.message];
          }
          return prev;
        });
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Mark as read if it's not from current user
        if (data.message.sender._id !== currentUser?._id) {
          markAsRead();
        }
      }
    });

    // Listen for message notifications
    const unsubscribeNotification = socketService.onMessageNotification((data) => {
      if (data.conversationId === conversationId) {
        // Update conversation unread count
        loadConversation();
      }
    });

    // Listen for typing indicators
    const unsubscribeTyping = socketService.onUserTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== currentUser?._id) {
        // Handle typing indicator (you can add UI for this)
        console.log('User typing:', data.userName);
      }
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeNotification();
      unsubscribeTyping();
    };
  }, [isConnected, conversationId, currentUser]);

  // Cleanup: Leave conversation when component unmounts
  useEffect(() => {
    return () => {
      if (conversationId) {
        socketService.leaveConversation(conversationId);
      }
    };
  }, [conversationId]);

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUserFromStorage();
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  };

  const loadConversation = async () => {
    if (!conversationId) return;
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        api.getConversation(conversationId),
        timeoutPromise
      ]);
      
      if (response.success) {
        setConversation(response.conversation);
        
        // Update navigation title
        const otherParticipant = getOtherParticipant(response.conversation);
        if (otherParticipant) {
          navigation.setOptions({
            title: `${otherParticipant.firstName} ${otherParticipant.lastName}`
          });
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Don't show alert for timeout, just log it
      if (error.message !== 'Request timeout') {
        Alert.alert('Error', 'Failed to load conversation details');
      }
      setLoading(false);
    }
  };

  const loadMessages = async (showLoading = true) => {
    if (!conversationId) {
      if (showLoading) setLoading(false);
      return;
    }
    
    try {
      if (showLoading) setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        api.getConversationMessages(conversationId, page, 50),
        timeoutPromise
      ]);
      
      if (response.success) {
        setMessages(response.messages || []);
        setConversation(response.conversation);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (showLoading) {
        // Don't show alert for timeout, just log it
        if (error.message !== 'Request timeout') {
          Alert.alert('Error', 'Failed to load messages');
        }
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!conversationId) return;
    
    try {
      await api.markConversationAsRead(conversationId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;

    const content = messageText.trim();
    setMessageText('');
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isConnected && conversationId) {
      socketService.stopTyping(conversationId);
    }

    const tempMessage = {
      _id: Date.now().toString(),
      content: content,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, tempMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      setSending(true);
      
      // Send via socket if connected, otherwise fallback to API
      if (isConnected) {
        socketService.sendMessage(conversationId, content);
        // The message will be updated when we receive it via socket
        // For now, mark it as sent
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === tempMessage._id 
                ? { ...msg, status: 'sent' }
                : msg
            )
          );
        }, 500);
      } else {
        // Fallback to API if socket not connected
        const response = await api.sendMessage(conversationId, content);
        
        if (response.success) {
          // Replace temp message with actual message
          setMessages(prev => 
            prev.map(msg => msg._id === tempMessage._id ? response.message : msg)
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setMessageText(content); // Restore the message text
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTextChange = (text) => {
    setMessageText(text);
    
    if (isConnected && conversationId) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Start typing indicator
      socketService.startTyping(conversationId);
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (conversationId) {
          socketService.stopTyping(conversationId);
        }
      }, 3000);
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !currentUser) return null;
    
    const otherParticipants = conv.participants.filter(
      p => p.user && p.user._id !== currentUser._id
    );
    
    return otherParticipants.length > 0 ? otherParticipants[0].user : null;
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender._id === currentUser?._id || item.sender === currentUser?._id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !previousMessage || 
      formatMessageDate(item.createdAt) !== formatMessageDate(previousMessage.createdAt);

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>
              {formatMessageDate(item.createdAt)}
            </Text>
            <View style={styles.dateSeparatorLine} />
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}>
          {!isMyMessage && (
            <View style={styles.senderAvatar}>
              <Text style={styles.senderAvatarText}>
                {item.sender.firstName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
          ]}>
            {!isMyMessage && (
              <Text style={styles.senderName}>
                {item.sender.firstName} {item.sender.lastName}
              </Text>
            )}
            
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime
              ]}>
                {formatMessageTime(item.createdAt)}
              </Text>
              
              {isMyMessage && (
                <Ionicons 
                  name={item.status === 'sending' ? 'time-outline' : 'checkmark-done'} 
                  size={14} 
                  color={colors.white} 
                  style={styles.messageStatusIcon}
                />
              )}
            </View>
          </View>

          {isMyMessage && <View style={styles.spacer} />}
        </View>
      </View>
    );
  };

  // Show error if conversationId is missing
  if (!conversationId) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.loadingText}>Conversation ID is missing</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
          />
        </View>
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    ...typography.button,
    color: colors.white,
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateSeparatorText: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  senderAvatarText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  spacer: {
    width: 32 + spacing.sm,
  },
  messageBubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  otherMessageBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: borderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.body1,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: colors.textSecondary,
  },
  messageStatusIcon: {
    marginLeft: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
  },
  input: {
    ...typography.body1,
    color: colors.text,
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
  },
});

export default ChatConversationScreen;


