# Assign Applicants to Job Feature

## Overview
This feature allows administrators to assign up to 500 job seekers/applicants to specific job posts through the admin panel.

## Implementation Details

### Frontend (Admin Panel)

**File**: `admin/src/screens/Admin/AdminJobsScreen.js`

#### New State Variables
- `assignApplicantsModalVisible` - Controls modal visibility
- `assigningToJob` - Stores the job being assigned to
- `availableApplicants` - List of job seekers (max 500)
- `selectedApplicants` - Array of selected applicant IDs
- `applicantSearchQuery` - Search filter for applicants
- `loadingApplicants` - Loading state

#### Key Functions
1. **handleAssignApplicants(job)** - Opens modal and loads applicants
2. **loadAvailableApplicants()** - Fetches up to 500 job seekers
3. **toggleSelectApplicant(applicantId)** - Individual selection with 500 limit
4. **toggleSelectAllApplicants()** - Select/deselect all (max 500)
5. **getFilteredApplicants()** - Filters by name, email, or phone
6. **handleSubmitAssignment()** - Submits assignments to backend

#### UI Components
- **Assign Applicants Button** - Purple person-add icon in job actions
- **Assign Applicants Modal** with:
  - Job title display
  - Search bar for filtering
  - Selection counter (X / 500)
  - Select All/Deselect All button
  - Scrollable applicants list with checkboxes
  - Applicant details: name, email, phone
  - Selected items highlighted
  - Cancel and Assign buttons

#### Styles Added
- `assignModalBody` - Modal body container
- `assignSearchSection` - Search and selection info section
- `selectionInfo` - Selection counter container
- `selectionInfoText` - Counter text style
- `selectAllButton` - Select all button style
- `selectAllButtonText` - Button text style
- `applicantsList` - Scrollable list container
- `applicantItem` - Individual applicant row
- `applicantItemSelected` - Selected state style
- `applicantCheckbox` - Checkbox container
- `applicantInfo` - Applicant details container
- `applicantName` - Name text style
- `applicantEmail` - Email text style
- `applicantPhone` - Phone text style
- `assignModalFooter` - Footer container
- `assignButton` - Assign button style
- `assignButtonDisabled` - Disabled state
- `assignButtonText` - Button text style
- `checkboxColumn` - Checkbox column in job table
- `bulkActionButtonActive` - Active state for bulk select button
- `modalSubtitle` - Subtitle in modal header

### API Layer

**File**: `admin/src/config/api.js`

#### New Method
```javascript
async assignApplicantsToJob(jobId, applicantIds) {
  return await this.request(`/jobs/${jobId}/assign-applicants`, {
    method: 'POST',
    body: JSON.stringify({ applicantIds }),
  });
}
```

### Backend

**File**: `server/routes/admin.js`

#### New Endpoint
```
POST /api/admin/jobs/:jobId/assign-applicants
```

**Features**:
- Validates input (max 500 applicants)
- Checks if job exists
- Prevents duplicate applications
- Fetches user data for each applicant
- Creates applications with user profile data
- Returns count of assigned and skipped applicants

**Request Body**:
```json
{
  "applicantIds": ["userId1", "userId2", ...]
}
```

**Response**:
```json
{
  "message": "Successfully assigned X applicants to the job",
  "assigned": 10,
  "skipped": 2,
  "applications": [...]
}
```

### Database Model Updates

**File**: `server/models/Application.js`

#### New Fields
- `assignedByAdmin` (Boolean) - Tracks admin assignments
- `assignedAt` (Date) - Timestamp of assignment
- `status` enum - Added 'assigned' status

## Usage

1. Navigate to Admin Panel → Jobs Management
2. Find the job you want to assign applicants to
3. Click the purple "Assign Applicants" button (person-add icon)
4. Search and select up to 500 applicants
5. Click "Assign X Applicants" button
6. Success message shows assigned count and any skipped (already applied)

## Features

- **Bulk Selection**: Assign up to 500 applicants at once
- **Search & Filter**: Find applicants by name, email, or phone
- **Duplicate Prevention**: Automatically skips applicants who already applied
- **Visual Feedback**: Selected items highlighted, counter shows progress
- **Smart Defaults**: Uses user profile data to populate application fields
- **Error Handling**: Clear error messages for validation failures

## Status
✅ Fully implemented and functional
