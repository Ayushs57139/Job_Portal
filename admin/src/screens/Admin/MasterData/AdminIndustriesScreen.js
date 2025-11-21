import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminIndustriesScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Industries"
      subtitle="Manage industries master data"
      apiEndpoint="/admin/master-data/industries"
      screenName="AdminIndustries"
      fieldName="name"
      showSubItems={true}
      additionalFields={[
        {
          key: 'subcategories',
          label: 'Sub-Industries',
          type: 'text',
          placeholder: 'Enter sub-industries (comma-separated)',
          multiline: true,
          numberOfLines: 4,
          displayInList: false,
        }
      ]}
    />
  );
};

export default AdminIndustriesScreen;

