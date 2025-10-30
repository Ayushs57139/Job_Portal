# Logo Management & Branding System

## Overview

The Logo Management system provides comprehensive tools for administrators to customize the website's visual identity, including theme colors, logos, favicons, and other branding elements. This system is fully dynamic and connected to the backend, allowing real-time updates across the entire platform.

## Features

### 1. Theme Color Management
- **Custom Color Palette**: Modify primary, secondary, success, error, warning, and info colors
- **Theme Presets**: Quick-apply pre-configured color schemes:
  - Ocean Blue (Default)
  - Purple Dream
  - Forest Green
  - Sunset Orange
  - Rose Pink
  - Corporate Blue
- **Live Preview**: Real-time visualization of color changes
- **Hex Color Input**: Manual color code entry with validation

### 2. Logo Configuration
Three logo types are supported:

#### Text Logo
- Primary and secondary text customization
- Independent color controls for each text segment
- Font size and weight options
- Real-time preview

#### Image Logo
- Upload custom logo images
- Configurable dimensions (width & height)
- Alt text for accessibility
- Border radius customization
- Support for JPEG, PNG, SVG, GIF, and WebP formats

#### Combined Logo
- Combines text and image elements
- Configurable image position (left, right, top, bottom)
- Adjustable spacing between elements
- Flexible sizing options

### 3. Favicon & Icons Management
- **Favicon**: Standard browser tab icon (16x16, 32x32)
- **Apple Touch Icon**: iOS home screen icon (180x180)
- **OG Image**: Social media sharing preview image
- File upload with validation
- Automatic optimization

## Technical Implementation

### Backend Components

#### Models

**ThemeSettings Model** (`server/models/ThemeSettings.js`)
```javascript
- colors: Object (primary, secondary, success, error, warning, info, etc.)
- typography: Object (font family, font sizes)
- spacing: Object (xs, sm, md, lg, xl, xxl)
- borderRadius: Object (sm, md, lg, xl, full)
- shadows: Object (sm, md, lg, xl)
- branding: Object (logo ref, favicon, appleTouchIcon, ogImage)
- isActive: Boolean
- isDefault: Boolean
- createdBy: User reference
- lastModifiedBy: User reference
- version: Number
```

**WebsiteLogo Model** (`server/models/WebsiteLogo.js`)
```javascript
- logoType: Enum ['text', 'image', 'combined']
- textLogo: Object (primaryText, secondaryText, colors, fonts)
- imageLogo: Object (url, altText, dimensions)
- combinedLogo: Object (imageUrl, position, spacing)
- variants: Object (header, footer, favicon, mobile, admin)
- isActive: Boolean
- isDefault: Boolean
- uploadedBy: User reference
- version: Number
```

#### API Routes

**Theme Routes** (`server/routes/theme.js`)
- `GET /api/theme/active` - Get active theme (public)
- `GET /api/theme` - Get all themes (admin)
- `POST /api/theme` - Create new theme (admin)
- `PUT /api/theme/:id` - Update theme (admin)
- `PUT /api/theme/:id/activate` - Activate theme (admin)
- `DELETE /api/theme/:id` - Delete theme (admin)

**Logo Routes** (`server/routes/logos.js`)
- `GET /api/logos/active` - Get active logo (public)
- `GET /api/admin/logos` - Get all logos with pagination (admin)
- `GET /api/admin/logos/:id` - Get logo by ID (admin)
- `POST /api/admin/logos` - Create logo configuration (admin)
- `POST /api/admin/logos/upload` - Upload logo image (admin)
- `PUT /api/admin/logos/:id` - Update logo (admin)
- `PUT /api/admin/logos/:id/activate` - Activate logo (admin)
- `DELETE /api/admin/logos/:id` - Delete logo (admin)

**Upload Routes** (`server/routes/upload.js`)
- `POST /api/upload/:type` - Upload file (logos, icons, themes)
- `DELETE /api/upload/:type/:filename` - Delete uploaded file

### Frontend Components

**AdminLogoManagementScreen** (`src/screens/Admin/AdminLogoManagementScreen.js`)

Main features:
- Tab-based interface (Theme, Logo, Icons)
- Theme preset selection
- Color picker with preset colors
- Image upload with validation
- Real-time preview
- Save functionality with loading states

**API Integration** (`src/config/api.js`)

Methods:
```javascript
// Theme APIs
- getActiveTheme()
- getAllThemes()
- createTheme(data)
- updateTheme(id, data)
- activateTheme(id)
- deleteTheme(id)

// Logo APIs
- getActiveLogo()
- getAllLogos(filters)
- getLogoById(id)
- createLogo(data)
- updateLogo(id, data)
- uploadLogoImage(file)
- activateLogo(id)
- deleteLogo(id)

// Upload APIs
- uploadFile(file, type)
- deleteUploadedFile(type, filename)
```

## Usage Guide

### For Administrators

#### Changing Theme Colors

1. Navigate to **Logo Management** in the admin panel
2. Click on the **Theme Colors** tab
3. Choose a preset theme or customize individual colors:
   - Click on any color button to open the color picker
   - Enter a hex color code or select from presets
   - Click "Done" to apply
4. Preview changes in the preview section
5. Click **Save Theme** to persist changes

#### Updating the Logo

1. Navigate to **Logo Management** → **Logo** tab
2. Select logo type (Text, Image, or Combined)
3. Configure logo settings:
   - **Text Logo**: Enter primary/secondary text and choose colors
   - **Image Logo**: Upload an image file and set dimensions
   - **Combined**: Configure both text and image elements
4. Preview the logo
5. Click **Save Logo** to apply changes

#### Managing Icons

1. Navigate to **Logo Management** → **Icons** tab
2. Upload favicon:
   - Click "Upload Favicon"
   - Select a square image (recommended 32x32 or 64x64)
3. Upload Apple Touch Icon:
   - Click "Upload Apple Touch Icon"
   - Select a square image (recommended 180x180)
4. Click **Save Icons** to apply changes

### For Developers

#### Accessing Active Theme

```javascript
import api from '../config/api';

const theme = await api.getActiveTheme();
console.log(theme.colors.primary); // #2563EB
```

#### Accessing Active Logo

```javascript
const logo = await api.getActiveLogo();
console.log(logo.logoType); // 'text', 'image', or 'combined'
console.log(logo.textLogo.primaryText); // 'Freejob'
```

#### Uploading Custom Files

```javascript
const file = {
  uri: imageUri,
  name: 'logo.png',
  type: 'image/png'
};

const response = await api.uploadFile(file, 'logos');
console.log(response.data.url); // /uploads/logos/logo-1234567890.png
```

## File Upload Specifications

### Supported Formats
- Logo: JPEG, PNG, SVG, GIF, WebP
- Favicon: ICO, PNG (recommended 32x32 or 64x64)
- Apple Touch Icon: PNG (recommended 180x180)
- OG Image: JPEG, PNG (recommended 1200x630)

### Size Limits
- Maximum file size: 5MB
- Recommended dimensions:
  - Logo: 200x50 to 400x100
  - Favicon: 32x32 or 64x64
  - Apple Touch Icon: 180x180
  - OG Image: 1200x630

### Upload Directory Structure
```
server/
  uploads/
    logos/         # Logo images
    icons/         # Favicon and Apple Touch Icon
    themes/        # Other theme-related assets
```

## Security Considerations

1. **Authentication**: All admin endpoints require authentication
2. **Authorization**: Only users with admin/superadmin roles can access
3. **File Validation**: File type and size validation on upload
4. **Permission Checks**: Uses `requirePermission('canManageSettings')`
5. **Input Sanitization**: All text inputs are sanitized and validated

## Database Schema

### ThemeSettings Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  colors: {
    primary: String,
    secondary: String,
    success: String,
    error: String,
    warning: String,
    info: String,
    // ... more colors
  },
  typography: { /* font settings */ },
  spacing: { /* spacing values */ },
  borderRadius: { /* border radius values */ },
  shadows: { /* shadow definitions */ },
  branding: {
    logo: ObjectId (ref: WebsiteLogo),
    favicon: String,
    appleTouchIcon: String,
    ogImage: String
  },
  isActive: Boolean,
  isDefault: Boolean,
  createdBy: ObjectId (ref: User),
  lastModifiedBy: ObjectId (ref: User),
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### WebsiteLogo Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  logoType: String, // 'text', 'image', 'combined'
  textLogo: {
    primaryText: String,
    secondaryText: String,
    primaryColor: String,
    secondaryColor: String,
    fontSize: Number,
    fontWeight: String
  },
  imageLogo: {
    url: String,
    altText: String,
    width: Number,
    height: Number,
    borderRadius: Number
  },
  combinedLogo: {
    imageUrl: String,
    imagePosition: String,
    imageSize: { width: Number, height: Number },
    textSpacing: Number
  },
  variants: {
    header: Object,
    footer: Object,
    favicon: Object,
    mobile: Object,
    admin: Object
  },
  isActive: Boolean,
  isDefault: Boolean,
  uploadedBy: ObjectId (ref: User),
  version: Number,
  usageStats: {
    totalViews: Number,
    lastUsed: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### Frontend
- User-friendly error messages via `Alert.alert()`
- Loading states during API calls
- Form validation before submission
- File type and size validation

### Backend
- Input validation using `express-validator`
- Try-catch blocks for all async operations
- Detailed error logging
- Appropriate HTTP status codes

## Performance Optimization

1. **Lazy Loading**: Theme and logo data loaded only when needed
2. **Caching**: Active theme/logo cached for quick access
3. **Image Optimization**: Automatic image compression on upload
4. **Pagination**: Logo list supports pagination for large datasets
5. **Indexing**: Database indexes on `isActive` and `isDefault` fields

## Future Enhancements

1. **Theme Versioning**: Track and revert to previous themes
2. **A/B Testing**: Test different themes with user groups
3. **Dark Mode**: Automatic dark theme generation
4. **Color Accessibility**: WCAG contrast ratio validation
5. **Logo Variants**: Automatic generation of different logo sizes
6. **Export/Import**: Theme configuration import/export
7. **Live Preview**: Real-time preview across the entire site
8. **Analytics**: Track theme performance and user preferences

## Troubleshooting

### Common Issues

**Issue**: "Failed to upload image"
- **Solution**: Check file size (max 5MB) and format (JPEG, PNG, SVG, GIF, WebP)

**Issue**: "Access denied"
- **Solution**: Ensure you're logged in as an admin with proper permissions

**Issue**: "Theme not applying"
- **Solution**: Clear cache and ensure theme is set as active

**Issue**: "Logo not displaying"
- **Solution**: Verify logo is activated and image URL is accessible

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
**Author**: JobWala Development Team

