import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminDepartmentsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Departments"
      subtitle="Manage departments master data"
      apiEndpoint="/admin/master-data/departments"
      screenName="AdminDepartments"
      fieldName="name"
    />
  );
};

export default AdminDepartmentsScreen;

