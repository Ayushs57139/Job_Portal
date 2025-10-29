import React from 'react';
import MasterDataScreen from '../../../components/Admin/MasterDataScreen';

const AdminLocationsScreen = ({ navigation }) => {
  return (
    <MasterDataScreen
      navigation={navigation}
      title="Locations"
      subtitle="Manage locations master data"
      apiEndpoint="/api/admin/locations"
      screenName="AdminLocations"
      fieldName="name"
    />
  );
};

export default AdminLocationsScreen;

