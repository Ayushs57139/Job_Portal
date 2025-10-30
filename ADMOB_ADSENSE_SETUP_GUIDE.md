# AdMob & AdSense - Complete Setup Guide

## 🎉 Fully Integrated & Dynamic

Your JobWala platform now has **fully integrated** Google AdMob and Google AdSense support! Both are dynamically integrated with the Advertisement Management System.

## ✅ What's Been Done

### 1. AdMob Integration (Mobile) ✅
- ✅ **Installed**: `expo-ads-admob` library
- ✅ **Configured**: `app.config.js` with AdMob App IDs
- ✅ **Implemented**: Full AdMob component with real ads
- ✅ **Integrated**: Works dynamically with Advertisement Management System
- ✅ **Test Mode**: Automatic test ads in development

### 2. AdSense Integration (Web) ✅
- ✅ **Implemented**: Full AdSense component with dynamic loading
- ✅ **Script Loading**: Automatic AdSense script injection
- ✅ **Dynamic Integration**: Works with Advertisement Management System
- ✅ **Responsive**: Auto-adjusts to container size

### 3. Advertisement Widget ✅
- ✅ **Updated**: Now uses real AdMob and AdSense components
- ✅ **Platform Detection**: Automatically shows correct ad type
- ✅ **Dynamic Rendering**: Fetches and displays ads from backend

## 📱 How It Works

### Architecture Flow

```
Admin Creates Ad (Backend) 
    ↓
Advertisement saved to MongoDB with type (adsense/admob/custom)
    ↓
Frontend fetches ad based on (page, position, user type, device)
    ↓
AdvertisementWidget renders correct component:
    - AdSense on Web
    - AdMob on Mobile (iOS/Android)
    - Custom ad on both
    ↓
Ad displays with automatic impression/click tracking
```

## 🚀 Quick Start

### For Google AdSense (Web)

#### Step 1: Get AdSense Account
1. Go to https://www.google.com/adsense
2. Sign up and verify your website
3. Get approved (may take 1-3 days)
4. Note your **Publisher ID**: `ca-pub-XXXXXXXXXXXXXXXX`

#### Step 2: Create Ad Unit
1. In AdSense dashboard → **Ads** → **By ad unit**
2. Click **+ New ad unit**
3. Choose **Display ads**
4. Configure size and type
5. Copy the **Ad Slot ID**: `XXXXXXXXXX`

#### Step 3: Create Advertisement in JobWala Admin
1. Login to Admin Panel
2. Go to **Advertisement Management**
3. Click **"Add New"**
4. Fill in:
   ```
   Title: AdSense Home Banner
   Type: adsense
   Position: content-top
   Status: active
   ```
5. Go to **Content** tab:
   ```
   AdSense Client ID: ca-pub-XXXXXXXXXXXXXXXX
   Ad Slot: XXXXXXXXXX
   Ad Format: auto
   ```
6. Go to **Targeting** tab:
   ```
   Pages: home, jobs, companies
   User Types: all
   Devices: desktop, tablet (NOT mobile - AdSense is web only)
   ```
7. Click **"Create"**

#### Step 4: Test
1. Open your website in browser
2. Navigate to Home, Jobs, or Companies page
3. You should see AdSense ads displaying
4. Check browser console for any errors

### For Google AdMob (Mobile)

#### Step 1: Get AdMob Account
1. Go to https://admob.google.com
2. Sign up with Google account
3. Create an app in AdMob console
4. Get your **AdMob App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

#### Step 2: Update App Configuration
The app is already configured with **test App IDs**. To use your real App ID:

**Edit `app.config.js`:**
```javascript
ios: {
  config: {
    googleMobileAdsAppId: "ca-app-pub-YOUR-APP-ID~IOS-ID"
  }
},
android: {
  config: {
    googleMobileAdsAppId: "ca-app-pub-YOUR-APP-ID~ANDROID-ID"
  }
}
```

#### Step 3: Create Ad Units
1. In AdMob console → **Apps** → Your App → **Ad units**
2. Click **Add ad unit**
3. Choose **Banner** (or other type)
4. Configure settings
5. Copy **Ad unit ID**: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

#### Step 4: Create Advertisement in JobWala Admin
1. Login to Admin Panel
2. Go to **Advertisement Management**
3. Click **"Add New"**
4. Fill in:
   ```
   Title: AdMob Mobile Banner
   Type: admob
   Position: mobile-banner (or content-top, content-middle, etc.)
   Status: active
   ```
5. Go to **Content** tab:
   ```
   AdMob Ad Unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
   Ad Size: banner (or largeBanner, mediumRectangle, etc.)
   ```
6. Go to **Targeting** tab:
   ```
   Pages: home, jobs, companies
   User Types: all
   Devices: mobile (ONLY mobile for AdMob)
   ```
7. Click **"Create"**

#### Step 5: Build and Test
```bash
# For iOS
expo build:ios

# For Android
expo build:android

# Or for development
expo start
# Then test on real device or emulator
```

## 📊 Available Ad Sizes

### AdSense Formats (Web)
- `auto` - Automatic (Responsive)
- `rectangle` - Rectangle format
- `vertical` - Vertical format
- `horizontal` - Horizontal format

### AdMob Sizes (Mobile)
- `banner` - 320x50 (Standard)
- `largeBanner` - 320x100 (Large)
- `mediumRectangle` - 300x250 (Medium Rectangle)
- `fullBanner` - 468x60 (Full Banner)
- `leaderboard` - 728x90 (Leaderboard)
- `smartBannerPortrait` - Smart Banner (Portrait)
- `smartBannerLandscape` - Smart Banner (Landscape)

## 🎯 Best Practices

### AdSense
1. ✅ Wait for approval before using real ads
2. ✅ Don't click your own ads
3. ✅ Place ads in viewable areas
4. ✅ Don't place too many ads (3-4 per page max)
5. ✅ Use responsive ad units
6. ✅ Follow Google AdSense policies strictly

### AdMob
1. ✅ Use test ads during development (automatic in __DEV__)
2. ✅ Test on real devices before production
3. ✅ Don't click your own ads
4. ✅ Implement ad frequency capping
5. ✅ Handle ad loading errors gracefully
6. ✅ Follow Google AdMob policies strictly

## 🔧 Configuration Reference

### Test Mode
Both AdMob and AdSense automatically use **test ads** when:
- `__DEV__` is true (development mode)
- `testMode` prop is set to true

### AdMob Test IDs (Already Configured)
```javascript
// Banner Test ID
ca-app-pub-3940256099942544/6300978111

// App IDs in app.config.js are also test IDs
iOS: ca-app-pub-3940256099942544~1458002511
Android: ca-app-pub-3940256099942544~3347511713
```

## 📱 Complete Example

### Example 1: Home Page with AdSense Banner

**Admin Panel:**
```
Title: Home Top Banner
Type: adsense
Position: content-top
AdSense Client: ca-pub-1234567890123456
Ad Slot: 9876543210
Ad Format: auto
Targeting: 
  - Pages: home
  - Devices: desktop, tablet
Status: active
```

**Result:** AdSense ad appears at top of home page on web

### Example 2: Jobs Page with AdMob Banner

**Admin Panel:**
```
Title: Jobs Mobile Banner
Type: admob
Position: content-top
AdMob Ad Unit ID: ca-app-pub-1234567890123456/1234567890
Ad Size: banner
Targeting:
  - Pages: jobs
  - Devices: mobile
Status: active
```

**Result:** AdMob ad appears at top of jobs page on mobile

### Example 3: Mixed Strategy

Create multiple ads with same position but different targeting:

**Ad 1 (Web):**
- Type: adsense
- Position: content-top
- Target: desktop, tablet

**Ad 2 (Mobile):**
- Type: admob
- Position: content-top
- Target: mobile

**Result:** Web users see AdSense, mobile users see AdMob, all at the same position!

## 🧪 Testing Checklist

### AdSense Testing
- [ ] Ad appears on web browser
- [ ] Ad loads within 2-3 seconds
- [ ] Ad is responsive to window size
- [ ] No console errors
- [ ] Impressions counted in admin panel
- [ ] Ad changes on page refresh (if multiple ads)
- [ ] Ad respects targeting rules

### AdMob Testing
- [ ] Ad appears on mobile device/emulator
- [ ] Test ad shows in development mode
- [ ] Ad loads without errors
- [ ] Ad size is correct
- [ ] No app crashes
- [ ] Impressions counted in admin panel
- [ ] Ad respects targeting rules

## 🐛 Troubleshooting

### AdSense Issues

**Issue: "Ad slot not found"**
```
Solution: 
1. Check Client ID format: ca-pub-XXXXXXXXXXXXXXXX
2. Check Slot ID is correct
3. Verify AdSense account is approved
4. Wait a few hours after creating ad unit
```

**Issue: "No ads showing"**
```
Solution:
1. Disable ad blockers
2. Check browser console for errors
3. Verify site is approved in AdSense
4. Check ad targeting (must include 'desktop' or 'tablet')
```

**Issue: "Ads blocked by browser"**
```
Solution:
1. Some browsers block ads by default
2. Test in different browsers
3. Check browser's ad blocker settings
4. This is normal user behavior - ads may be blocked
```

### AdMob Issues

**Issue: "AdMob not showing"**
```
Solution:
1. Verify app is built (not just Expo Go)
2. Check app.config.js has correct App ID
3. Verify Ad Unit ID is correct
4. Check ad targeting (must include 'mobile')
5. Test on real device (not always reliable on emulator)
```

**Issue: "Ad failed to load"**
```
Solution:
1. Check internet connection
2. Verify Ad Unit ID format
3. In production, ensure app is published
4. Check AdMob account status
5. Review error message in console
```

**Issue: "No fill" error**
```
Solution:
1. Normal for test ads sometimes
2. In production, may indicate low ad inventory
3. Try different ad sizes
4. Check your AdMob account settings
```

## 📊 Monitoring Performance

### In Admin Panel

1. Go to **Advertisement Management**
2. Each ad card shows:
   - **Impressions**: How many times displayed
   - **Clicks**: How many times clicked
   - **CTR**: Click-through rate

3. Click **Edit** on any ad
4. Go to **Performance** tab for detailed metrics

### In Google Dashboards

**AdSense:**
- Visit https://www.google.com/adsense
- View detailed reports
- Check earnings
- Monitor performance

**AdMob:**
- Visit https://apps.admob.com
- View app performance
- Check revenue
- Monitor ad requests

## 🔐 Security & Compliance

### Important Rules

1. **Never click your own ads** - This violates Google policies
2. **Don't encourage clicks** - No "Click here" near ads
3. **Content quality** - Maintain good content quality
4. **Policy compliance** - Follow all Google policies
5. **Privacy** - Comply with GDPR, CCPA, etc.

### Required Disclosures

Add to your Privacy Policy:
```
We use Google AdSense/AdMob for advertising. 
Google may use cookies to serve ads based on user behavior.
Users can opt out of personalized advertising at:
https://www.google.com/settings/ads
```

## 💰 Monetization Tips

### Optimize Ad Placement
1. **Above the fold**: Place one ad in visible area
2. **In content**: Place ads naturally within content
3. **Spacing**: Don't overcrowd with ads
4. **Mobile**: Use smart banners for better fill rate

### Improve CTR
1. Use responsive ad units
2. Place ads where users naturally look
3. Match ad styles to your site (if using native ads)
4. A/B test different positions
5. Monitor performance regularly

### Revenue Optimization
1. Enable auto ads (for AdSense)
2. Use multiple ad sizes
3. Target high-value locations
4. Optimize content for high-paying keywords
5. Increase traffic

## 📈 Advanced Features

### Dynamic Ad Rotation

The system already supports showing different ads to different users:

```
Create multiple ads with:
- Same position
- Different priorities
- Different targeting

Result: System automatically rotates ads
```

### A/B Testing

1. Create two versions of same ad
2. Set same position and targeting
3. Monitor performance metrics
4. Keep the better performing one

### Seasonal Campaigns

1. Create seasonal ad
2. Set schedule dates:
   ```
   Start: 2024-12-01
   End: 2024-12-31
   ```
3. Ad automatically shows only during that period

## 🎓 Training Resources

### For Admins
1. Read this guide completely
2. Create test ads first
3. Monitor performance daily
4. Adjust based on metrics
5. Follow Google policies

### For Developers
1. Review component code
2. Understand the flow
3. Test on multiple devices
4. Handle errors gracefully
5. Monitor console logs

## 📞 Support Resources

### Google AdSense
- Help Center: https://support.google.com/adsense
- Policies: https://support.google.com/adsense/answer/48182
- Community: https://support.google.com/adsense/community

### Google AdMob
- Help Center: https://support.google.com/admob
- Policies: https://support.google.com/admob/answer/6128543
- Community: https://groups.google.com/g/google-admob-ads-sdk

### JobWala Support
- Main Documentation: `ADVERTISEMENT_MANAGEMENT_README.md`
- Quick Start: `ADVERTISEMENT_QUICK_START.md`
- Implementation: `ADVERTISEMENT_IMPLEMENTATION_SUMMARY.md`

## ✨ Summary

You now have **fully integrated, fully dynamic** AdMob and AdSense support:

✅ **AdMob**: Real library integrated, test ads working, production ready  
✅ **AdSense**: Dynamic script loading, responsive ads, web optimized  
✅ **Admin Control**: Create, manage, target ads from admin panel  
✅ **Automatic Tracking**: Impressions and clicks tracked automatically  
✅ **Platform Smart**: Shows right ad type on right platform  
✅ **Developer Friendly**: Test mode, error handling, logging  

## 🚀 Next Steps

1. **Get Google Accounts**: Sign up for AdSense and/or AdMob
2. **Get Approved**: Wait for account approval
3. **Create Ad Units**: Get your Client/Unit IDs
4. **Update App Config**: Replace test IDs with real ones
5. **Create Ads**: Use admin panel to create advertisements
6. **Test Thoroughly**: Test on web and mobile
7. **Launch**: Set status to 'active'
8. **Monitor**: Check performance regularly

---

**Status: ✅ FULLY INTEGRATED AND PRODUCTION READY**

**Last Updated:** October 30, 2025  
**Version:** 2.0.0 - Full AdMob & AdSense Integration

