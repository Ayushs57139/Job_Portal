# Requirements Document

## Introduction

This document specifies the requirements for adding comprehensive SMTP email statistics and filtering capabilities to the admin panel's SMTP Settings screen. The feature will provide administrators with real-time visibility into email delivery performance, status tracking, and historical analysis through an intuitive dashboard interface.

The system will integrate with the existing SMTP configuration screen and leverage the current email logging infrastructure to display categorized statistics, time-based filtering, and detailed email logs with retry capabilities.

## Glossary

- **SMTP_Settings_Screen**: The admin panel screen located at admin/src/screens/Admin/AdminSMTPSettingsScreen.js that manages email server configuration
- **Email_Statistics_Dashboard**: The visual interface displaying email metrics categorized by status (all, sent, failed, draft, trash)
- **Email_Log**: A database record containing details about an email transmission including recipient, subject, status, timestamp, and error information
- **Time_Period_Filter**: A user-selectable date range option that determines which email logs are included in statistics calculations
- **Custom_Date_Range**: A user-defined start and end date pair for filtering email statistics
- **Email_Status**: The current state of an email transmission (sent, failed, draft, trash)
- **Statistics_API**: Backend endpoints that aggregate and return email metrics based on filter criteria
- **Retry_Operation**: The action of attempting to resend a previously failed email
- **Real_Time_Data**: Email statistics that reflect the current state of the email log database without caching delays

## Requirements

### Requirement 1: Email Statistics Dashboard Display

**User Story:** As an administrator, I want to view categorized email statistics on the SMTP Settings screen, so that I can monitor email delivery performance at a glance.

#### Acceptance Criteria

1. THE SMTP_Settings_Screen SHALL display five distinct statistic categories: All Emails, Sent Emails, Failed Emails, Draft Emails, and Trash Emails
2. WHEN the statistics dashboard loads, THE SMTP_Settings_Screen SHALL fetch and display the current count for each email category
3. THE SMTP_Settings_Screen SHALL display each statistic category as a clickable card with an icon, count value, and descriptive label
4. WHEN a user clicks on a statistic category card, THE SMTP_Settings_Screen SHALL filter the email logs list to show only emails matching that category
5. THE SMTP_Settings_Screen SHALL visually indicate which statistic category is currently active using distinct styling
6. THE SMTP_Settings_Screen SHALL use color-coded icons for each category (primary for all, success for sent, error for failed, warning for draft, secondary for trash)

### Requirement 2: Time Period Filtering

**User Story:** As an administrator, I want to filter email statistics by predefined time periods, so that I can analyze email performance over different timeframes.

#### Acceptance Criteria

1. THE SMTP_Settings_Screen SHALL provide ten predefined time period filter options: Last 24 Hours, Last 7 Days, Last 14 Days, Last 30 Days, Last 90 Days, Last 120 Days, Last 6 Months, Last 9 Months, Last 12 Months, and Custom Date
2. WHEN a user selects a time period filter, THE SMTP_Settings_Screen SHALL recalculate all statistics to include only emails within that time range
3. THE SMTP_Settings_Screen SHALL display time period filters as a horizontal row of clickable buttons
4. THE SMTP_Settings_Screen SHALL visually highlight the currently active time period filter
5. WHEN the statistics dashboard first loads, THE SMTP_Settings_Screen SHALL default to the "Last 24 Hours" time period
6. WHEN a user changes the time period filter, THE SMTP_Settings_Screen SHALL reset pagination to page 1

### Requirement 3: Custom Date Range Selection

**User Story:** As an administrator, I want to specify a custom date range for email statistics, so that I can analyze specific time periods not covered by predefined filters.

#### Acceptance Criteria

1. WHEN a user selects the "Custom Date" time period filter, THE SMTP_Settings_Screen SHALL display date picker controls for start date and end date
2. THE SMTP_Settings_Screen SHALL provide separate date picker buttons for selecting the start date and end date
3. WHEN a user clicks a date picker button, THE SMTP_Settings_Screen SHALL display a native date picker interface appropriate for the platform (iOS modal, Android dialog, web input)
4. THE SMTP_Settings_Screen SHALL display the currently selected start date and end date in DD-MMM-YYYY format (e.g., "15-Jan-2024")
5. WHEN a user selects a custom date range, THE SMTP_Settings_Screen SHALL recalculate statistics to include only emails between the start date and end date (inclusive)
6. THE SMTP_Settings_Screen SHALL prevent users from selecting an end date that is earlier than the start date
7. THE SMTP_Settings_Screen SHALL prevent users from selecting future dates in the date picker

### Requirement 4: Email Logs List Display

**User Story:** As an administrator, I want to view a detailed list of email logs matching my selected filters, so that I can investigate individual email transmissions.

#### Acceptance Criteria

1. THE SMTP_Settings_Screen SHALL display a paginated list of email logs matching the current status filter and time period filter
2. FOR ALL email logs in the list, THE SMTP_Settings_Screen SHALL display the email subject, recipient address, sender address, status badge, timestamp, and status icon
3. THE SMTP_Settings_Screen SHALL format email log timestamps in DD-MMM-YYYY HH:MM format using Indian locale (e.g., "15-Jan-2024 14:30")
4. WHEN an email log has a failed status, THE SMTP_Settings_Screen SHALL display the error message within the log card
5. THE SMTP_Settings_Screen SHALL display email logs in reverse chronological order (newest first)
6. WHEN no email logs match the current filters, THE SMTP_Settings_Screen SHALL display an empty state message with an icon and suggestion to adjust filters
7. THE SMTP_Settings_Screen SHALL truncate long email subjects and addresses to prevent layout overflow

### Requirement 5: Email Log Pagination

**User Story:** As an administrator, I want to navigate through multiple pages of email logs, so that I can review large volumes of email history without performance degradation.

#### Acceptance Criteria

1. THE SMTP_Settings_Screen SHALL display email logs in pages of 20 records per page
2. WHEN there are more than 20 email logs matching the filters, THE SMTP_Settings_Screen SHALL display pagination controls below the email logs list
3. THE SMTP_Settings_Screen SHALL display the current page number and total page count in the pagination controls
4. THE SMTP_Settings_Screen SHALL provide "previous page" and "next page" navigation buttons in the pagination controls
5. WHEN the user is on the first page, THE SMTP_Settings_Screen SHALL disable the "previous page" button
6. WHEN the user is on the last page, THE SMTP_Settings_Screen SHALL disable the "next page" button
7. WHEN a user navigates to a different page, THE SMTP_Settings_Screen SHALL fetch and display email logs for that page

### Requirement 6: Failed Email Retry Functionality

**User Story:** As an administrator, I want to retry sending failed emails, so that I can recover from temporary delivery issues without manual intervention.

#### Acceptance Criteria

1. WHEN an email log has a failed status, THE SMTP_Settings_Screen SHALL display a "Retry" button within the log card
2. WHEN a user clicks the "Retry" button, THE SMTP_Settings_Screen SHALL display a confirmation dialog asking the user to confirm the retry operation
3. WHEN a user confirms the retry operation, THE SMTP_Settings_Screen SHALL send a retry request to the Statistics_API
4. WHEN the retry request succeeds, THE SMTP_Settings_Screen SHALL display a success message and refresh the email logs list
5. WHEN the retry request fails, THE SMTP_Settings_Screen SHALL display an error message with the failure reason
6. THE SMTP_Settings_Screen SHALL not display a "Retry" button for email logs with sent, draft, or trash status

### Requirement 7: Real-Time Statistics Updates

**User Story:** As an administrator, I want email statistics to reflect the current state of the system, so that I can make decisions based on accurate data.

#### Acceptance Criteria

1. WHEN the statistics dashboard loads, THE SMTP_Settings_Screen SHALL fetch the latest email statistics from the Statistics_API without using cached data
2. WHEN a user switches between the settings tab and statistics tab, THE SMTP_Settings_Screen SHALL refresh the statistics data
3. WHEN a user changes the status filter or time period filter, THE SMTP_Settings_Screen SHALL immediately fetch updated statistics matching the new filters
4. WHEN a user performs a pull-to-refresh gesture, THE SMTP_Settings_Screen SHALL reload all statistics and email logs from the Statistics_API
5. THE SMTP_Settings_Screen SHALL display a loading indicator while fetching statistics data
6. WHEN statistics data fails to load, THE SMTP_Settings_Screen SHALL display an error alert with the failure reason

### Requirement 8: Tab Navigation Between Settings and Statistics

**User Story:** As an administrator, I want to switch between SMTP configuration and email statistics views, so that I can manage both settings and monitoring from a single screen.

#### Acceptance Criteria

1. THE SMTP_Settings_Screen SHALL display two tab buttons: "SMTP Settings" and "Email Statistics"
2. WHEN a user clicks the "SMTP Settings" tab, THE SMTP_Settings_Screen SHALL display the SMTP configuration form
3. WHEN a user clicks the "Email Statistics" tab, THE SMTP_Settings_Screen SHALL display the Email_Statistics_Dashboard
4. THE SMTP_Settings_Screen SHALL visually highlight the currently active tab with distinct styling
5. WHEN the SMTP_Settings_Screen first loads, THE SMTP_Settings_Screen SHALL default to displaying the "SMTP Settings" tab
6. THE SMTP_Settings_Screen SHALL preserve the user's selected filters when switching between tabs

### Requirement 9: Statistics API Integration

**User Story:** As a system, I want to retrieve email statistics from backend API endpoints, so that the dashboard displays accurate aggregated data.

#### Acceptance Criteria

1. THE Statistics_API SHALL provide an endpoint that returns email logs with pagination, status filtering, and date range filtering
2. THE Statistics_API SHALL provide an endpoint that returns aggregated email counts by status (total, sent, failed, draft, trash) for a specified date range
3. THE Statistics_API SHALL provide an endpoint that accepts an email log ID and queues that email for retry
4. WHEN the SMTP_Settings_Screen requests email logs, THE Statistics_API SHALL return logs sorted by creation date in descending order
5. WHEN the SMTP_Settings_Screen requests email statistics, THE Statistics_API SHALL calculate counts based on the provided start date and end date parameters
6. THE Statistics_API SHALL return pagination metadata including current page, total pages, and total record count

### Requirement 10: Responsive Layout Design

**User Story:** As an administrator, I want the email statistics dashboard to adapt to different screen sizes, so that I can monitor email performance on mobile, tablet, and desktop devices.

#### Acceptance Criteria

1. WHEN the SMTP_Settings_Screen is displayed on a mobile device, THE Email_Statistics_Dashboard SHALL arrange statistic category cards in a vertical stack
2. WHEN the SMTP_Settings_Screen is displayed on a tablet or desktop device, THE Email_Statistics_Dashboard SHALL arrange statistic category cards in a horizontal row
3. THE SMTP_Settings_Screen SHALL ensure all text remains readable and buttons remain tappable across all screen sizes
4. THE SMTP_Settings_Screen SHALL use responsive spacing and sizing that adapts to the device's screen width
5. WHEN the SMTP_Settings_Screen is displayed on a web browser, THE Email_Statistics_Dashboard SHALL use appropriate web-specific styling (box shadows instead of elevation)

### Requirement 11: Loading and Error States

**User Story:** As an administrator, I want clear feedback when statistics are loading or when errors occur, so that I understand the system's current state.

#### Acceptance Criteria

1. WHEN the SMTP_Settings_Screen is fetching statistics data, THE SMTP_Settings_Screen SHALL display a loading spinner with descriptive text
2. WHEN the SMTP_Settings_Screen is refreshing statistics data, THE SMTP_Settings_Screen SHALL display a refresh indicator in the statistics section header
3. WHEN statistics data fails to load, THE SMTP_Settings_Screen SHALL display an alert dialog with the error message
4. WHEN email logs fail to load, THE SMTP_Settings_Screen SHALL display an alert dialog with the error message
5. WHEN a retry operation fails, THE SMTP_Settings_Screen SHALL display an alert dialog with the error message
6. THE SMTP_Settings_Screen SHALL log all API errors to the console for debugging purposes

### Requirement 12: Visual Design Consistency

**User Story:** As an administrator, I want the email statistics dashboard to match the existing admin panel design, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. THE Email_Statistics_Dashboard SHALL use the same color scheme defined in the theme configuration (colors.primary, colors.success, colors.error, colors.warning)
2. THE Email_Statistics_Dashboard SHALL use the same spacing values defined in the theme configuration (spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl)
3. THE Email_Statistics_Dashboard SHALL use the same border radius values defined in the theme configuration (borderRadius.md, borderRadius.lg)
4. THE Email_Statistics_Dashboard SHALL use the same typography styles defined in the theme configuration
5. THE Email_Statistics_Dashboard SHALL use Ionicons for all icons to maintain consistency with the rest of the admin panel
6. THE Email_Statistics_Dashboard SHALL use the same card styling (white background, subtle shadow, rounded corners) as other admin screens
