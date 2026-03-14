# Design Document: SMTP Email Statistics and Filtering

## Overview

This design document specifies the technical implementation for adding comprehensive email statistics and filtering capabilities to the existing SMTP Settings screen in the admin panel. The feature extends the current AdminSMTPSettingsScreen.js with a new "Email Statistics" tab that provides real-time visibility into email delivery performance through categorized statistics, flexible time-based filtering, and detailed email logs with retry functionality.

### Design Goals

1. **Seamless Integration**: Extend the existing SMTP Settings screen without disrupting current functionality
2. **Real-Time Visibility**: Provide administrators with up-to-date email delivery metrics
3. **Flexible Analysis**: Support multiple time period filters and custom date ranges for historical analysis
4. **Actionable Insights**: Enable administrators to investigate failures and retry failed emails
5. **Responsive Design**: Ensure optimal user experience across mobile, tablet, and desktop devices
6. **Visual Consistency**: Maintain design coherence with the existing admin panel

### Key Features

- Tab-based navigation between SMTP Settings and Email Statistics
- Five categorized statistics cards (All, Sent, Failed, Draft, Trash)
- Ten predefined time period filters plus custom date range selection
- Paginated email logs list (20 records per page)
- Failed email retry functionality with confirmation
- Real-time data updates with pull-to-refresh
- Platform-specific date picker implementations
- Responsive layout adapting to screen sizes

## Architecture

### High-Level Architecture

The feature follows a component-based architecture that integrates with the existing admin panel infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                  AdminSMTPSettingsScreen                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Tab Navigation Component                  │  │
│  │  [SMTP Settings Tab] [Email Statistics Tab]           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         SMTP Settings View (Existing)                  │  │
│  │  - Configuration Form                                  │  │
│  │  - Test Email Functionality                            │  │
│  │  - Save/Reset Actions                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Email Statistics View (New)                    │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │      Statistics Cards Component                  │  │  │
│  │  │  [All] [Sent] [Failed] [Draft] [Trash]          │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │      Time Period Filter Component                │  │  │
│  │  │  [Last 24h] [7d] [14d] ... [Custom]             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │      Custom Date Range Component                 │  │  │
│  │  │  [Start Date Picker] [End Date Picker]          │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │      Email Logs List Component                   │  │  │
│  │  │  - Log Cards with Details                        │  │  │
│  │  │  - Retry Button (for failed emails)             │  │  │
│  │  │  - Pagination Controls                           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Service Layer                         │
│  - getEmailLogs(filters)                                     │
│  - getEmailLogStats(startDate, endDate)                      │
│  - retryEmailLog(id)                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Endpoints                     │
│  GET  /admin/email-logs?page&limit&status&startDate&endDate │
│  GET  /admin/email-logs/stats?startDate&endDate             │
│  POST /admin/email-logs/:id/retry                           │
└─────────────────────────────────────────────────────────────┘
```

### State Management Architecture

The component uses React hooks for local state management:

```
State Structure:
├── Navigation State
│   └── activeTab: 'settings' | 'statistics'
├── Statistics State
│   ├── statistics: { total, sent, failed, draft, trash }
│   ├── emailLogs: Array<EmailLog>
│   ├── statsFilter: 'all' | 'sent' | 'failed' | 'draft' | 'trash'
│   ├── dateFilter: string (predefined filter key)
│   ├── customDateRange: { startDate: Date, endDate: Date }
│   ├── currentPage: number
│   └── totalPages: number
├── UI State
│   ├── loading: boolean
│   ├── refreshing: boolean
│   ├── statsLoading: boolean
│   ├── showDatePicker: boolean
│   └── datePickerMode: 'start' | 'end'
└── Settings State (Existing)
    └── settings: SMTPSettings object
```

### Data Flow

1. **Initial Load**: Component mounts → loadStatistics() → API calls → Update state → Render
2. **Filter Change**: User selects filter → Reset page to 1 → loadStatistics() → Update state → Render
3. **Pagination**: User clicks next/prev → Update currentPage → loadStatistics() → Update state → Render
4. **Retry Email**: User clicks retry → Confirmation dialog → API call → Reload statistics → Update state
5. **Tab Switch**: User switches tab → Update activeTab → Trigger loadStatistics() if needed → Render
6. **Pull to Refresh**: User pulls down → Set refreshing → loadStatistics() → Clear refreshing → Render

## Components and Interfaces

### Component Hierarchy

```
AdminSMTPSettingsScreen (Main Component)
├── AdminLayout (Wrapper)
├── Tab Navigation
│   ├── SMTP Settings Tab Button
│   └── Email Statistics Tab Button
├── SMTP Settings View (Existing)
│   └── [Existing configuration form]
└── Email Statistics View (New)
    ├── Statistics Cards Row
    │   ├── StatCard (All Emails)
    │   ├── StatCard (Sent Emails)
    │   ├── StatCard (Failed Emails)
    │   ├── StatCard (Draft Emails)
    │   └── StatCard (Trash Emails)
    ├── Time Period Filter Section
    │   ├── Filter Title
    │   └── Filter Buttons Row
    │       ├── FilterButton (Last 24 Hours)
    │       ├── FilterButton (Last 7 Days)
    │       ├── ... (8 more predefined filters)
    │       └── FilterButton (Custom Date)
    ├── Custom Date Range Section (Conditional)
    │   ├── Start Date Picker Button
    │   └── End Date Picker Button
    ├── Email Logs Section
    │   ├── Section Header
    │   │   ├── Title with Filter Indicator
    │   │   └── Refresh Button
    │   ├── Loading State (Conditional)
    │   ├── Empty State (Conditional)
    │   └── Logs List
    │       ├── EmailLogCard (Multiple)
    │       │   ├── Log Header
    │       │   │   ├── Status Icon
    │       │   │   ├── Subject & Date
    │       │   │   └── Status Badge
    │       │   ├── Log Body
    │       │   │   ├── To Address
    │       │   │   ├── From Address
    │       │   │   └── Error Message (Conditional)
    │       │   └── Log Actions (Conditional)
    │       │       └── Retry Button
    │       └── Pagination Controls
    │           ├── Previous Button
    │           ├── Page Indicator
    │           └── Next Button
    └── Date Picker Modal (Platform-specific)
        └── DateTimePicker Component
```

### Key Component Specifications

#### StatCard Component (Inline)

**Purpose**: Display a single email category statistic with icon, count, and label

**Props** (via inline rendering):
- `icon`: Ionicons name
- `color`: Status color from theme
- `count`: Number of emails in category
- `label`: Category display name
- `isActive`: Boolean indicating if this filter is active
- `onPress`: Handler for filter selection

**Behavior**:
- Displays icon, count, and label vertically centered
- Applies active styling when selected
- Triggers filter change on press
- Resets pagination to page 1

#### FilterButton Component (Inline)

**Purpose**: Display a time period filter option

**Props** (via inline rendering):
- `label`: Display text for the filter
- `value`: Filter identifier
- `isActive`: Boolean indicating if this filter is active
- `onPress`: Handler for filter selection

**Behavior**:
- Displays label with appropriate styling
- Applies active styling when selected
- Triggers date filter change on press
- Resets pagination to page 1

#### EmailLogCard Component (Inline)

**Purpose**: Display detailed information about a single email log entry

**Props** (via inline rendering):
- `log`: EmailLog object containing all email details
- `onRetry`: Handler for retry action

**Structure**:
```javascript
{
  _id: string,
  subject: string,
  to: string,
  from: string,
  status: 'sent' | 'failed' | 'draft' | 'trash',
  createdAt: Date,
  error?: string
}
```

**Behavior**:
- Displays status icon with appropriate color
- Shows subject (truncated if long)
- Displays formatted timestamp
- Shows status badge with color coding
- Displays to/from addresses (truncated if long)
- Shows error message if status is failed
- Displays retry button only for failed emails
- Triggers retry confirmation dialog on button press

#### DatePickerButton Component (Inline)

**Purpose**: Display and trigger date picker for custom date range

**Props** (via inline rendering):
- `label`: "Start Date" or "End Date"
- `date`: Currently selected date
- `onPress`: Handler to open date picker

**Behavior**:
- Displays calendar icon and formatted date
- Opens platform-specific date picker on press
- Updates customDateRange state on date selection
- Prevents selection of future dates
- Enforces end date >= start date

### API Interface Specifications

#### getEmailLogs(filters)

**Purpose**: Retrieve paginated email logs with filtering

**Request**:
```javascript
{
  page: number,           // Current page number (1-indexed)
  limit: number,          // Records per page (20)
  status?: string,        // Filter by status (optional)
  startDate: string,      // ISO date string
  endDate: string         // ISO date string
}
```

**Response**:
```javascript
{
  success: boolean,
  data: {
    logs: Array<{
      _id: string,
      subject: string,
      to: string,
      from: string,
      status: 'sent' | 'failed' | 'draft' | 'trash',
      createdAt: Date,
      error?: string
    }>,
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number
    }
  }
}
```

#### getEmailLogStats(startDate, endDate)

**Purpose**: Retrieve aggregated email statistics for a date range

**Request**:
```javascript
{
  startDate: string,  // ISO date string
  endDate: string     // ISO date string
}
```

**Response**:
```javascript
{
  success: boolean,
  data: {
    total: number,
    sent: number,
    failed: number,
    draft: number,
    trash: number
  }
}
```

#### retryEmailLog(id)

**Purpose**: Queue a failed email for retry

**Request**:
```javascript
{
  id: string  // Email log ID
}
```

**Response**:
```javascript
{
  success: boolean,
  message: string
}
```

### State Update Functions

#### loadStatistics()

**Purpose**: Fetch and update email statistics and logs based on current filters

**Algorithm**:
1. Set statsLoading to true
2. Calculate date range based on dateFilter:
   - For predefined filters: Calculate startDate from current date
   - For custom filter: Use customDateRange values
3. Build filters object with page, limit, status, startDate, endDate
4. Make parallel API calls to getEmailLogs() and getEmailLogStats()
5. Update emailLogs, totalPages, and statistics state
6. Set statsLoading to false
7. Handle errors with Alert dialog

**Dependencies**: statsFilter, dateFilter, customDateRange, currentPage

#### handleRetryEmail(logId)

**Purpose**: Confirm and execute email retry operation

**Algorithm**:
1. Display confirmation Alert dialog
2. If user confirms:
   - Call retryEmailLog(logId) API
   - If successful: Show success Alert and call loadStatistics()
   - If failed: Show error Alert with message
3. Handle errors with Alert dialog

**Side Effects**: Reloads statistics on success

## Data Models

### EmailLog Model

```javascript
{
  _id: string,              // Unique identifier
  subject: string,          // Email subject line
  to: string,               // Recipient email address
  from: string,             // Sender email address
  status: string,           // 'sent' | 'failed' | 'draft' | 'trash'
  createdAt: Date,          // Timestamp of email creation
  updatedAt: Date,          // Timestamp of last update
  error?: string,           // Error message (present if status is 'failed')
  retryCount?: number,      // Number of retry attempts
  lastRetryAt?: Date        // Timestamp of last retry attempt
}
```

### EmailStatistics Model

```javascript
{
  total: number,    // Total number of emails in date range
  sent: number,     // Number of successfully sent emails
  failed: number,   // Number of failed emails
  draft: number,    // Number of draft emails
  trash: number     // Number of trashed emails
}
```

### CustomDateRange Model

```javascript
{
  startDate: Date,  // Start of date range (inclusive)
  endDate: Date     // End of date range (inclusive)
}
```

### PaginationMetadata Model

```javascript
{
  currentPage: number,    // Current page number (1-indexed)
  totalPages: number,     // Total number of pages
  totalItems: number,     // Total number of items across all pages
  itemsPerPage: number    // Number of items per page (20)
}
```

