import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminSubDepartmentsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Sub-Departments"
      subtitle="Manage sub-departments master data"
      apiEndpoint="/admin/master-data/sub-departments"
      screenName="AdminSubDepartments"
      fieldName="name"
      parentField={{
        key: 'parentId',
        label: 'Parent Department',
        fetchEndpoint: '/admin/master-data/departments',
        required: true
      }}
    />
  );
};

export default AdminSubDepartmentsScreen;

