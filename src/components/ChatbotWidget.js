import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Modal, 
  KeyboardAvoidingView, 
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/theme';
import { useResponsive } from '../utils/responsive';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

const isWeb = getPlatform().OS === 'web';

const ChatbotWidget = () => {
  const responsive = useResponsive();
  const isPhone = responsive.width <= 480;
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const isDesktop = responsive.isDesktop;
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSession();
    startPulseAnimation();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Hello! Welcome to Free Job Wala! 👋\n\nI'm here to help you with:\n\n• Finding jobs\n• Application process\n• Resume tips\n• Company information\n• Any other queries\n\nHow can I assist you today?");
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadSession = async () => {
    try {
      const savedSessionId = await AsyncStorage.getItem('chatbotSessionId');
      const savedMessages = await AsyncStorage.getItem('chatbotMessages');
      
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const startNewSession = async () => {
    try {
      const response = await fetch(`${API_URL}/chatbot/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName: 'Guest',
          platform: getPlatform().OS,
          userAgent: getPlatform().OS === 'web' ? (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown') : `React Native ${getPlatform().Version || 'unknown'}`
        })
      });

      const data = await response.json();
      
      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        await AsyncStorage.setItem('chatbotSessionId', data.sessionId);
        return data.sessionId;
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
    return null;
  };

  const addBotMessage = (text) => {
    const newMessage = {
      sender: 'bot',
      message: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => {
      const updated = [...prev, newMessage];
      AsyncStorage.setItem('chatbotMessages', JSON.stringify(updated));
      return updated;
    });
  };

  const handleQuickAction = async (action) => {
    const actionMessages = {
      'Find Jobs': 'How can I search for jobs?',
      'How to Apply': 'How do I apply for jobs?',
      'Resume Tips': 'What are some resume tips?',
      'Contact Support': 'How can I contact support?',
      'Job Alerts': 'How do I create job alerts?',
      'Profile Help': 'How do I update my profile?'
    };

    const message = actionMessages[action] || action;
    setInputText(message);
    
    // Small delay for better UX
    setTimeout(() => {
      handleSendMessage(message);
    }, 100);
  };

  const handleSendMessage = async (quickMessage = null) => {
    const userMessage = quickMessage || inputText.trim();
    if (!userMessage) return;

    setInputText('');
    setError(null);

    // Add user message to UI
    const newUserMessage = {
      sender: 'user',
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => {
      const updated = [...prev, newUserMessage];
      AsyncStorage.setItem('chatbotMessages', JSON.stringify(updated));
      return updated;
    });

    setIsTyping(true);
    setLoading(true);

    try {
      // Ensure we have a session
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await startNewSession();
      }

      if (!currentSessionId) {
        throw new Error('Failed to start session');
      }

      // Send message to backend
      const response = await fetch(`${API_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: userMessage,
          sender: 'user'
        })
      });

      const data = await response.json();

      if (data.success && data.botResponse) {
        // Simulate typing delay for better UX
        setTimeout(() => {
          addBotMessage(data.botResponse);
          setIsTyping(false);
          setLoading(false);
        }, 800 + Math.random() * 500);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setLoading(false);
      setError('Connection error. Please try again.');
      
      // Fallback response
      setTimeout(() => {
        addBotMessage("I'm sorry, I'm having trouble connecting right now. 😔\n\nPlease try again in a moment, or you can:\n\n• Visit our Help Center\n• Contact support directly\n• Try refreshing the page\n\nI'm here to help once the connection is restored!");
      }, 500);
    }
  };

  const handleClearChat = async () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    await AsyncStorage.removeItem('chatbotSessionId');
    await AsyncStorage.removeItem('chatbotMessages');
    
    setTimeout(() => {
      addBotMessage("Chat cleared! How can I help you today? 😊");
    }, 300);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    { id: 'find-jobs', label: 'Find Jobs', icon: 'search-outline' },
    { id: 'how-to-apply', label: 'How to Apply', icon: 'document-text-outline' },
    { id: 'resume-tips', label: 'Resume Tips', icon: 'create-outline' },
    { id: 'job-alerts', label: 'Job Alerts', icon: 'notifications-outline' },
    { id: 'contact-support', label: 'Contact Support', icon: 'headset-outline' },
    { id: 'profile-help', label: 'Profile Help', icon: 'person-outline' }
  ];

  const dynamicStyles = useMemo(() => {
    return getStyles(isPhone, isMobile, isTablet, isDesktop, responsive.width, responsive.height);
  }, [isPhone, isMobile, isTablet, isDesktop, responsive.width, responsive.height]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Animated.View
          style={[
            dynamicStyles.floatingButton,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => setIsOpen(true)}
            activeOpacity={0.8}
            style={dynamicStyles.floatingButtonInner}
          >
            <Ionicons name="chatbubbles" size={isPhone ? 24 : 28} color="#FFF" />
            <View style={dynamicStyles.pulseDot} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.backdrop}
          activeOpacity={1}
          onPress={() => !isMinimized && setIsOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={getPlatform().OS === 'ios' ? 'padding' : 'height'}
            style={dynamicStyles.modalContainer}
            keyboardVerticalOffset={getPlatform().OS === 'ios' ? 0 : 0}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={dynamicStyles.chatWrapper}
            >
              <View style={[
                dynamicStyles.chatContainer,
                isMinimized && dynamicStyles.chatContainerMinimized
              ]}>
                {/* Header */}
                <View style={dynamicStyles.chatHeader}>
                  <View style={dynamicStyles.headerLeft}>
                    <View style={dynamicStyles.botAvatar}>
                      <Ionicons name="chatbubbles" size={isPhone ? 18 : 22} color="#FFF" />
                    </View>
                    <View style={dynamicStyles.headerInfo}>
                      <Text style={dynamicStyles.chatTitle}>Free Job Wala Bot</Text>
                      <View style={dynamicStyles.statusIndicator}>
                        <View style={dynamicStyles.onlineDot} />
                        <Text style={dynamicStyles.statusText}>Online</Text>
                      </View>
                    </View>
                  </View>
                  <View style={dynamicStyles.headerRight}>
                    <TouchableOpacity
                      style={dynamicStyles.headerButton}
                      onPress={handleClearChat}
                    >
                      <Ionicons name="refresh-outline" size={isPhone ? 18 : 20} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={dynamicStyles.headerButton}
                      onPress={() => setIsMinimized(!isMinimized)}
                    >
                      <Ionicons 
                        name={isMinimized ? "expand-outline" : "remove-outline"} 
                        size={isPhone ? 18 : 20} 
                        color="#FFF" 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={dynamicStyles.headerButton}
                      onPress={() => setIsOpen(false)}
                    >
                      <Ionicons name="close" size={isPhone ? 20 : 22} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {!isMinimized && (
                  <>
                    {/* Messages */}
                    <ScrollView
                      ref={scrollViewRef}
                      style={dynamicStyles.messagesContainer}
                      contentContainerStyle={dynamicStyles.messagesContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {messages.length === 0 && (
                        <View style={dynamicStyles.welcomeContainer}>
                          <Ionicons name="chatbubbles" size={isPhone ? 36 : 48} color={colors.primary} style={dynamicStyles.welcomeIcon} />
                          <Text style={dynamicStyles.welcomeText}>Start a conversation!</Text>
                        </View>
                      )}

                      {messages.map((msg, index) => (
                        <View
                          key={index}
                          style={[
                            dynamicStyles.messageBubble,
                            msg.sender === 'user' ? dynamicStyles.userBubble : dynamicStyles.botBubble
                          ]}
                        >
                          {msg.sender === 'bot' && (
                            <View style={dynamicStyles.botAvatarSmall}>
                              <Ionicons name="chatbubbles" size={isPhone ? 12 : 14} color="#FFF" />
                            </View>
                          )}
                          <View style={[
                            dynamicStyles.messageContent,
                            msg.sender === 'user' ? dynamicStyles.userMessageContent : dynamicStyles.botMessageContent
                          ]}>
                            <Text style={[
                              dynamicStyles.messageText,
                              msg.sender === 'user' ? dynamicStyles.userText : dynamicStyles.botText
                            ]}>
                              {msg.message}
                            </Text>
                            <Text style={[
                              dynamicStyles.messageTime,
                              msg.sender === 'user' ? dynamicStyles.userTime : dynamicStyles.botTime
                            ]}>
                              {formatTime(msg.timestamp)}
                            </Text>
                          </View>
                          {msg.sender === 'user' && (
                            <View style={dynamicStyles.userAvatarSmall}>
                              <Ionicons name="person" size={isPhone ? 12 : 14} color="#FFF" />
                            </View>
                          )}
                        </View>
                      ))}

                      {isTyping && (
                        <View style={[dynamicStyles.messageBubble, dynamicStyles.botBubble]}>
                          <View style={dynamicStyles.botAvatarSmall}>
                            <Ionicons name="chatbubbles" size={isPhone ? 12 : 14} color="#FFF" />
                          </View>
                          <View style={dynamicStyles.messageContent}>
                            <View style={dynamicStyles.typingIndicator}>
                              <View style={[dynamicStyles.typingDot, dynamicStyles.dot1]} />
                              <View style={[dynamicStyles.typingDot, dynamicStyles.dot2]} />
                              <View style={[dynamicStyles.typingDot, dynamicStyles.dot3]} />
                            </View>
                          </View>
                        </View>
                      )}

                      {error && (
                        <View style={dynamicStyles.errorContainer}>
                          <Ionicons name="alert-circle" size={isPhone ? 14 : 16} color={colors.error} />
                          <Text style={dynamicStyles.errorText}>{error}</Text>
                        </View>
                      )}
                    </ScrollView>

                    {/* Quick Actions */}
                    <View style={dynamicStyles.quickActions}>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={dynamicStyles.quickActionsContent}
                      >
                        {quickActions.map((action) => (
                          <TouchableOpacity
                            key={action.id}
                            style={dynamicStyles.quickActionButton}
                            onPress={() => handleQuickAction(action.label)}
                            disabled={loading}
                          >
                            <Ionicons name={action.icon} size={isPhone ? 14 : 16} color={colors.primary} />
                            <Text style={dynamicStyles.quickActionText}>{action.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Input */}
                    <View style={dynamicStyles.inputContainer}>
                      <View style={dynamicStyles.inputWrapper}>
                        <TextInput
                          ref={inputRef}
                          style={dynamicStyles.input}
                          placeholder="Type your message..."
                          value={inputText}
                          onChangeText={setInputText}
                          multiline
                          maxLength={500}
                          placeholderTextColor={colors.textLight}
                          editable={!loading}
                          onSubmitEditing={() => inputText.trim() && handleSendMessage()}
                        />
                        {inputText.length > 0 && (
                          <Text style={dynamicStyles.charCount}>{inputText.length}/500</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.sendButton, 
                          (!inputText.trim() || loading) && dynamicStyles.sendButtonDisabled
                        ]}
                        onPress={() => handleSendMessage()}
                        disabled={!inputText.trim() || loading}
                        activeOpacity={0.7}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Ionicons name="send" size={isPhone ? 18 : 20} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const getStyles = (isPhone, isMobile, isTablet, isDesktop, width, height) => {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      ...(isWeb && !isPhone && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }),
    },
    floatingButton: {
      position: 'absolute',
      bottom: isPhone ? 16 : (isMobile ? 20 : 30),
      right: isPhone ? 16 : (isMobile ? 20 : 30),
      zIndex: 1000,
      ...shadows.lg,
    },
    floatingButtonInner: {
      width: isPhone ? 52 : (isMobile ? 56 : 64),
      height: isPhone ? 52 : (isMobile ? 56 : 64),
      borderRadius: isPhone ? 26 : (isMobile ? 28 : 32),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulseDot: {
      position: 'absolute',
      top: isPhone ? 6 : 8,
      right: isPhone ? 6 : 8,
      width: isPhone ? 10 : 12,
      height: isPhone ? 10 : 12,
      borderRadius: isPhone ? 5 : 6,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: '#FFF',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      padding: isPhone ? spacing.sm : (isMobile ? spacing.md : spacing.lg),
      paddingTop: isPhone ? 50 : (isMobile ? 60 : (isWeb && isDesktop ? 80 : 80)),
      paddingBottom: isPhone ? 16 : (isMobile ? 20 : (isWeb && isDesktop ? 30 : 30)),
      ...(isWeb && !isPhone && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        padding: spacing.lg,
        paddingTop: 80,
        paddingBottom: 30,
      }),
    },
    chatWrapper: {
      width: '100%',
      alignItems: 'flex-end',
      ...(isWeb && !isPhone && {
        width: 'auto',
        pointerEvents: 'auto',
      }),
    },
    chatContainer: {
      width: isPhone ? Math.min(width * 0.92, 340) : (isMobile ? Math.min(width * 0.85, 380) : (isTablet ? 420 : 450)),
      maxWidth: isPhone ? 340 : (isMobile ? 380 : 450),
      height: isPhone ? Math.min(height * 0.6, 500) : (isMobile ? Math.min(height * 0.65, 550) : (isTablet ? 600 : (isWeb && isDesktop ? Math.min(height * 0.7, 600) : 650))),
      maxHeight: isPhone ? 500 : (isMobile ? 550 : (isWeb && isDesktop ? 600 : 700)),
      backgroundColor: '#FFF',
      borderRadius: isPhone ? borderRadius.lg : borderRadius.xl,
      overflow: 'hidden',
      ...shadows.lg,
      ...(isWeb && !isPhone && {
        position: 'relative',
        marginBottom: spacing.lg,
        marginRight: spacing.lg,
      }),
    },
    chatContainerMinimized: {
      height: isPhone ? 50 : 60,
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary,
      padding: isPhone ? spacing.sm : spacing.md,
      paddingTop: isPhone ? spacing.sm : (isMobile ? spacing.md : spacing.lg),
      ...shadows.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isPhone ? spacing.xs : spacing.sm,
      flex: 1,
    },
    botAvatar: {
      width: isPhone ? 36 : (isMobile ? 40 : 44),
      height: isPhone ? 36 : (isMobile ? 40 : 44),
      borderRadius: isPhone ? 18 : (isMobile ? 20 : 22),
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerInfo: {
      flex: 1,
    },
    chatTitle: {
      ...typography.h6,
      fontWeight: '700',
      color: '#FFF',
      fontSize: isPhone ? 13 : (isMobile ? 14 : 16),
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs / 2,
      marginTop: 2,
    },
    onlineDot: {
      width: isPhone ? 6 : 8,
      height: isPhone ? 6 : 8,
      borderRadius: isPhone ? 3 : 4,
      backgroundColor: colors.success,
    },
    statusText: {
      ...typography.caption,
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: isPhone ? 10 : 11,
    },
    headerRight: {
      flexDirection: 'row',
      gap: isPhone ? spacing.xs / 2 : spacing.xs,
    },
    headerButton: {
      padding: isPhone ? spacing.xs / 2 : spacing.xs,
      borderRadius: borderRadius.sm,
    },
    messagesContainer: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    messagesContent: {
      padding: isPhone ? spacing.sm : spacing.md,
      paddingBottom: isPhone ? spacing.md : spacing.lg,
    },
    welcomeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isPhone ? spacing.xl : spacing.xxl * 2,
    },
    welcomeIcon: {
      marginBottom: spacing.md,
      opacity: 0.3,
    },
    welcomeText: {
      ...typography.body1,
      color: colors.textSecondary,
      fontSize: isPhone ? 13 : 14,
    },
    messageBubble: {
      flexDirection: 'row',
      marginBottom: isPhone ? spacing.sm : spacing.md,
      maxWidth: isPhone ? '90%' : '85%',
    },
    userBubble: {
      alignSelf: 'flex-end',
      flexDirection: 'row-reverse',
    },
    botBubble: {
      alignSelf: 'flex-start',
    },
    botAvatarSmall: {
      width: isPhone ? 24 : 28,
      height: isPhone ? 24 : 28,
      borderRadius: isPhone ? 12 : 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.xs,
    },
    userAvatarSmall: {
      width: isPhone ? 24 : 28,
      height: isPhone ? 24 : 28,
      borderRadius: isPhone ? 12 : 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.xs,
    },
    messageContent: {
      flex: 1,
    },
    userMessageContent: {
      alignItems: 'flex-end',
    },
    botMessageContent: {
      alignItems: 'flex-start',
    },
    messageText: {
      ...typography.body2,
      lineHeight: isPhone ? 18 : 20,
      fontSize: isPhone ? 13 : 14,
    },
    userText: {
      backgroundColor: colors.primary,
      color: '#FFF',
      padding: isPhone ? spacing.sm : spacing.md,
      borderRadius: isPhone ? borderRadius.md : borderRadius.lg,
      borderBottomRightRadius: borderRadius.xs,
    },
    botText: {
      backgroundColor: '#FFF',
      color: colors.text,
      padding: isPhone ? spacing.sm : spacing.md,
      borderRadius: isPhone ? borderRadius.md : borderRadius.lg,
      borderBottomLeftRadius: borderRadius.xs,
      ...shadows.sm,
    },
    messageTime: {
      ...typography.caption,
      fontSize: isPhone ? 9 : 10,
      marginTop: spacing.xs / 2,
      color: colors.textLight,
    },
    userTime: {
      textAlign: 'right',
    },
    botTime: {
      textAlign: 'left',
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      padding: isPhone ? spacing.sm : spacing.md,
      borderRadius: isPhone ? borderRadius.md : borderRadius.lg,
      borderBottomLeftRadius: borderRadius.xs,
      gap: spacing.xs / 2,
      ...shadows.sm,
    },
    typingDot: {
      width: isPhone ? 6 : 8,
      height: isPhone ? 6 : 8,
      borderRadius: isPhone ? 3 : 4,
      backgroundColor: colors.textLight,
    },
    dot1: {
      opacity: 0.4,
    },
    dot2: {
      opacity: 0.6,
    },
    dot3: {
      opacity: 0.8,
    },
    quickActions: {
      backgroundColor: '#FFF',
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
    },
    quickActionsContent: {
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      gap: spacing.xs,
    },
    quickActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs / 2,
      backgroundColor: colors.primary + '15',
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    quickActionText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      fontSize: isPhone ? 11 : 12,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: isPhone ? spacing.sm : spacing.md,
      backgroundColor: '#FFF',
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      gap: isPhone ? spacing.xs : spacing.sm,
    },
    inputWrapper: {
      flex: 1,
      position: 'relative',
    },
    input: {
      flex: 1,
      backgroundColor: '#F5F5F5',
      borderRadius: borderRadius.full,
      paddingHorizontal: isPhone ? spacing.sm : spacing.md,
      paddingVertical: isPhone ? spacing.xs : spacing.sm,
      maxHeight: isPhone ? 80 : 100,
      ...typography.body2,
      color: colors.text,
      fontSize: isPhone ? 13 : 14,
    },
    charCount: {
      position: 'absolute',
      bottom: spacing.xs,
      right: spacing.sm,
      ...typography.caption,
      color: colors.textLight,
      fontSize: isPhone ? 9 : 10,
    },
    sendButton: {
      width: isPhone ? 38 : (isMobile ? 40 : 44),
      height: isPhone ? 38 : (isMobile ? 40 : 44),
      borderRadius: isPhone ? 19 : (isMobile ? 20 : 22),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
    sendButtonDisabled: {
      backgroundColor: colors.textLight,
      opacity: 0.5,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.error + '15',
      padding: isPhone ? spacing.xs : spacing.sm,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
      fontSize: isPhone ? 11 : 12,
    },
  });
};

export default ChatbotWidget;
