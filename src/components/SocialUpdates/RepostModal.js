import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RepostModal = ({ visible, onClose, post, onRepost }) => {
  const [repostType, setRepostType] = useState('simple');
  const [thoughts, setThoughts] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRepost = async () => {
    if (repostType === 'with_thoughts' && !thoughts.trim()) {
      Alert.alert('Required', 'Please add your thoughts');
      return;
    }

    try {
      setSubmitting(true);
      if (onRepost) {
        await onRepost(repostType, thoughts.trim());
      }
      Alert.alert('Success', 'Post reposted successfully!');
      setThoughts('');
      setRepostType('simple');
      onClose();
    } catch (error) {
      console.error('Error reposting:', error);
      Alert.alert('Error', 'Failed to repost');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Repost</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Repost Type Selection */}
            <View style={styles.typeSelection}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  repostType === 'simple' && styles.typeButtonActive
                ]}
                onPress={() => setRepostType('simple')}
              >
                <Ionicons 
                  name="repeat" 
                  size={24} 
                  color={repostType === 'simple' ? '#6366F1' : '#9CA3AF'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  repostType === 'simple' && styles.typeButtonTextActive
                ]}>
                  Repost
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  repostType === 'with_thoughts' && styles.typeButtonActive
                ]}
                onPress={() => setRepostType('with_thoughts')}
              >
                <Ionicons 
                  name="create" 
                  size={24} 
                  color={repostType === 'with_thoughts' ? '#6366F1' : '#9CA3AF'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  repostType === 'with_thoughts' && styles.typeButtonTextActive
                ]}>
                  Repost with Thoughts
                </Text>
              </TouchableOpacity>
            </View>

            {/* Thoughts Input */}
            {repostType === 'with_thoughts' && (
              <View style={styles.thoughtsContainer}>
                <Text style={styles.thoughtsLabel}>Add your thoughts</Text>
                <TextInput
                  style={styles.thoughtsInput}
                  placeholder="What do you think about this?"
                  placeholderTextColor="#9CA3AF"
                  value={thoughts}
                  onChangeText={setThoughts}
                  multiline
                  maxLength={500}
                  autoFocus
                />
                <Text style={styles.charCount}>{thoughts.length}/500</Text>
              </View>
            )}

            {/* Original Post Preview */}
            <View style={styles.originalPost}>
              <View style={styles.originalPostHeader}>
                <Ionicons name="document-text" size={16} color="#6B7280" />
                <Text style={styles.originalPostLabel}>Original Post</Text>
              </View>
              <Text style={styles.originalPostTitle} numberOfLines={2}>
                {post?.title}
              </Text>
              <Text style={styles.originalPostContent} numberOfLines={3}>
                {post?.content}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.repostButton, submitting && styles.repostButtonDisabled]}
                onPress={handleRepost}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="repeat" size={18} color="#FFFFFF" />
                    <Text style={styles.repostButtonText}>Repost</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  typeSelection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#6366F1',
  },
  thoughtsContainer: {
    marginBottom: 20,
  },
  thoughtsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  thoughtsInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  originalPost: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  originalPostLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  originalPostTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  originalPostContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  repostButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  repostButtonDisabled: {
    opacity: 0.6,
  },
  repostButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default RepostModal;
