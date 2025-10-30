import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message when chat opens for the first time
      addBotMessage("Hello! Welcome to Free Job Wala! 👋 How can I assist you today?");
    }
  }, [isOpen]);

  const loadSession = async () => {
    try {
      const savedSessionId = await AsyncStorage.getItem('chatbotSessionId');
      const savedMessages = await AsyncStorage.getItem('chatbotMessages');
      
      if (savedSessionId) {
        setSessionId(savedSessionId);
      }
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
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
          platform: Platform.OS,
          userAgent: Platform.OS === 'web' ? navigator.userAgent : `React Native ${Platform.Version}`
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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');

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
        // Simulate typing delay
        setTimeout(() => {
          addBotMessage(data.botResponse);
          setIsTyping(false);
        }, 1000);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      addBotMessage("I'm sorry, I'm having trouble connecting. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    setMessages([]);
    setSessionId(null);
    await AsyncStorage.removeItem('chatbotSessionId');
    await AsyncStorage.removeItem('chatbotMessages');
    addBotMessage("Chat cleared! How can I help you today?");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={28} color="#FFF" />
          <View style={styles.pulseDot} />
        </TouchableOpacity>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => {
                if (e) {
                  e.stopPropagation();
                }
              }}
            >
              <View style={styles.chatContainer}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.botAvatar}>
                  <Ionicons name="chatbubbles" size={20} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.chatTitle}>Free Job Wala Bot</Text>
                  <View style={styles.statusIndicator}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>Online</Text>
                  </View>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleClearChat}
                >
                  <Ionicons name="refresh" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setIsOpen(false)}
                >
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.botBubble
                  ]}
                >
                  {msg.sender === 'bot' && (
                    <View style={styles.botAvatarSmall}>
                      <Ionicons name="chatbubbles" size={12} color="#FFF" />
                    </View>
                  )}
                  <View style={styles.messageContent}>
                    <Text style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userText : styles.botText
                    ]}>
                      {msg.message}
                    </Text>
                    <Text style={styles.messageTime}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}

              {isTyping && (
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <View style={styles.botAvatarSmall}>
                    <Ionicons name="chatbubbles" size={12} color="#FFF" />
                  </View>
                  <View style={styles.messageContent}>
                    <View style={styles.typingIndicator}>
                      <View style={[styles.typingDot, styles.dot1]} />
                      <View style={[styles.typingDot, styles.dot2]} />
                      <View style={[styles.typingDot, styles.dot3]} />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Find Jobs', 'How to Apply', 'Resume Tips', 'Contact Support'].map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickActionButton}
                    onPress={() => {
                      setInputText(action);
                      handleSendMessage();
                    }}
                  >
                    <Text style={styles.quickActionText}>{action}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  pulseDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#27AE60',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 90,
  },
  chatContainer: {
    height: Platform.OS === 'web' ? 550 : 500,
    width: Platform.OS === 'web' ? 380 : 340,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 15,
    paddingTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#357ABD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27AE60',
  },
  statusText: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  botAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    backgroundColor: '#4A90E2',
    color: '#FFF',
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  botText: {
    backgroundColor: '#FFF',
    color: '#333',
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  quickActions: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  quickActionButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickActionText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default ChatbotWidget;

