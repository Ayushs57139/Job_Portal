# Advertisement Management - Quick Start Guide

## 🚀 Quick Start

Get your advertisement system up and running in 5 minutes!

## Prerequisites

- Server is running (`cd server && npm start`)
- Admin account created and logged in
- MongoDB connection is active

## Step 1: Access Advertisement Management

1. Log in to Admin Panel at `http://localhost:8081/AdminLogin`
2. Navigate to **Advertisement Management** from the sidebar
3. You should see the Advertisement Management dashboard

## Step 2: Create Your First Advertisement

### Option A: Simple Banner Ad

1. Click **"Add New"** button
2. Fill in Basic Information:
   ```
   Title: Welcome Banner
   Type: banner
   Position: content-top
   Status: active
   Priority: 5
   ```

3. Go to **Content** tab:
   ```
   Image URL: https://via.placeholder.com/728x90?text=Welcome+to+JobWala
   Link URL: https://yoursite.com
   Link Text: Learn More
   ```

4. Go to **Targeting** tab:
   - Select pages: `home`, `jobs`
   - Select user types: `all`
   - Select devices: `all`

5. Click **"Create"**

### Option B: Google AdSense Ad

1. Click **"Add New"** button
2. Fill in Basic Information:
   ```
   Title: AdSense Home Banner
   Type: adsense
   Position: content-top
   Status: active
   ```

3. Go to **Content** tab:
   ```
   AdSense Client ID: ca-pub-XXXXXXXXXXXXXXXX
   Ad Slot: XXXXXXXXXX
   Ad Format: auto
   ```

4. Set targeting and click **"Create"**

### Option C: Google AdMob Ad (Mobile)

1. Click **"Add New"** button
2. Fill in Basic Information:
   ```
   Title: AdMob Mobile Banner
   Type: admob
   Position: mobile-banner
   Status: active
   ```

3. Go to **Content** tab:
   ```
   AdMob Ad Unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
   Ad Size: banner
   ```

4. Go to **Targeting** tab:
   - Select devices: `mobile`

5. Click **"Create"**

## Step 3: Verify Advertisement Display

1. Open your app at `http://localhost:8081`
2. Navigate to the Home page
3. You should see your advertisement displayed
4. Check console for any errors

## Step 4: Track Performance

1. Return to Admin Panel → Advertisement Management
2. Click the **Edit** icon on your ad
3. Go to **Performance** tab
4. View:
   - Impressions count
   - Clicks count
   - CTR (Click-Through Rate)

## Common Ad Positions

| Position | Description | Best For |
|----------|-------------|----------|
| `content-top` | Top of main content | Banner ads |
| `content-middle` | Middle of content | Inline ads |
| `content-bottom` | Bottom of content | Footer ads |
| `header` | Page header | Leaderboard ads |
| `sidebar-left` | Left sidebar | Skyscraper ads |
| `sidebar-right` | Right sidebar | Square/Rectangle ads |
| `footer` | Page footer | Text/Link ads |

## Standard Ad Sizes

### Desktop
- **Leaderboard**: 728 x 90
- **Medium Rectangle**: 300 x 250
- **Large Rectangle**: 336 x 280
- **Wide Skyscraper**: 160 x 600
- **Half Page**: 300 x 600

### Mobile
- **Mobile Banner**: 320 x 50
- **Large Mobile Banner**: 320 x 100
- **Mobile Medium Rectangle**: 300 x 250

## Quick Tips

### 1. Test Before Going Live
Always create ads as **"draft"** first, review them, then set to **"active"**

### 2. Set Priority Wisely
- Priority 10 = Most important (e.g., premium sponsors)
- Priority 5 = Normal (e.g., standard ads)
- Priority 1 = Least important (e.g., filler ads)

### 3. Use Scheduling
Set start/end dates for:
- Seasonal campaigns
- Time-limited offers
- Event-specific ads

### 4. Target Effectively
- Target `home` page for general awareness
- Target `jobs` page for recruitment-related ads
- Target `companies` page for B2B ads

### 5. Monitor Performance
Check your ads weekly:
- CTR below 0.5%? Consider redesigning
- High impressions, low clicks? Check your CTA
- No impressions? Check targeting settings

## Testing Checklist

- [ ] Ad appears on correct page
- [ ] Ad displays for correct user type
- [ ] Ad shows on correct device type
- [ ] Ad links work correctly
- [ ] Impressions are being tracked
- [ ] Clicks are being tracked
- [ ] Ad respects scheduling dates
- [ ] Ad priority is working
- [ ] Performance metrics are updating

## Troubleshooting

### Ad Not Showing?

**Check Status:**
```javascript
// Ad must be:
status: 'active'
isActive: true
// Current date must be between:
schedule.startDate <= today <= schedule.endDate
```

**Check Targeting:**
```javascript
// Must match:
targeting.pages includes current page OR 'all'
targeting.userTypes includes user type OR 'all'  
targeting.devices includes device type OR 'all'
```

### AdSense Not Working?

1. Verify AdSense account is approved
2. Check Client ID format: `ca-pub-XXXXXXXXXXXXXXXX`
3. Check Ad Slot format: `XXXXXXXXXX`
4. Disable ad blockers
5. Check browser console for errors

### AdMob Not Working?

1. Install AdMob library (see main README)
2. Configure app.json with AdMob App ID
3. Use test mode during development
4. Check Ad Unit ID format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

## Example API Usage

### Get Ads for Home Page
```javascript
fetch('http://localhost:3000/api/advertisements?page=home&position=content-top')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Record Impression
```javascript
fetch('http://localhost:3000/api/advertisements/:id/impression', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Record Click
```javascript
fetch('http://localhost:3000/api/advertisements/:id/click', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Integration Example

Add ads to any page in 3 steps:

```jsx
// Step 1: Import
import AdvertisementWidget from '../../components/AdvertisementWidget';

// Step 2: Add to render
<AdvertisementWidget 
  position="content-top" 
  page="mypage"
  containerStyle={styles.adContainer}
/>

// Step 3: Add styles
adContainer: {
  paddingVertical: 16,
  marginVertical: 16,
  alignItems: 'center',
  width: '100%',
}
```

## Next Steps

1. ✅ **Created your first ad** → Try creating different types
2. ✅ **Tested on Home page** → Add to other pages
3. ✅ **Tracking works** → Set up AdSense/AdMob
4. 📚 **Read full documentation** → See ADVERTISEMENT_MANAGEMENT_README.md
5. 🎨 **Customize design** → Match your brand
6. 📊 **Analyze performance** → Optimize campaigns

## Getting Help

- 📖 Full Documentation: `ADVERTISEMENT_MANAGEMENT_README.md`
- 🐛 Found a bug? Check console and server logs
- 💡 Need features? See "Future Enhancements" in main README

## Quick Reference

### Ad Types
`banner` | `sidebar` | `footer` | `popup` | `inline` | `adsense` | `admob`

### Positions
`header` | `sidebar-left` | `sidebar-right` | `footer` | `content-top` | `content-middle` | `content-bottom` | `popup` | `mobile-banner`

### Statuses
`draft` | `active` | `paused` | `inactive`

### Target Pages
`home` | `jobs` | `companies` | `login` | `register` | `dashboard` | `profile` | `all`

### User Types
`jobseeker` | `employer` | `consultancy` | `all`

### Devices
`desktop` | `mobile` | `tablet` | `all`

---

🎉 **Congratulations!** You now have a fully functional advertisement management system.

Start creating ads and monetizing your platform!

