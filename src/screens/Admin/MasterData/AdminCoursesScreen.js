import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminCoursesScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Courses"
      subtitle="Manage courses master data"
      apiEndpoint="/api/admin/courses"
      screenName="AdminCourses"
      fieldName="name"
    />
  );
};

export default AdminCoursesScreen;

