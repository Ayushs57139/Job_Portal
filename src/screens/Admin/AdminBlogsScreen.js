import React from 'react';
import MasterDataScreen from '../../components/Admin/MasterDataScreen';

const AdminBlogsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Blogs"
      subtitle="Manage blog posts"
      apiEndpoint="/blogs"
      fetchEndpoint="/blogs/admin/all"
      screenName="AdminBlogs"
      fieldName="title"
      additionalFields={[
        { key: 'excerpt', label: 'Excerpt', type: 'text', multiline: true, numberOfLines: 2, placeholder: 'Enter blog excerpt/summary', required: true },
        { key: 'content', label: 'Content', type: 'text', multiline: true, numberOfLines: 4, placeholder: 'Enter blog content', required: true },
        { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Career Tips, Interview Tips', required: true },
        { key: 'author', label: 'Author', type: 'text', placeholder: 'Author name (optional)' },
        { key: 'readTime', label: 'Read Time', type: 'text', placeholder: 'e.g., 5 min read', defaultValue: '5 min read' },
        { key: 'published', label: 'Published', type: 'boolean', defaultValue: true }
      ]}
    />
  );
};

export default AdminBlogsScreen;

