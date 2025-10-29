# "From Where You Heard About Us" - Referral Sources

## Complete List of Options

Both Company and Consultancy registration forms now include the following comprehensive list of referral sources:

### YouTube & Video Platforms
1. **Freejobwala YouTube Channel**
2. **Other YouTube Channel**
3. **YouTube Ads**
4. **YouTube**

### Traditional Media
5. **TV Ads**

### Messaging Platforms
6. **Arattai Messenger**
7. **WhatsApp**
8. **Telegram**

### Social Media Platforms
9. **LinkedIn**
10. **Facebook**
11. **Instagram**
12. **X / Twitter**
13. **Other Social Media Platform**

### Knowledge Platforms
14. **Grokipedia**
15. **Wikipedia**

### Search & Discovery
16. **Google Search**
17. **Google Play Store**
18. **Internet Searches**

### Referrals
19. **Refer By Friend**
20. **Refer By Recruiter**
21. **Refer By Job Consultancy**
22. **Refer By Another Company**

### Content Sharing
23. **Post Shared By Friend**

---

## Implementation

### How It Works:

When users click on the "From Where You Heard About Us" field:

1. A native alert dialog appears with the title "From Where You Heard About Us"
2. Users can scroll through all 23 options
3. Clicking an option selects it and closes the dialog
4. The selected option is displayed in the field
5. Users can click again to change their selection

### Technical Details:

```javascript
const sources = [
  'Freejobwala YouTube Channel',
  'Other YouTube Channel',
  'YouTube Ads',
  'YouTube',
  'TV Ads',
  'Arattai Messenger',
  'WhatsApp',
  'Telegram',
  'LinkedIn',
  'Facebook',
  'Instagram',
  'Grokipedia',
  'Wikipedia',
  'X / Twitter',
  'Google Search',
  'Google Play Store',
  'Internet Searches',
  'Refer By Friend',
  'Refer By Recruiter',
  'Post Shared By Friend',
  'Refer By Job Consultancy',
  'Refer By Another Company',
  'Other Social Media Platform',
];
```

### Files Updated:
- ✅ `src/screens/Auth/CompanyRegisterScreen.js`
- ✅ `src/screens/Auth/ConsultancyRegisterScreen.js`

---

## Usage

### For Users:

1. **Navigate** to Company or Consultancy Registration
2. **Scroll** to "From Where You Heard About Us" field
3. **Click/Tap** on the field
4. **Select** from the dropdown list
5. **Confirm** selection (auto-closes)

### For Developers:

The selected value is stored in:
```javascript
formData.heardAboutUs
```

And sent to the API as:
```javascript
{
  company: {
    heardAboutUs: 'Freejobwala YouTube Channel', // or any other option
  }
}
```

---

## Platform Behavior

### iOS:
- Shows as native iOS action sheet
- Scrollable list
- Cancel button at bottom

### Android:
- Shows as native Android alert dialog
- Scrollable list
- Cancel button

### Web:
- Shows as browser alert/dialog
- May vary by browser
- Scrollable if list is long

---

## Data Analytics

This comprehensive list helps track:
- 📊 Marketing channel effectiveness
- 📱 Social media platform performance
- 🎥 YouTube channel impact
- 👥 Referral program success
- 🔍 Search engine optimization results
- 📺 Traditional media ROI

---

## Validation

- **Required Field:** Users must select an option
- **Error Message:** "Please select an option"
- **Stored Value:** Exact text as shown in the list

---

## Testing

### Test Scenarios:

1. **Selection Test:**
   ```
   - Click field → Alert appears ✓
   - Select "LinkedIn" → Field shows "LinkedIn" ✓
   - Click field again → Can change selection ✓
   ```

2. **Validation Test:**
   ```
   - Don't select → Show error on submit ✓
   - Select option → Error clears ✓
   ```

3. **Submission Test:**
   ```
   - Select "Google Search" → Submit form
   - Check API payload → heardAboutUs: "Google Search" ✓
   ```

---

## Future Enhancements

Possible improvements:
- [ ] Add search/filter within dropdown
- [ ] Group options by category
- [ ] Add custom "Other" option with text input
- [ ] Track selection frequency
- [ ] A/B test different option orders

---

**Last Updated:** October 29, 2025
**Total Options:** 23
**Status:** ✅ Live in Production

