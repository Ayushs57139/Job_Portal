# Login Security Management System

## Overview

The Login Security Management System provides comprehensive monitoring and control over login attempts across the entire platform. This system tracks all login activities, identifies security threats, and provides tools to block malicious actors.

## Features

### 1. Login Statistics Dashboard

#### Real-time Statistics Cards

**User Type Statistics:**
- **Total Login Attempts**: All login attempts across the platform
- **Admin Login Attempts**: Login attempts by admin users
- **Candidate Login Attempts**: Login attempts by job seekers
- **Company Login Attempts**: Login attempts by company accounts
- **Consultancy Login Attempts**: Login attempts by consultancy accounts

**Success/Failure Statistics:**
- **Successful Logins**: Successfully authenticated logins
- **Failed Logins**: Failed authentication attempts
- **Wrong Username Attempts**: Login attempts with non-existent usernames
- **Wrong Password Attempts**: Login attempts with incorrect passwords

### 2. Time Period Filters

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

### 3. Login Activity Lists

#### Login IPs List
- Displays all IP addresses that attempted to login
- Shows attempt count per IP
- Shows last attempt timestamp
- Quick block button for suspicious IPs

#### Login Countries List
- Displays all countries from which login attempts originated
- Shows attempt count per country
- Helps identify geographic patterns

#### Wrong Usernames List
- Lists all usernames that were attempted but don't exist
- Shows attempt count per username
- Shows last attempt timestamp
- Quick block button to prevent further attempts

#### Blocked IPs List
- Displays all currently blocked IP addresses
- Shows block reason
- Shows when the IP was blocked
- Unblock button to remove restrictions

#### Blocked Usernames List
- Displays all currently blocked usernames
- Shows block reason
- Shows when the username was blocked
- Unblock button to remove restrictions

### 4. Security Settings

#### Blocking Options
- **Enable IP Blocking**: Toggle to activate/deactivate IP-based blocking
- **Enable Username Blocking**: Toggle to activate/deactivate username-based blocking
- **Enable Country Blocking**: Toggle to activate/deactivate country-based blocking

#### Security Parameters
- **Max Failed Attempts**: Number of failed attempts before automatic blocking (default: 5)
- **Block Duration**: How long to block after max failed attempts (in minutes, default: 30)

#### Country Management
- **Allowed Countries**: Whitelist of countries that can access the platform
- **Blocked Countries**: Blacklist of countries that are denied access

### 5. Manual Blocking Features

#### Block IP Address
- Manually add IP addresses to the block list
- Provide a reason for blocking
- Immediate effect on login attempts

#### Block Username
- Manually add usernames to the block list
- Provide a reason for blocking
- Prevents any login attempts with that username

#### Unblock Actions
- Remove IPs from the block list
- Remove usernames from the block list
- Confirmation dialog to prevent accidental unblocking

## API Endpoints

### Statistics & Logs
- `GET /admin/login-security/statistics` - Get login statistics
  - Query params: `page`, `limit`, `startDate`, `endDate`
- `GET /admin/login-security/logs` - Get login attempt logs
  - Query params: `page`, `limit`, `startDate`, `endDate`

### Lists
- `GET /admin/login-security/ips` - Get list of IPs with login attempts
  - Query params: `startDate`, `endDate`
- `GET /admin/login-security/countries` - Get list of countries with login attempts
  - Query params: `startDate`, `endDate`
- `GET /admin/login-security/wrong-usernames` - Get list of wrong username attempts
  - Query params: `startDate`, `endDate`
- `GET /admin/login-security/blocked-ips` - Get list of blocked IPs
- `GET /admin/login-security/blocked-usernames` - Get list of blocked usernames

### Blocking Actions
- `POST /admin/login-security/block-ip` - Block an IP address
  - Body: `{ ip, reason }`
- `POST /admin/login-security/unblock-ip` - Unblock an IP address
  - Body: `{ ip }`
- `POST /admin/login-security/block-username` - Block a username
  - Body: `{ username, reason }`
- `POST /admin/login-security/unblock-username` - Unblock a username
  - Body: `{ username }`

### Settings
- `GET /admin/login-security/settings` - Get security settings
- `PUT /admin/login-security/settings` - Update security settings
  - Body: `{ enableIpBlocking, enableUsernameBlocking, enableCountryBlocking, maxFailedAttempts, blockDuration, allowedCountries, blockedCountries }`

## Usage Guide

### Monitoring Login Activity

1. Navigate to **Admin Panel → Login Security**
2. View the **Statistics & Logs** tab
3. Review the statistics cards for an overview
4. Select a time period filter to narrow down the data
5. Scroll through the various lists:
   - Login IPs List
   - Login Countries List
   - Wrong Usernames List
   - Blocked IPs List
   - Blocked Usernames List

### Blocking Suspicious Activity

**Block an IP Address:**
1. In the Login IPs List, click the ban icon next to a suspicious IP
2. Or click the "Block IP" button at the bottom
3. Enter the IP address
4. Optionally provide a reason
5. Click "Block IP"

**Block a Username:**
1. In the Wrong Usernames List, click the ban icon next to a suspicious username
2. Or click the "Block Username" button at the bottom
3. Enter the username
4. Optionally provide a reason
5. Click "Block Username"

### Unblocking

**Unblock an IP:**
1. Find the IP in the Blocked IPs List
2. Click the "Unblock" button
3. Confirm the action

**Unblock a Username:**
1. Find the username in the Blocked Usernames List
2. Click the "Unblock" button
3. Confirm the action

### Configuring Security Settings

1. Navigate to the **Security Settings** tab
2. Toggle the blocking options:
   - Enable IP Blocking
   - Enable Username Blocking
   - Enable Country Blocking
3. Set the security parameters:
   - Max Failed Attempts (e.g., 5)
   - Block Duration in minutes (e.g., 30)
4. Click "Save Settings"

## Security Best Practices

### Monitoring
1. **Regular Reviews**: Check login statistics daily
2. **Pattern Recognition**: Look for unusual patterns in failed attempts
3. **Geographic Analysis**: Monitor login attempts from unexpected countries
4. **Time-based Analysis**: Identify suspicious activity during off-hours

### Blocking Strategy
1. **Progressive Blocking**: Start with temporary blocks, escalate to permanent if needed
2. **Document Reasons**: Always provide a reason when manually blocking
3. **Review Blocked Lists**: Regularly review and clean up blocked IPs/usernames
4. **Whitelist Important IPs**: Consider whitelisting known good IPs

### Response to Threats
1. **Immediate Action**: Block IPs showing brute force patterns
2. **Investigation**: Research suspicious IPs using IP lookup tools
3. **Notification**: Alert relevant teams about security incidents
4. **Documentation**: Keep records of security incidents

### Configuration Recommendations
1. **Max Failed Attempts**: 3-5 attempts is recommended
2. **Block Duration**: 30-60 minutes for first offense
3. **Country Blocking**: Use cautiously, may block legitimate users
4. **IP Blocking**: Most effective against automated attacks

## Understanding the Data

### Login Attempt Types

**Successful Login:**
- Correct username and password
- Account is active and not blocked
- No security restrictions apply

**Failed Login - Wrong Username:**
- Username doesn't exist in the system
- Possible typo or reconnaissance attempt
- High frequency indicates potential attack

**Failed Login - Wrong Password:**
- Username exists but password is incorrect
- Could be legitimate user error or attack
- Multiple attempts from same IP is suspicious

### IP Address Analysis

**Single IP, Multiple Attempts:**
- Could be brute force attack
- Consider blocking after threshold

**Multiple IPs, Same Username:**
- Distributed attack
- Consider blocking the username

**Geographic Anomalies:**
- Logins from unexpected countries
- Rapid location changes
- May indicate compromised accounts

## Automated Security Features

### Automatic Blocking
When enabled, the system automatically blocks:
- IPs exceeding max failed attempts
- Usernames exceeding max failed attempts
- Countries in the blocked list

### Block Duration
- Temporary blocks expire after the configured duration
- Permanent blocks require manual unblocking
- Block history is maintained for audit purposes

### Notifications
- Admins can be notified of:
  - High number of failed attempts
  - Automatic blocks triggered
  - Suspicious patterns detected

## Reporting & Analytics

### Available Reports
1. **Login Trends**: Track login patterns over time
2. **Failure Analysis**: Understand why logins fail
3. **Geographic Distribution**: See where users login from
4. **Security Incidents**: Track blocked IPs and usernames

### Export Options
- Export login logs to CSV
- Export blocked lists for external analysis
- Generate security reports for compliance

## Integration with Other Systems

### Email Notifications
- Send alerts when suspicious activity is detected
- Notify users of failed login attempts on their account
- Alert admins of automatic blocks

### Logging
- All login attempts are logged
- Block/unblock actions are audited
- Settings changes are tracked

### API Access
- Programmatic access to security data
- Integration with SIEM systems
- Webhook support for real-time alerts

## Troubleshooting

### Issue: Legitimate Users Being Blocked

**Solution:**
1. Check the Blocked IPs/Usernames lists
2. Unblock the affected IP/username
3. Adjust max failed attempts threshold
4. Consider whitelisting the IP

### Issue: Too Many False Positives

**Solution:**
1. Increase max failed attempts threshold
2. Increase block duration to reduce permanent blocks
3. Review blocking criteria
4. Implement IP whitelisting

### Issue: Attacks Not Being Blocked

**Solution:**
1. Verify blocking options are enabled
2. Check max failed attempts threshold (may be too high)
3. Review block duration settings
4. Consider implementing country blocking

### Issue: Unable to Access After Block

**Solution:**
1. Contact system administrator
2. Verify IP address is not blocked
3. Check username is not blocked
4. Clear browser cache and cookies

## Performance Considerations

### Database Optimization
- Login logs are indexed for fast queries
- Old logs are archived periodically
- Statistics are cached for performance

### Scalability
- System handles high volume of login attempts
- Blocking checks are optimized for speed
- Distributed caching for block lists

## Compliance & Privacy

### Data Retention
- Login logs retained for 90 days by default
- Blocked lists retained indefinitely
- Configurable retention policies

### Privacy
- IP addresses are stored securely
- Access to security data is restricted
- Audit logs track who accessed what data

### Compliance
- GDPR compliant data handling
- Right to be forgotten support
- Data export capabilities

## Future Enhancements

### Planned Features
- Machine learning for anomaly detection
- Risk scoring for login attempts
- Two-factor authentication integration
- Biometric authentication support
- Advanced threat intelligence integration
- Real-time dashboard with live updates
- Mobile app for security monitoring
- Integration with external security services

## Support

For issues or questions:
1. Review this documentation
2. Check the in-app help sections
3. Contact system administrator
4. Review backend API logs for detailed errors

## Conclusion

The Login Security Management System provides comprehensive tools to monitor, analyze, and control login activity across your platform. By leveraging these features, you can significantly enhance the security posture of your application and protect against unauthorized access attempts.
