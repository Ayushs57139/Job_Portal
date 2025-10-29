import React from 'react';
import MasterDataScreen from '../../components/Admin/MasterDataScreen';

const AdminEmailTemplatesScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Email Templates"
      subtitle="Manage email templates"
      apiEndpoint="/api/admin/email-templates"
      screenName="AdminEmailTemplates"
      fieldName="name"
      additionalFields={[
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Enter email subject', displayInList: true },
        { key: 'content', label: 'Content', type: 'text', multiline: true, numberOfLines: 4 }
      ]}
    />
  );
};

export default AdminEmailTemplatesScreen;

