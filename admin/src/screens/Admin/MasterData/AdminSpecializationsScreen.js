import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminSpecializationsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Specializations"
      subtitle="Manage specializations master data"
      apiEndpoint="/admin/master-data/specializations"
      screenName="AdminSpecializations"
      fieldName="name"
      parentField={{
        key: 'course',
        label: 'Course',
        fetchEndpoint: '/admin/master-data/courses',
        required: false
      }}
    />
  );
};

export default AdminSpecializationsScreen;

