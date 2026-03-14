# SMTP Email Management System

## Overview

The SMTP Email Management System provides a comprehensive solution for configuring email settings and monitoring email activity in the admin panel. This system includes dynamic SMTP configuration, email statistics tracking, and detailed email log management.

## Features

### 1. SMTP Configuration

#### Email Provider Selection
- **SMTP** (Currently Active)
- SendGrid (Coming Soon)
- Mailgun (Coming Soon)
- AWS SES (Coming Soon)

#### SMTP Settings
- **Host**: SMTP server hostname (e.g., smtp.gmail.com)
- **Port**: SMTP server port (587 for TLS, 465 for SSL, 25 for non-secure)
- **SSL/TLS**: Toggle for secure connection
- **Username**: SMTP authentication username
- **Password**: SMTP authentication password (securely stored)

#### Email Configuration
- **From Email**: Sender email address
- **From Name**: Sender display name
- **Reply-To Email**: Email address for replies (optional)
- **Daily Email Limit**: Maximum emails per day (default: 1000)
- **Enable Email Notifications**: Toggle for automated email notifications

#### Test Email Functionality
- Send test emails to verify SMTP configuration
- Real-time validation of email settings
- Instant feedback on connection status

### 2. Email Statistics Dashboard

#### Statistics Overview Cards
The system provides real-time statistics with interactive filtering:

1. **All Emails**: Total count of all emails in the system
2. **Sent Emails**: Successfully delivered emails
3. **Failed Emails**: Emails that failed to send
4. **Draft Emails**: Emails saved as drafts
5. **Trash Emails**: Deleted emails

Each card is clickable to filter the email logs by that status.

#### Time Period Filters

The system supports comprehensive date filtering options:

**Predefined Periods:**
- Last 24 Hours
- Last 7 Days
- Last 14 Days
- Last 30 Days
- Last 90 Days
- Last 120 Days
- Last 6 Months
- Last 9 Months
- Last 12 Months

**Custom Date Range:**
- Start Date picker
- End Date picker
- Flexible date range selection

### 3. Email Logs Management

#### Email Log Display
Each email log entry shows:
- **Status Icon**: Visual indicator (checkmark for sent, X for failed, etc.)
- **Subject**: Email subject line
- **Timestamp**: Date and time of email creation
- **Status Badge**: Color-coded status indicator
- **To**: Recipient email address
- **From**: Sender email address
- **Error Message**: Detailed error information (for failed emails)

#### Email Log Actions
- **Retry Failed Emails**: Resend failed emails with one click
- **Pagination**: Navigate through email logs (20 per page)
- **Refresh**: Reload email logs to see latest data
- **Filter by Status**: View specific email types

#### Status Color Coding
- **Sent**: Green (Success)
- **Failed**: Red (Error)
- **Draft**: Orange (Warning)
- **Trash**: Gray (Secondary)

### 4. Dynamic Filtering System

The email logs can be filtered by:
1. **Status**: All, Sent, Failed, Draft, Trash
2. **Date Range**: Any of the predefined periods or custom range
3. **Pagination**: Navigate through large datasets

All filters work together to provide precise data views.

## API Endpoints

### SMTP Settings
- `GET /settings` - Retrieve current SMTP settings
- `PUT /settings/email` - Update SMTP settings
- `POST /settings/email/test` - Send test email

### Email Logs
- `GET /admin/email-logs` - Get email logs with filters
  - Query params: `page`, `limit`, `status`, `startDate`, `endDate`
- `GET /admin/email-logs/:id` - Get specific email log
- `GET /admin/email-logs/stats` - Get email statistics
  - Query params: `startDate`, `endDate`
- `POST /admin/email-logs/:id/retry` - Retry failed email
- `DELETE /admin/email-logs?olderThan=X` - Delete old email logs

## Usage Guide

### Setting Up SMTP

1. Navigate to **Admin Panel → SMTP Settings**
2. Click on the **SMTP Settings** tab
3. Configure your SMTP provider:
   - Enter SMTP host (e.g., smtp.gmail.com)
   - Set port (587 recommended for TLS)
   - Enable SSL/TLS for security
   - Enter username and password
4. Configure email settings:
   - Set from email and name
   - Optionally set reply-to email
   - Set daily email limit
5. Click **Save Settings**
6. Test configuration by sending a test email

### Gmail Setup (Recommended)

For Gmail users:
1. Enable 2-Step Verification in Google Account
2. Go to Security → App passwords
3. Generate an app password for "Mail"
4. Use the generated password in SMTP Password field
5. Use these settings:
   - Host: smtp.gmail.com
   - Port: 587
   - SSL/TLS: Enabled
   - Username: your-email@gmail.com

### Monitoring Email Activity

1. Navigate to **Admin Panel → SMTP Settings**
2. Click on the **Email Statistics** tab
3. View real-time statistics in the overview cards
4. Select a time period filter to narrow down the data
5. Click on any statistics card to filter logs by that status
6. Use custom date range for specific periods
7. Review individual email logs for details
8. Retry failed emails if needed

### Filtering Email Logs

**By Status:**
- Click on any statistics card (All, Sent, Failed, Draft, Trash)

**By Date:**
- Select a predefined period from the filter buttons
- Or choose "Custom Date" and select start/end dates

**Pagination:**
- Use the navigation buttons at the bottom to browse pages
- Shows current page and total pages

### Retrying Failed Emails

1. Navigate to Email Statistics tab
2. Filter by "Failed Emails" (click the Failed card)
3. Find the email you want to retry
4. Click the **Retry** button on the email log card
5. Confirm the retry action
6. The email will be queued for resending

## Security Best Practices

1. **Always use SSL/TLS** for secure connections
2. **Use app-specific passwords** instead of account passwords
3. **Set appropriate daily email limits** to prevent abuse
4. **Regularly test your email configuration**
5. **Monitor failed emails** and investigate patterns
6. **Keep SMTP credentials secure** - passwords are never displayed after saving

## Responsive Design

The SMTP Email Management System is fully responsive:
- **Mobile**: Single column layout, full-width cards
- **Tablet**: Two-column layout for statistics cards
- **Desktop**: Multi-column layout with optimal spacing

## Real-time Updates

- Statistics refresh automatically when filters change
- Pull-to-refresh support on mobile devices
- Loading indicators for all async operations
- Optimistic UI updates for better user experience

## Error Handling

The system includes comprehensive error handling:
- Validation errors for required fields
- Network error recovery with retry logic
- User-friendly error messages
- Detailed error logs for failed emails

## Performance Optimization

- Pagination for large datasets (20 items per page)
- Efficient API calls with proper filtering
- Cached statistics for faster loading
- Optimized re-renders with React hooks

## Future Enhancements

- Email template management integration
- Bulk email operations
- Advanced search and filtering
- Email scheduling
- Email analytics and reporting
- Export email logs to CSV/Excel
- Email bounce handling
- Unsubscribe management
