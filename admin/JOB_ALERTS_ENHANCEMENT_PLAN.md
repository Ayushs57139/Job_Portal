# Job Alerts Management Enhancement Plan

## Current State
The AdminJobAlertsScreen currently has basic functionality:
- View job alerts list
- Toggle alert status (active/inactive)
- Delete individual alerts
- Export alerts to CSV
- Bulk import candidates from CSV
- Search and filter by status
- Pagination

## Required Enhancements

### 1. Create/Send Job Alerts from Admin Panel
- **Create New Alert Modal**: Form to create job alerts manually
- **Send to Specific Candidates**: Select from user list
- **Send to Multiple Candidates**: Up to 10,000 candidates at once
- **Bulk Send**: Send same alert to multiple candidates

### 2. Edit Existing Job Alerts
- **Edit Modal**: Update alert details
- **Edit Form**: All fields editable
- **Save Changes**: Update alert in database

### 3. Bulk Operations
- **Bulk Select Mode**: Toggle to enable checkbox selection
- **Select All/Deselect All**: Quick selection controls
- **Bulk Approve/Unapprove**: Change approval status for multiple alerts
- **Bulk Start/Stop**: Activate/deactivate multiple alerts
- **Bulk Trash**: Move multiple alerts to trash/delete

### 4. Enhanced UI/UX
- **Professional Design**: Modern, clean interface
- **Action Buttons**: Clear, intuitive controls
- **Confirmation Dialogs**: Prevent accidental actions
- **Loading States**: Visual feedback during operations
- **Success/Error Messages**: Clear user feedback

## Implementation Approach

### Phase 1: Add State Management
```javascript
- createModalVisible
- editModalVisible
- editingAlert
- sendAlertsModalVisible
- selectedCandidates
- bulkSelectMode
- selectedAlerts
- availableCandidates
```

### Phase 2: Create Alert Modal
- Form with all job alert fields
- Validation
- Submit to backend API
- Success/error handling

### Phase 3: Edit Alert Modal
- Load existing alert data
- Editable form
- Update API call
- Refresh list after update

### Phase 4: Send Alerts to Candidates Modal
- Load candidates list (up to 10,000)
- Search/filter candidates
- Multi-select with limit
- Send alert to selected candidates
- Progress indicator

### Phase 5: Bulk Operations
- Checkbox column in alert list
- Bulk action bar when items selected
- Bulk approve/unapprove functionality
- Bulk start/stop functionality
- Bulk trash functionality
- Confirmation dialogs

### Phase 6: Backend API Endpoints
```
POST /api/admin/job-alerts - Create new alert
PUT /api/admin/job-alerts/:id - Update alert
POST /api/admin/job-alerts/send-to-candidates - Send to multiple candidates
PATCH /api/admin/job-alerts/bulk-approve - Bulk approve
PATCH /api/admin/job-alerts/bulk-activate - Bulk start/stop
DELETE /api/admin/job-alerts/bulk-delete - Bulk trash
```

## File Structure
Due to the large size, the implementation will be done in targeted updates:
1. Add new state variables and handlers
2. Add Create Alert Modal
3. Add Edit Alert Modal
4. Add Send to Candidates Modal
5. Add Bulk Operations UI
6. Add Backend API methods
7. Create Backend Routes

## Status
📋 Planning Complete - Ready for Implementation
