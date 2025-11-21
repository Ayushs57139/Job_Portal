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
      showSubItems={true}
      additionalFields={[
        {
          key: 'description',
          label: 'Description',
          type: 'text',
          placeholder: 'Enter description',
          multiline: true,
          numberOfLines: 3,
          displayInList: false,
        },
        {
          key: 'subcategories',
          label: 'Sub-Departments',
          type: 'text',
          placeholder: 'Enter sub-departments (comma-separated)',
          multiline: true,
          numberOfLines: 4,
          displayInList: false,
        }
      ]}
    />
  );
};

export default AdminDepartmentsScreen;

