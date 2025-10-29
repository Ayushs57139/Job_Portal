import React from 'react';
import MasterDataScreen from '../../components/Admin/MasterDataScreen';

const AdminSocialUpdatesScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Social Updates"
      subtitle="Manage social media updates"
      apiEndpoint="/api/admin/social-updates"
      screenName="AdminSocialUpdates"
      fieldName="title"
      additionalFields={[
        { key: 'content', label: 'Content', type: 'text', multiline: true, numberOfLines: 3 },
        { key: 'platform', label: 'Platform', type: 'text', placeholder: 'e.g., Facebook, Twitter' }
      ]}
    />
  );
};

export default AdminSocialUpdatesScreen;

