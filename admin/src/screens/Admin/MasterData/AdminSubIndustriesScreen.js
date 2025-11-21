import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminSubIndustriesScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Sub-Industries"
      subtitle="Manage sub-industries master data"
      apiEndpoint="/admin/master-data/sub-industries"
      screenName="AdminSubIndustries"
      fieldName="name"
      parentField={{
        key: 'parentId',
        label: 'Parent Industry',
        fetchEndpoint: '/admin/master-data/industries',
        required: true
      }}
    />
  );
};

export default AdminSubIndustriesScreen;

