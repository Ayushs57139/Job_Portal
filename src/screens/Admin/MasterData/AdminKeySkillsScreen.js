import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminKeySkillsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Key Skills"
      subtitle="Manage key skills master data"
      apiEndpoint="/admin/master-data/key-skills"
      screenName="AdminKeySkills"
      fieldName="name"
    />
  );
};

export default AdminKeySkillsScreen;

