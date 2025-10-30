# Advertisement Management System

## Overview

The Advertisement Management System is a comprehensive solution for managing and displaying advertisements across the JobWala platform. It provides full control over ad placement, targeting, scheduling, and performance tracking with support for multiple ad types including custom ads, Google AdSense, and Google AdMob.

## Features

### ✨ Core Features

- **Full CRUD Operations**: Create, read, update, and delete advertisements
- **Multiple Ad Types**: 
  - Custom Banner Ads
  - Sidebar Ads
  - Footer Ads
  - Popup Ads
  - Inline Content Ads
  - Google AdSense Integration
  - Google AdMob Integration (Mobile)

- **Advanced Targeting**:
  - Page-specific targeting (Home, Jobs, Companies, etc.)
  - User type targeting (Jobseeker, Employer, Consultancy)
  - Device targeting (Desktop, Mobile, Tablet)
  - Location targeting
  - Industry targeting

- **Scheduling System**:
  - Start and end date configuration
  - Timezone support
  - Automatic activation/deactivation

- **Performance Tracking**:
  - Impressions counting
  - Click tracking
  - Click-through rate (CTR) calculation
  - Revenue tracking

- **Customization Options**:
  - Custom dimensions (width/height)
  - Background and border colors
  - Border radius
  - Margins and padding
  - Priority levels (1-10)

## System Architecture

### Backend Components

#### 1. Advertisement Model (`server/models/Advertisement.js`)
```javascript
{
  title: String,              // Advertisement title
  description: String,        // Advertisement description
  type: String,              // banner, sidebar, footer, popup, inline, adsense, admob
  position: String,          // header, sidebar-left, sidebar-right, footer, content-top, etc.
  content: {
    html: String,           // Custom HTML content
    imageUrl: String,       // Image URL
    imageAlt: String,       // Image alt text
    text: String,           // Text content
    linkUrl: String,        // Click destination URL
    linkText: String        // Link button text
  },
  adsense: {
    adClient: String,       // Google AdSense client ID
    adSlot: String,         // Ad slot ID
    adFormat: String,       // auto, rectangle, vertical, horizontal
    adStyle: String         // Custom CSS styles
  },
  admob: {
    adUnitId: String,       // AdMob ad unit ID
    adSize: String          // banner, large-banner, medium-rectangle, etc.
  },
  displaySettings: {
    width: Number,
    height: Number,
    backgroundColor: String,
    borderColor: String,
    borderRadius: Number,
    margin: { top, right, bottom, left },
    padding: { top, right, bottom, left }
  },
  targeting: {
    pages: [String],        // Target pages
    userTypes: [String],    // Target user types
    devices: [String],      // Target devices
    locations: [String],    // Target locations
    industries: [String]    // Target industries
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: String
  },
  performance: {
    impressions: Number,
    clicks: Number,
    ctr: Number,
    revenue: Number
  },
  status: String,           // active, inactive, paused, draft
  priority: Number,         // 1-10, higher = more priority
  isActive: Boolean
}
```

#### 2. Advertisement Routes (`server/routes/advertisements.js`)

**Public Endpoints:**
- `GET /api/advertisements` - Get active advertisements for display
- `GET /api/advertisements/:id` - Get single advertisement
- `POST /api/advertisements/:id/impression` - Record impression
- `POST /api/advertisements/:id/click` - Record click

**Admin Endpoints (Authentication Required):**
- `GET /api/advertisements/admin/list` - Get all advertisements with pagination
- `GET /api/advertisements/admin/stats` - Get advertisement statistics
- `POST /api/advertisements/admin/create` - Create new advertisement
- `PUT /api/advertisements/admin/:id` - Update advertisement
- `DELETE /api/advertisements/admin/:id` - Delete advertisement
- `PUT /api/advertisements/admin/:id/status` - Update advertisement status

### Frontend Components

#### 1. Admin Management Screen (`src/screens/Admin/AdminAdvertisementManagementScreen.js`)

Full-featured admin interface for managing advertisements with:

- **Dashboard Statistics**:
  - Total ads count
  - Active ads count
  - Total impressions
  - Total clicks

- **Filtering & Search**:
  - Search by title/description
  - Filter by type (banner, AdSense, AdMob, etc.)
  - Filter by status (active, draft, paused)

- **Modal Editor with Tabs**:
  - Basic Information (title, type, position, status, priority)
  - Content (HTML, images, links, AdSense/AdMob config)
  - Targeting (pages, user types, devices)
  - Scheduling (start/end dates)
  - Performance (impressions, clicks, CTR, revenue)

- **Actions**:
  - Create new advertisement
  - Edit existing advertisement
  - Delete advertisement
  - Activate/Pause advertisement
  - View performance metrics

#### 2. Advertisement Widget (`src/components/AdvertisementWidget.js`)

Reusable component for displaying advertisements on any page:

```jsx
<AdvertisementWidget 
  position="content-top"      // Ad position
  page="home"                 // Current page
  containerStyle={{}}         // Custom styles
  onAdClick={(ad) => {}}      // Click callback
  maxAds={1}                  // Max ads to display
/>
```

Features:
- Automatic targeting and filtering
- Impression tracking
- Click tracking and handling
- Support for all ad types
- Responsive design

#### 3. AdSense Component (`src/components/AdSenseComponent.js`)

Google AdSense integration for web platforms:

```jsx
<AdSenseComponent
  adClient="ca-pub-XXXXXXXXXXXXXXXX"
  adSlot="XXXXXXXXXX"
  adFormat="auto"
  style={{ width: 728, height: 90 }}
  fullWidthResponsive={true}
/>
```

Features:
- Automatic AdSense script loading
- Responsive ad support
- Web-only (gracefully hidden on mobile)

#### 4. AdMob Component (`src/components/AdMobComponent.js`)

Google AdMob integration for mobile platforms:

```jsx
<AdMobComponent
  adUnitId="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
  adSize="banner"
  testMode={false}
  onAdLoaded={() => {}}
  onAdFailedToLoad={(error) => {}}
/>
```

Features:
- Multiple ad sizes
- Test mode for development
- Event callbacks
- Mobile-only (gracefully hidden on web)

**Note:** To use real AdMob ads, install one of these packages:
```bash
# For Expo managed workflow
expo install expo-ads-admob

# For React Native CLI or bare workflow
npm install react-native-google-mobile-ads
```

## Usage Guide

### For Administrators

#### Creating an Advertisement

1. Navigate to **Admin Panel** → **Advertisement Management**
2. Click **"Add New"** button
3. Fill in the **Basic Information** tab:
   - Title (required)
   - Description
   - Type (banner, sidebar, adsense, admob, etc.)
   - Position (header, content-top, footer, etc.)
   - Status (draft, active, paused, inactive)
   - Priority (1-10)

4. Configure **Content** tab based on ad type:
   
   **For Custom Ads:**
   - Add HTML content
   - Or add image URL and link
   - Configure display settings (width, height, colors, etc.)
   
   **For AdSense:**
   - Enter AdSense Client ID (ca-pub-XXXXXXXXXXXXXXXX)
   - Enter Ad Slot ID
   - Select ad format (auto, rectangle, vertical, horizontal)
   
   **For AdMob:**
   - Enter AdMob Ad Unit ID
   - Select ad size (banner, large-banner, etc.)

5. Set **Targeting** options:
   - Select target pages (home, jobs, companies, etc.)
   - Choose user types (jobseeker, employer, consultancy, all)
   - Choose devices (desktop, mobile, tablet, all)

6. Configure **Schedule**:
   - Set start date (when ad should start showing)
   - Set end date (optional, leave empty for indefinite)

7. Click **"Create"** to save

#### Managing Advertisements

- **Edit**: Click the edit icon (✏️) on any advertisement card
- **Delete**: Click the delete icon (🗑️) and confirm
- **Activate/Pause**: Click the status button at the bottom of the card
- **View Performance**: Edit the ad and go to the "Performance" tab

#### Understanding Performance Metrics

- **Impressions**: Number of times the ad was displayed
- **Clicks**: Number of times the ad was clicked
- **CTR (Click-Through Rate)**: (Clicks / Impressions) × 100%
- **Revenue**: Total revenue generated (if tracked)

### For Developers

#### Integrating Ads in New Pages

1. Import the AdvertisementWidget:
```javascript
import AdvertisementWidget from '../../components/AdvertisementWidget';
```

2. Add the widget where you want ads to appear:
```jsx
<AdvertisementWidget 
  position="content-top"
  page="yourpage"
  containerStyle={styles.adContainer}
/>
```

3. Add container styles:
```javascript
adContainer: {
  paddingVertical: spacing.md,
  marginVertical: spacing.md,
  alignItems: 'center',
  width: '100%',
}
```

#### Available Positions

- `header` - Top of the page
- `sidebar-left` - Left sidebar
- `sidebar-right` - Right sidebar  
- `footer` - Bottom of the page
- `content-top` - Top of main content
- `content-middle` - Middle of content
- `content-bottom` - Bottom of content
- `popup` - Popup/modal
- `mobile-banner` - Mobile banner
- `mobile-interstitial` - Mobile interstitial

#### Custom Ad Click Handling

```jsx
<AdvertisementWidget 
  position="content-top"
  page="home"
  onAdClick={(ad) => {
    console.log('Ad clicked:', ad.title);
    // Custom handling here
  }}
/>
```

## Integration Examples

### Home Page Integration
```jsx
// In HomeScreen.js
<ScrollView>
  {renderHeroSection()}
  
  {/* Ad after hero section */}
  <AdvertisementWidget position="content-top" page="home" />
  
  {renderLatestJobs()}
  
  {/* Ad between sections */}
  <AdvertisementWidget position="content-middle" page="home" />
  
  {renderTopCompanies()}
  
  {/* Ad before footer */}
  <AdvertisementWidget position="content-bottom" page="home" />
  
  <Footer />
</ScrollView>
```

### Job Listings Integration
```jsx
// In JobsScreen.js
{jobs.map((job, index) => (
  <React.Fragment key={job._id}>
    <JobCard job={job} />
    {/* Show ad after every 5 jobs */}
    {(index + 1) % 5 === 0 && (
      <AdvertisementWidget 
        position="content-middle" 
        page="jobs"
      />
    )}
  </React.Fragment>
))}
```

## Current Implementation

The Advertisement Management System is currently integrated in the following pages:

1. **Home Page** (`src/screens/Home/HomeScreen.js`)
   - Top content position (after hero section)
   - Middle content position (between jobs and companies)
   - Bottom content position (before footer CTA)

2. **Jobs Page** (`src/screens/Jobs/JobsScreen.js`)
   - Top of job listings
   - After every 5 jobs
   - Bottom of job listings

3. **Companies Page** (`src/screens/Companies/CompaniesScreen.js`)
   - Top of companies section
   - After every 6 companies
   - Bottom of companies section

## API Documentation

### Get Advertisements for Display

```http
GET /api/advertisements?position=content-top&page=home&userType=jobseeker&device=desktop
```

**Query Parameters:**
- `position` (optional) - Filter by position
- `page` (optional) - Filter by page
- `userType` (optional) - User type for targeting
- `device` (optional) - Device type for targeting

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Sample Ad",
      "type": "banner",
      "position": "content-top",
      "content": { ... },
      "displaySettings": { ... },
      "performance": {
        "impressions": 1000,
        "clicks": 50,
        "ctr": 5.0
      }
    }
  ],
  "count": 1
}
```

### Record Advertisement Impression

```http
POST /api/advertisements/:id/impression
```

**Response:**
```json
{
  "success": true,
  "message": "Impression recorded"
}
```

### Record Advertisement Click

```http
POST /api/advertisements/:id/click
```

**Response:**
```json
{
  "success": true,
  "message": "Click recorded"
}
```

### Get All Advertisements (Admin)

```http
GET /api/advertisements/admin/list?page=1&limit=10&status=active
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `status` (optional) - Filter by status
- `type` (optional) - Filter by type
- `position` (optional) - Filter by position
- `search` (optional) - Search term

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### Get Advertisement Statistics (Admin)

```http
GET /api/advertisements/admin/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 50,
      "active": 20,
      "draft": 15,
      "paused": 15
    },
    "performance": {
      "totalImpressions": 50000,
      "totalClicks": 2500,
      "totalRevenue": 500,
      "avgCTR": 5.0
    },
    "byType": [
      { "_id": "banner", "count": 20 },
      { "_id": "adsense", "count": 15 },
      { "_id": "admob", "count": 15 }
    ],
    "byPosition": [
      { "_id": "content-top", "count": 15 },
      { "_id": "content-middle", "count": 20 },
      { "_id": "footer", "count": 15 }
    ]
  }
}
```

### Create Advertisement (Admin)

```http
POST /api/advertisements/admin/create
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Summer Sale Ad",
  "description": "Promote summer sale",
  "type": "banner",
  "position": "content-top",
  "status": "active",
  "priority": 8,
  "content": {
    "imageUrl": "https://example.com/image.jpg",
    "linkUrl": "https://example.com/sale",
    "linkText": "Shop Now"
  },
  "displaySettings": {
    "width": 728,
    "height": 90,
    "backgroundColor": "#ffffff",
    "borderRadius": 8
  },
  "targeting": {
    "pages": ["home", "jobs"],
    "userTypes": ["all"],
    "devices": ["desktop", "mobile"]
  },
  "schedule": {
    "startDate": "2024-06-01",
    "endDate": "2024-08-31"
  }
}
```

### Update Advertisement (Admin)

```http
PUT /api/advertisements/admin/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:** (Same as create, all fields optional)

### Delete Advertisement (Admin)

```http
DELETE /api/advertisements/admin/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

### Update Advertisement Status (Admin)

```http
PUT /api/advertisements/admin/:id/status
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "active"
}
```

## Google AdSense Setup

### 1. Get AdSense Account
1. Sign up at https://www.google.com/adsense
2. Complete verification process
3. Get your publisher ID (ca-pub-XXXXXXXXXXXXXXXX)

### 2. Create Ad Units
1. In AdSense dashboard, go to "Ads" → "By ad unit"
2. Click "+ New ad unit"
3. Choose ad type and size
4. Copy the Ad Unit ID

### 3. Create AdSense Advertisement
1. In JobWala Admin Panel, create new advertisement
2. Select type: "adsense"
3. Enter your AdSense Client ID
4. Enter Ad Slot ID
5. Configure targeting and scheduling
6. Save and activate

### 4. Web Integration
The AdSense script is automatically loaded when an AdSense ad is displayed. No manual integration needed!

## Google AdMob Setup

### 1. Get AdMob Account
1. Sign up at https://admob.google.com
2. Create an app in AdMob console
3. Get your App ID

### 2. Install Required Package

**For Expo:**
```bash
expo install expo-ads-admob
```

**For React Native:**
```bash
npm install react-native-google-mobile-ads
cd ios && pod install
```

### 3. Configure App

**For Expo (app.json):**
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    },
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    }
  }
}
```

**For React Native (AndroidManifest.xml):**
```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

**For React Native (Info.plist):**
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX</string>
```

### 4. Create Ad Units
1. In AdMob console, go to "Apps" → Your App → "Ad units"
2. Create ad units for different positions
3. Copy Ad Unit IDs

### 5. Create AdMob Advertisement
1. In JobWala Admin Panel, create new advertisement
2. Select type: "admob"
3. Enter Ad Unit ID
4. Select ad size
5. Configure targeting for mobile devices
6. Save and activate

### 6. Update AdMob Component
Uncomment the actual AdMob implementation in `src/components/AdMobComponent.js` and use the appropriate library (expo-ads-admob or react-native-google-mobile-ads).

## Best Practices

### Ad Placement
- Don't overload pages with too many ads
- Place ads naturally within content flow
- Use appropriate ad sizes for each position
- Test different positions for better performance

### Targeting
- Target specific user types for better relevance
- Use page-specific ads for better context
- Consider device types for ad format selection
- Test different targeting combinations

### Performance
- Monitor CTR regularly
- Pause low-performing ads
- A/B test different ad creatives
- Adjust priority based on performance

### Scheduling
- Plan seasonal campaigns in advance
- Set end dates for time-limited offers
- Use drafts for preparing future campaigns
- Review and update expired ads regularly

### AdSense Best Practices
- Follow Google AdSense policies strictly
- Don't encourage clicks on ads
- Maintain good content quality
- Place ads in viewable areas
- Don't place too many ads per page

### AdMob Best Practices
- Use test mode during development
- Follow Google AdMob policies
- Implement proper ad frequency capping
- Handle ad loading errors gracefully
- Test on real devices

## Troubleshooting

### Ads Not Displaying

**Check:**
1. Ad status is "active"
2. Schedule dates are valid (current date between start and end)
3. Targeting matches current page, user type, and device
4. isActive is true
5. No errors in browser console

### AdSense Ads Not Showing

**Check:**
1. AdSense account is approved and active
2. Client ID and Slot ID are correct
3. Ad formats are appropriate for the space
4. No ad blockers are interfering
5. Site is approved in AdSense

### AdMob Ads Not Showing

**Check:**
1. AdMob library is installed correctly
2. App ID is configured properly
3. Ad Unit ID is correct
4. Test mode is enabled during development
5. Network connection is stable

### Performance Tracking Issues

**Check:**
1. Impression/click API endpoints are working
2. Network requests are not blocked
3. Ad component is properly mounted
4. Event handlers are correctly attached

## Security Considerations

1. **Admin Authentication**: All admin endpoints require authentication
2. **Input Validation**: All inputs are validated on backend
3. **XSS Protection**: HTML content should be sanitized (if allowing custom HTML)
4. **Rate Limiting**: Consider implementing rate limiting for impression/click endpoints
5. **CORS**: Ensure proper CORS configuration for API endpoints

## Performance Optimization

1. **Lazy Loading**: Ads are loaded only when needed
2. **Caching**: Consider caching active ads on client-side
3. **Compression**: Use image compression for custom ad images
4. **CDN**: Serve static ad assets from CDN
5. **Indexing**: Database indexes are set for better query performance

## Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] A/B testing functionality
- [ ] Bulk import/export of advertisements
- [ ] Advertisement templates
- [ ] Revenue optimization suggestions
- [ ] Integration with more ad networks
- [ ] Geolocation-based targeting
- [ ] Real-time bidding support
- [ ] Ad rotation and frequency capping
- [ ] Click fraud detection

## Support

For issues or questions:
1. Check this documentation
2. Review the API documentation
3. Check browser console for errors
4. Review server logs
5. Contact the development team

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Full CRUD operations for advertisements
- Google AdSense integration
- Google AdMob integration support
- Advanced targeting options
- Performance tracking
- Admin management interface
- Integration in Home, Jobs, and Companies pages

---

**Last Updated:** October 30, 2025
**Version:** 1.0.0

