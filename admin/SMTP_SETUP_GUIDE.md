# SMTP Setup & Testing Guide

## Quick Start

### Prerequisites
1. Admin panel running (`cd admin && npm start`)
2. Backend API server running
3. Admin account credentials

### Step 1: Access SMTP Settings

1. Open the admin panel in your browser
2. Login with admin credentials
3. Navigate to **SMTP Settings** from the sidebar menu

### Step 2: Configure SMTP Settings

#### For Gmail (Recommended for Testing)

1. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "JobWala Admin"
   - Copy the 16-character password

3. **Configure in Admin Panel**
   ```
   Provider: SMTP
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SSL/TLS: Enabled (ON)
   SMTP Username: your-email@gmail.com
   SMTP Password: [paste the 16-character app password]
   From Email: your-email@gmail.com
   From Name: JobWala
   Reply-To Email: support@jobwala.com (optional)
   Daily Email Limit: 1000
   Enable Email Notifications: ON
   ```

4. Click **Save Settings**

#### For Other Email Providers

**Outlook/Office 365:**
```
SMTP Host: smtp.office365.com
SMTP Port: 587
SSL/TLS: Enabled
Username: your-email@outlook.com
Password: your-password
```

**Yahoo Mail:**
```
SMTP Host: smtp.mail.yahoo.com
SMTP Port: 587
SSL/TLS: Enabled
Username: your-email@yahoo.com
Password: your-app-password
```

**Custom SMTP Server:**
```
SMTP Host: mail.yourdomain.com
SMTP Port: 587 (or 465 for SSL)
SSL/TLS: Enabled (recommended)
Username: your-username
Password: your-password
```

### Step 3: Test Email Configuration

1. Scroll down to the **Test Email Configuration** section
2. Enter a test email address (your email)
3. Click **Send Test** button
4. Check your inbox for the test email
5. If successful, you'll see a success message
6. If failed, check the error message and verify your settings

### Step 4: Monitor Email Activity

1. Click on the **Email Statistics** tab
2. View the statistics dashboard:
   - All Emails count
   - Sent Emails count
   - Failed Emails count
   - Draft Emails count
   - Trash Emails count

3. Select a time period filter:
   - Last 24 Hours (default)
   - Last 7 Days
   - Last 30 Days
   - Or any other predefined period
   - Or use Custom Date Range

4. Click on any statistics card to filter logs by that status

5. Review email logs:
   - View email details (subject, to, from, timestamp)
   - Check status (sent, failed, draft, trash)
   - Read error messages for failed emails
   - Retry failed emails

### Step 5: Retry Failed Emails

1. In the Email Statistics tab, click on **Failed Emails** card
2. Find the email you want to retry
3. Click the **Retry** button on the email log
4. Confirm the retry action
5. The email will be queued for resending
6. Refresh to see updated status

## Common Issues & Solutions

### Issue 1: "Authentication Failed"
**Solution:**
- Verify username and password are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check if 2-Step Verification is enabled (required for Gmail App Passwords)

### Issue 2: "Connection Timeout"
**Solution:**
- Verify SMTP host and port are correct
- Check if your firewall is blocking the SMTP port
- Try using port 465 with SSL instead of 587 with TLS

### Issue 3: "SSL/TLS Error"
**Solution:**
- Toggle the SSL/TLS switch and try again
- For port 587, SSL/TLS should be enabled
- For port 465, SSL/TLS should be enabled
- For port 25, SSL/TLS should be disabled (not recommended)

### Issue 4: "Daily Limit Exceeded"
**Solution:**
- Check your daily email limit setting
- Gmail free accounts have a limit of 500 emails per day
- Consider upgrading to Google Workspace for higher limits
- Or use a dedicated email service like SendGrid

### Issue 5: "Test Email Not Received"
**Solution:**
- Check spam/junk folder
- Verify the recipient email address is correct
- Wait a few minutes (email delivery can be delayed)
- Check email logs for error messages

## Email Statistics Features

### Time Period Filters

**Predefined Periods:**
- **Last 24 Hours**: View emails from the past day
- **Last 7 Days**: View emails from the past week
- **Last 14 Days**: View emails from the past 2 weeks
- **Last 30 Days**: View emails from the past month
- **Last 90 Days**: View emails from the past 3 months
- **Last 120 Days**: View emails from the past 4 months
- **Last 6 Months**: View emails from the past 6 months
- **Last 9 Months**: View emails from the past 9 months
- **Last 12 Months**: View emails from the past year

**Custom Date Range:**
- Click on **Custom Date** button
- Select **Start Date** using the date picker
- Select **End Date** using the date picker
- The logs will automatically filter to the selected range

### Status Filters

Click on any statistics card to filter logs:
- **All Emails**: Show all email logs
- **Sent Emails**: Show only successfully sent emails
- **Failed Emails**: Show only failed emails
- **Draft Emails**: Show only draft emails
- **Trash Emails**: Show only deleted emails

### Pagination

- Navigate through email logs using the pagination controls
- Shows 20 email logs per page
- Use Previous/Next buttons to navigate
- Current page and total pages displayed

## Testing Checklist

- [ ] SMTP settings saved successfully
- [ ] Test email sent and received
- [ ] Email statistics loading correctly
- [ ] All time period filters working
- [ ] Custom date range picker working
- [ ] Status filters working (All, Sent, Failed, Draft, Trash)
- [ ] Email logs displaying correctly
- [ ] Pagination working
- [ ] Retry failed emails working
- [ ] Refresh button updating data
- [ ] Mobile responsive design working
- [ ] Pull-to-refresh working on mobile

## Production Deployment

### Before Going Live

1. **Use a Dedicated Email Service**
   - Consider SendGrid, Mailgun, or AWS SES for production
   - These services offer better deliverability and higher limits
   - They provide detailed analytics and bounce handling

2. **Set Appropriate Limits**
   - Set daily email limit based on your plan
   - Monitor email usage regularly
   - Set up alerts for limit approaching

3. **Configure SPF, DKIM, and DMARC**
   - Add SPF record to your domain DNS
   - Configure DKIM for email authentication
   - Set up DMARC policy for email security

4. **Test Thoroughly**
   - Send test emails to multiple providers (Gmail, Outlook, Yahoo)
   - Check spam scores using tools like Mail-Tester
   - Verify email formatting on different clients

5. **Monitor Email Logs**
   - Regularly check failed emails
   - Investigate patterns in failures
   - Set up alerts for high failure rates

### Recommended Email Services

**SendGrid (Coming Soon)**
- Free tier: 100 emails/day
- Paid plans: Starting at $19.95/month for 50,000 emails
- Excellent deliverability
- Detailed analytics

**Mailgun (Coming Soon)**
- Free tier: 5,000 emails/month
- Paid plans: Pay as you go
- Developer-friendly API
- Good for transactional emails

**AWS SES (Coming Soon)**
- Very affordable: $0.10 per 1,000 emails
- Requires AWS account
- Excellent for high volume
- Integrates with other AWS services

## Support

For issues or questions:
1. Check the error messages in email logs
2. Review the SMTP_EMAIL_MANAGEMENT.md documentation
3. Contact your system administrator
4. Check backend API logs for detailed errors

## Security Notes

- Never share your SMTP credentials
- Use app-specific passwords when available
- Enable SSL/TLS for all connections
- Regularly rotate passwords
- Monitor for suspicious email activity
- Set appropriate daily limits to prevent abuse
