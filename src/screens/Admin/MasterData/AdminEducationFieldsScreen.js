import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminEducationFieldsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Education Fields"
      subtitle="Manage education fields master data"
      apiEndpoint="/admin/master-data/education-fields"
      screenName="AdminEducationFields"
      fieldName="name"
    />
  );
};

export default AdminEducationFieldsScreen;

