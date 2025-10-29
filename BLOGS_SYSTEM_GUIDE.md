# Dynamic Blogs System Guide

## Overview
The FreeJobWala blog system allows **Admin**, **Company**, and **Consultancy** users to create, edit, and delete blog posts. This guide explains the complete implementation and features.

---

## Features

### 🎯 User Roles & Permissions

#### **Admin/SuperAdmin**
- ✅ Create blogs
- ✅ Edit any blog
- ✅ Delete any blog
- ✅ Mark blogs as featured
- ✅ Publish/unpublish blogs

#### **Company**
- ✅ Create blogs
- ✅ Edit own blogs
- ✅ Delete own blogs
- ⛔ Cannot mark as featured (admin only)

#### **Consultancy**
- ✅ Create blogs
- ✅ Edit own blogs
- ✅ Delete own blogs
- ⛔ Cannot mark as featured (admin only)

#### **Job Seekers/Candidates**
- ✅ View all published blogs
- ✅ Search and filter blogs
- ⛔ Cannot create blogs

---

## Backend Implementation

### Database Model (`server/models/Blog.js`)

```javascript
{
  title: String (required, max 200 chars),
  excerpt: String (required, max 500 chars),
  content: String (required),
  category: String (required, enum),
  author: String (required),
  authorId: ObjectId (required, ref: User),
  authorType: String (required, enum: admin/company/consultancy),
  image: String (emoji/URL),
  imageUrl: String,
  readTime: String,
  tags: Array of Strings,
  featured: Boolean,
  published: Boolean,
  publishedAt: Date,
  views: Number,
  likes: Number,
  slug: String (auto-generated),
  seoTitle: String,
  seoDescription: String
}
```

### API Endpoints (`server/routes/blogs.js`)

#### Public Endpoints
- **GET** `/api/blogs` - Get all published blogs (with pagination, search, filters)
- **GET** `/api/blogs/featured` - Get featured blogs
- **GET** `/api/blogs/:id` - Get single blog by ID
- **GET** `/api/blogs/slug/:slug` - Get blog by slug

#### Protected Endpoints (Authentication Required)
- **POST** `/api/blogs` - Create new blog (admin/company/consultancy)
- **PUT** `/api/blogs/:id` - Update blog (owner or admin)
- **DELETE** `/api/blogs/:id` - Delete blog (owner or admin)
- **GET** `/api/admin/blogs` - Get all blogs including unpublished (admin only)

---

## Frontend Implementation

### Screen Components

#### 1. **BlogsScreen** (`src/screens/Blogs/BlogsScreen.js`)
Main blog listing page with:
- ✨ Beautiful gradient hero section
- 🔍 Search functionality
- 🏷️ Category filtering (10 categories)
- 📝 "Write Blog" button (visible to authorized users)
- 📱 Responsive blog cards with:
  - Category badge
  - Featured badge (if applicable)
  - Author info
  - Read time & views
  - Tags
  - Edit/Delete buttons (for blog owners)
- 🔄 Pull-to-refresh
- 📊 Results counter

**Categories Available:**
- Career Tips
- Interview Prep
- Workplace Trends
- Networking
- Resume Writing
- Job Search
- Salary Negotiation
- Industry News
- Professional Development
- Work-Life Balance

#### 2. **BlogDetailScreen** (`src/screens/Blogs/BlogDetailScreen.js`)
Individual blog view with:
- 🎨 Gradient hero with title & excerpt
- 👤 Author information with avatar
- 📅 Publication date
- ⏱️ Read time
- 👁️ View count
- 📖 Full blog content
- 🏷️ Tags display
- 🔗 Share functionality
- ✏️ Edit/Delete buttons (for owners)
- 🎯 Call-to-action section

#### 3. **CreateBlogScreen** (`src/screens/Blogs/CreateBlogScreen.js`)
Blog creation/editing form with:
- ✍️ Title input (max 200 chars)
- 📂 Category picker (dropdown)
- 📝 Excerpt input (max 500 chars)
- 📄 Content textarea (multiline)
- ⏱️ Auto-calculated read time
- 🏷️ Tags input (comma-separated)
- ✅ Publish/Draft toggle
- 💾 Real-time validation
- 📊 Character/word counters
- 👤 Author info display

---

## Styling & UI/UX

### Design System
- **Pure React Native** components (no HTML)
- **LinearGradient** for beautiful headers
- **Ionicons** for all icons
- **Responsive** layout (mobile & web)
- **Shadows & depth** effects
- **Color-coded** categories with unique gradients
- **Smooth animations** & transitions

### Color Gradients by Category
```javascript
'Career Tips': Purple gradient
'Interview Prep': Pink gradient
'Workplace Trends': Blue gradient
'Resume Writing': Green gradient
'Job Search': Orange-yellow gradient
'Industry News': Teal gradient
// ...and more
```

---

## Usage Instructions

### For Admins/Companies/Consultancies

#### Creating a Blog:
1. Navigate to **Blogs** page
2. Click **"Write Blog"** button
3. Fill in all required fields:
   - Title (max 200 chars)
   - Category (select from dropdown)
   - Excerpt (max 500 chars)
   - Content (full article)
   - Tags (optional, comma-separated)
4. Toggle **"Publish immediately"** (or save as draft)
5. Click **"Publish Blog"**

#### Editing a Blog:
1. Open the blog you want to edit
2. Click the **edit icon** (pencil)
3. Update the fields
4. Click **"Update Blog"**

#### Deleting a Blog:
1. Open the blog or from the list view
2. Click the **trash icon**
3. Confirm deletion

### For All Users

#### Viewing Blogs:
1. Navigate to **Blogs** page
2. Browse all published blogs
3. Use **search** to find specific topics
4. Filter by **category**
5. Click any blog card to read full article

#### Sharing Blogs:
1. Open a blog detail page
2. Click the **share icon**
3. Share via your preferred method

---

## Features Highlight

### 🎨 Beautiful UI
- Gradient headers with category-specific colors
- Card-based layout with shadows
- Professional typography
- Responsive design

### 🔍 Search & Filter
- Real-time search across title, excerpt, and content
- Category filtering
- Featured blogs filter

### 👥 Author Management
- Automatic author name from user profile
- Author type badge (Admin/Company/Consultancy)
- Author-specific permissions

### 📊 Analytics
- View counter (auto-increments)
- Read time calculation
- Engagement metrics ready

### 🏷️ Tagging System
- Flexible tag input
- Tag display on cards
- Tag-based filtering (can be added)

### 📱 Mobile-First
- Smooth scrolling
- Pull-to-refresh
- Touch-optimized buttons
- Keyboard-aware forms

---

## Testing the System

### Test Scenarios:

1. **As Admin:**
   - ✅ Create a blog and mark it as featured
   - ✅ Edit any blog
   - ✅ Delete any blog

2. **As Company:**
   - ✅ Create a blog (cannot mark as featured)
   - ✅ Edit your own blog
   - ✅ Delete your own blog
   - ⛔ Cannot edit other's blogs

3. **As Consultancy:**
   - ✅ Create a blog
   - ✅ Edit your own blog
   - ✅ Delete your own blog
   - ⛔ Cannot edit other's blogs

4. **As Job Seeker:**
   - ✅ View all published blogs
   - ✅ Search and filter blogs
   - ⛔ No "Write Blog" button visible

---

## API Integration

### Example API Calls:

#### Get All Blogs:
```javascript
const response = await api.get('/api/blogs', {
  params: {
    page: 1,
    limit: 20,
    category: 'Career Tips',
    search: 'interview',
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  }
});
```

#### Create Blog:
```javascript
const blogData = {
  title: 'How to Ace Your Next Interview',
  excerpt: 'Learn the top 10 tips for interview success',
  content: 'Full blog content here...',
  category: 'Interview Prep',
  readTime: '5 min read',
  tags: ['interview', 'career', 'tips'],
  published: true
};

const response = await api.post('/api/blogs', blogData);
```

#### Update Blog:
```javascript
const response = await api.put(`/api/blogs/${blogId}`, updatedData);
```

#### Delete Blog:
```javascript
const response = await api.delete(`/api/blogs/${blogId}`);
```

---

## Database Migration

If you have existing blogs without `authorId` and `authorType`, you need to update them:

```javascript
// Run this migration in MongoDB
db.blogs.updateMany(
  { authorId: { $exists: false } },
  { 
    $set: { 
      authorId: ObjectId("ADMIN_USER_ID"),
      authorType: "admin"
    } 
  }
);
```

---

## Future Enhancements

### Potential Features:
- 📝 Rich text editor (WYSIWYG)
- 🖼️ Image upload for blog covers
- 💬 Comments system
- ❤️ Like/reaction system
- 🔖 Bookmark blogs
- 📧 Email notifications for new blogs
- 📱 Push notifications
- 📈 Advanced analytics dashboard
- 🔗 Social media auto-posting
- 🎯 Related blogs suggestions
- 👥 Author profiles
- 📊 Blog performance metrics

---

## Troubleshooting

### Common Issues:

**1. "Access denied" when creating blog:**
- Ensure user is logged in
- Check user type (must be admin/company/consultancy)

**2. Cannot edit blog:**
- Verify you're the blog owner or admin
- Check authentication token

**3. Blogs not loading:**
- Check API connection
- Verify backend server is running
- Check for console errors

**4. Search not working:**
- Ensure text indexes are created in MongoDB
- Run: `db.blogs.createIndex({ title: "text", excerpt: "text", content: "text" })`

---

## Technical Stack

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- RESTful API

### Frontend:
- React Native
- Expo
- React Navigation
- AsyncStorage
- Axios (via api.js)
- LinearGradient
- Ionicons

---

## Conclusion

The FreeJobWala blog system is now fully functional with:
✅ Multi-user role support
✅ Complete CRUD operations
✅ Beautiful, responsive UI
✅ Search & filtering
✅ Permission management
✅ Pure React Native implementation

The system is production-ready and can be extended with additional features as needed!

