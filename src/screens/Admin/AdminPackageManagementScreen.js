import React from 'react';
import MasterDataScreen from '../../components/Admin/MasterDataScreen';

const AdminPackageManagementScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Package Management"
      subtitle="Manage subscription packages"
      apiEndpoint="/api/admin/packages"
      screenName="AdminPackageManagement"
      fieldName="name"
      additionalFields={[
        { key: 'price', label: 'Price', type: 'text', placeholder: 'Enter price', displayInList: true },
        { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 30 days', displayInList: true },
        { key: 'description', label: 'Description', type: 'text', multiline: true, numberOfLines: 3 }
      ]}
    />
  );
};

export default AdminPackageManagementScreen;

