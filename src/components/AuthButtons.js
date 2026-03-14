import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthModal from './AuthModal';

const AuthButtons = ({ onLoginSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('jobseeker');

  const handleOpenModal = (userType) => {
    setSelectedUserType(userType);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    onLoginSuccess?.();
  };

  return (
    <View style={styles.container}>
      {/* Job Seeker Button */}
      <TouchableOpacity
        style={[styles.authButton, styles.jobseekerButton]}
        onPress={() => handleOpenModal('jobseeker')}
      >
        <Ionicons name="person-outline" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Job Seeker</Text>
      </TouchableOpacity>

      {/* Employer Button */}
      <TouchableOpacity
        style={[styles.authButton, styles.employerButton]}
        onPress={() => handleOpenModal('employer')}
      >
        <Ionicons name="business-outline" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Employer</Text>
      </TouchableOpacity>

      {/* Consultancy Button */}
      <TouchableOpacity
        style={[styles.authButton, styles.consultancyButton]}
        onPress={() => handleOpenModal('consultancy')}
      >
        <Ionicons name="briefcase-outline" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Consultancy</Text>
      </TouchableOpacity>

      {/* Auth Modal */}
      <AuthModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        userType={selectedUserType}
        onSuccess={handleSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobseekerButton: {
    backgroundColor: '#10B981',
  },
  employerButton: {
    backgroundColor: '#6366F1',
  },
  consultancyButton: {
    backgroundColor: '#EC4899',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthButtons;
