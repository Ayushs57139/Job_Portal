import React from 'react';
import MasterDataScreen from '../../components/Admin/MasterDataScreen';

const AdminBlogsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Blogs"
      subtitle="Manage blog posts"
      apiEndpoint="/api/admin/blogs"
      screenName="AdminBlogs"
      fieldName="title"
      additionalFields={[
        { key: 'content', label: 'Content', type: 'text', multiline: true, numberOfLines: 4, placeholder: 'Enter blog content' },
        { key: 'author', label: 'Author', type: 'text', placeholder: 'Enter author name' }
      ]}
    />
  );
};

export default AdminBlogsScreen;

