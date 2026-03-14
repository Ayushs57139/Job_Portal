import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Share as RNShare,
  Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SHARE_PLATFORMS = [
  { key: 'whatsapp', icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
  { key: 'telegram', icon: 'paper-plane', label: 'Telegram', color: '#0088CC' },
  { key: 'instagram', icon: 'logo-instagram', label: 'Instagram', color: '#E4405F' },
  { key: 'linkedin', icon: 'logo-linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { key: 'facebook', icon: 'logo-facebook', label: 'Facebook', color: '#1877F2' },
  { key: 'twitter', icon: 'logo-twitter', label: 'Twitter', color: '#1DA1F2' },
  { key: 'arattai', icon: 'chatbubbles', label: 'Arattai', color: '#FF6B6B' },
  { key: 'gmail', icon: 'mail', label: 'Gmail', color: '#EA4335' },
  { key: 'zoho', icon: 'mail-outline', label: 'Zoho Mail', color: '#C8202F' },
  { key: 'outlook', icon: 'mail', label: 'Outlook', color: '#0078D4' },
  { key: 'copy_link', icon: 'link', label: 'Copy Link', color: '#6366F1' },
  { key: 'save_file', icon: 'download', label: 'Save', color: '#10B981' },
  { key: 'other', icon: 'share-social', label: 'More', color: '#8B5CF6' },
];

const ShareModal = ({ visible, onClose, post, onShare }) => {
  const handleShare = async (platform) => {
    try {
      if (platform === 'copy_link') {
        // Copy link to clipboard
        const link = `https://freejobwala.com/social-updates/${post._id}`;
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(link);
        } else {
          Clipboard.setString(link);
        }
        Alert.alert('Success', 'Link copied to clipboard!');
        onClose();
        return;
      }

      if (platform === 'other') {
        // Use native share
        try {
          await RNShare.share({
            message: `${post.title}\n\n${post.content}\n\nhttps://freejobwala.com/social-updates/${post._id}`,
            title: post.title,
          });
        } catch (error) {
          console.log('Share error:', error);
        }
        onClose();
        return;
      }

      // Call API to track share
      if (onShare) {
        await onShare(platform);
      }

      // Open platform-specific share
      const shareUrls = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${post.title}\n\nhttps://freejobwala.com/social-updates/${post._id}`)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(`https://freejobwala.com/social-updates/${post._id}`)}&text=${encodeURIComponent(post.title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://freejobwala.com/social-updates/${post._id}`)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://freejobwala.com/social-updates/${post._id}`)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://freejobwala.com/social-updates/${post._id}`)}`,
        gmail: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`${post.content}\n\nhttps://freejobwala.com/social-updates/${post._id}`)}`,
      };

      if (shareUrls[platform]) {
        if (typeof window !== 'undefined') {
          window.open(shareUrls[platform], '_blank');
        }
      }

      Alert.alert('Success', `Shared to ${SHARE_PLATFORMS.find(p => p.key === platform)?.label}!`);
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share post');
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
            <Text style={styles.title}>Share Post</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.platformsGrid}>
              {SHARE_PLATFORMS.map((platform) => (
                <TouchableOpacity
                  key={platform.key}
                  style={styles.platformButton}
                  onPress={() => handleShare(platform.key)}
                >
                  <View style={[styles.platformIcon, { backgroundColor: `${platform.color}15` }]}>
                    <Ionicons name={platform.icon} size={28} color={platform.color} />
                  </View>
                  <Text style={styles.platformLabel}>{platform.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  platformButton: {
    alignItems: 'center',
    width: '22%',
    minWidth: 70,
  },
  platformIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  platformLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ShareModal;
