import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import AdminLayout from '../../components/Admin/AdminLayout';
import MultiStepJobPostForm from '../../components/MultiStepJobPostForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const AdminPostJobScreen = ({ navigation }) => {
  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  const handleSubmit = async (formData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post job');
      }

      Alert.alert('Success', 'Job posted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AdminJobs'),
        },
      ]);
    } catch (error) {
      console.error('Error posting job:', error);
      Alert.alert('Error', error.message || 'Failed to post job');
      throw error;
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Job Posting',
      'Are you sure you want to cancel? All entered data will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <AdminLayout title="Post Job" activeScreen="AdminPostJob" onNavigate={handleNavigate} onLogout={handleLogout}>
      <View style={styles.container}>
        <MultiStepJobPostForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
        />
      </View>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
});

export default AdminPostJobScreen;

