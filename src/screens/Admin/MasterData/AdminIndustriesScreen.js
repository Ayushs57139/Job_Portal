import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminIndustriesScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Industries"
      subtitle="Manage industries master data"
      apiEndpoint="/api/admin/industries"
      screenName="AdminIndustries"
      fieldName="name"
    />
  );
};

export default AdminIndustriesScreen;

