import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminCoursesScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Courses"
      subtitle="Manage courses master data"
      apiEndpoint="/admin/master-data/courses"
      screenName="AdminCourses"
      fieldName="name"
    />
  );
};

export default AdminCoursesScreen;

