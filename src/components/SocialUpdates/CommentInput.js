import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

const CommentInput = ({ 
  postId, 
  postType = 'general',
  onSubmit, 
  placeholder = 'Write a comment...',
  autoFocus = false 
}) => {
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [postType]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.getCommentSuggestionsForUser(postType, 10);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setComment(suggestion.suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!comment.trim() || submitting) return;

    try {
      setSubmitting(true);
      
      // Check if comment matches a suggestion
      const matchedSuggestion = suggestions.find(s => s.suggestion === comment.trim());
      
      if (onSubmit) {
        await onSubmit(comment.trim(), !!matchedSuggestion, matchedSuggestion?._id);
      }
      
      // Record suggestion usage if matched
      if (matchedSuggestion) {
        try {
          await api.recordSuggestionUsage(matchedSuggestion._id);
        } catch (err) {
          console.log('Failed to record suggestion usage:', err);
        }
      }
      
      setComment('');
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Quick Replies</Text>
            <TouchableOpacity onPress={() => setShowSuggestions(false)}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Ionicons name="chatbox-outline" size={16} color="#6366F1" />
                <Text style={styles.suggestionText}>{item.suggestion}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.suggestionsButton}
          onPress={() => setShowSuggestions(!showSuggestions)}
        >
          <Ionicons 
            name={showSuggestions ? "bulb" : "bulb-outline"} 
            size={20} 
            color={showSuggestions ? "#6366F1" : "#9CA3AF"} 
          />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={500}
          autoFocus={autoFocus}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!comment.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  suggestionsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  suggestionsButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});

export default CommentInput;
