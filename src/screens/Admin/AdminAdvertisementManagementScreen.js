import React from 'react';
import MasterDataScreen from '../../components/Admin/MasterDataScreen';

const AdminAdvertisementManagementScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Advertisement Management"
      subtitle="Manage advertisements"
      apiEndpoint="/api/admin/advertisements"
      screenName="AdminAdvertisementManagement"
      fieldName="title"
      additionalFields={[
        { key: 'description', label: 'Description', type: 'text', multiline: true, numberOfLines: 2 },
        { key: 'url', label: 'URL', type: 'text', placeholder: 'Enter ad URL' }
      ]}
    />
  );
};

export default AdminAdvertisementManagementScreen;

