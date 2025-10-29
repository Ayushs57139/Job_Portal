import React from 'react';
import MasterDataScreen from '../../components/Admin/MasterDataScreen';

const AdminSalesEnquiryScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Sales Enquiries"
      subtitle="Manage sales enquiries and leads"
      apiEndpoint="/api/admin/sales-enquiries"
      screenName="AdminSalesEnquiry"
      fieldName="name"
      additionalFields={[
        { key: 'email', label: 'Email', type: 'text', placeholder: 'Enter email', displayInList: true },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: 'Enter phone', displayInList: true },
        { key: 'message', label: 'Message', type: 'text', multiline: true, numberOfLines: 3 }
      ]}
    />
  );
};

export default AdminSalesEnquiryScreen;

