# Live Chat Support - Quick Start Guide

## 🚀 Getting Started

This guide will help you quickly test and use the new Live Chat Support feature.

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. MongoDB connected
3. At least one user account of each type:
   - Job Seeker
   - Company
   - Consultancy  
   - Admin/Super Admin

## Testing the Feature

### 1. Start the Application

```bash
# Terminal 1: Start Backend Server
cd server
npm start

# Terminal 2: Start React Native App
npm start
```

### 2. Test as Job Seeker

1. **Login** as a Job Seeker
2. Navigate to **User Dashboard**
3. Click **"Messages"** button
4. You'll see the Live Chat Support screen
5. Click the **blue "+"** button to start a new chat
6. Click **"Contact Support"** to chat with admin
7. Or search for companies/consultancies to chat with

### 3. Test as Company/Consultancy

1. **Login** as Company or Consultancy
2. Navigate to **Company/Consultancy Dashboard**
3. Click **"Messages"** button
4. View conversations with job seekers
5. Click **"+"** to start new conversations
6. Click **help icon** to quickly contact support

### 4. Test as Admin

1. **Login** as Admin
2. Navigate to **Admin Dashboard**
3. Click **"Live Chat Support"** button
4. You'll see all conversations from all users
5. Use the **search bar** to find specific conversations
6. Click the **filter icon** to filter by user type:
   - All Conversations
   - Job Seekers only
   - Companies only
   - Consultancies only
7. Click **"+"** to start new support conversations

## Key Features to Test

### ✅ Search Functionality (Admin)
- Type in the search bar
- Search by user name, message content, or subject
- Results update in real-time

### ✅ Filter Functionality (Admin)
- Click the filter button
- Select different user types
- Notice the blue highlight when filter is active
- Click outside to close modal

### ✅ Starting New Conversations
1. Click the **"+"** button
2. Type in the search field to find users
3. Click on a user to start chatting
4. Conversation opens immediately

### ✅ Real-Time Messaging
1. Open a conversation
2. Type a message
3. Click send (paper airplane icon)
4. Message appears immediately
5. Open same conversation on another device/account
6. Messages appear within 5 seconds

### ✅ Unread Indicators
- Unread conversations have a **light blue background**
- **Red dot** on avatar indicates unread messages
- Badge disappears when you open the conversation

## Navigation Paths

### Job Seeker Flow:
```
Login → User Dashboard → Messages → [Conversation List] → Click Conversation → Chat
```

### Company/Consultancy Flow:
```
Login → Company Dashboard → Messages → [Conversation List] → Click Conversation → Chat
```

### Admin Flow:
```
Login → Admin Dashboard → Live Chat Support → [All Conversations] → Click Conversation → Chat
```

### Alternative Admin Access:
```
Admin Panel → Sidebar → Live Chat Support → [Search & Filter] → Click Conversation → Chat
```

## Common Use Cases

### 1. Job Seeker Contacting Support
```
Job Seeker Dashboard → Messages → Contact Support Button → Type Message → Send
```

### 2. Admin Helping a User
```
Admin Panel → Live Chat Support → Search User Name → Click Conversation → Respond
```

### 3. Company Chatting with Candidate
```
Company Dashboard → Messages → + Button → Search Candidate → Click → Chat
```

### 4. Finding Specific Conversations (Admin)
```
Admin Live Chat → Filter Button → Select "Job Seekers" → Search "John" → View Results
```

## UI Elements Explained

### Conversation List Item:
```
┌─────────────────────────────────────┐
│ [Avatar] Name               2h ago  │
│          Job Seeker                 │
│          Last message preview...    │
└─────────────────────────────────────┘
```

### Admin Search Bar:
```
┌──────────────────────────────────────────┐
│ [🔍] Search conversations...  [Filter] [+]│
└──────────────────────────────────────────┘
```

### Chat Interface:
```
┌──────────────────────────────────────────┐
│ ← Chat with John Doe                     │
├──────────────────────────────────────────┤
│                                          │
│  [Avatar] John Doe                       │
│  Hello, I need help    11:30 AM          │
│                                          │
│              How can I help? 11:32 AM    │
│                                  [✓✓]    │
│                                          │
├──────────────────────────────────────────┤
│ [Type a message...]              [Send] │
└──────────────────────────────────────────┘
```

## Troubleshooting

### Issue: No conversations showing
**Solution**: 
- Check if backend is running
- Verify MongoDB connection
- Try pull-to-refresh

### Issue: Messages not sending
**Solution**:
- Check internet connection
- Verify user is authenticated
- Check console for errors

### Issue: Can't find a user to chat with
**Solution**:
- Make sure users exist in database
- Check user type permissions
- Try refreshing the user list

### Issue: Search not working
**Solution**:
- Type at least 2-3 characters
- Case-insensitive search is enabled
- Clear search and try again

### Issue: Filter not showing results
**Solution**:
- Make sure conversations exist for that user type
- Try "All Conversations" filter
- Pull to refresh

## Testing Checklist

Use this checklist to verify all features:

- [ ] Job Seeker can access Messages from dashboard
- [ ] Company can access Messages from dashboard  
- [ ] Consultancy can access Messages from dashboard
- [ ] Admin can access Live Chat Support
- [ ] Search works in Admin panel
- [ ] Filter works in Admin panel (all 4 types)
- [ ] Can start new conversation as Job Seeker
- [ ] Can start new conversation as Company
- [ ] Can start new conversation as Admin
- [ ] Messages send successfully
- [ ] Messages appear in real-time
- [ ] Unread indicators work
- [ ] Timestamps show correctly
- [ ] Date separators appear
- [ ] Pull-to-refresh works
- [ ] Empty states show when no conversations
- [ ] Modal closes when clicking outside
- [ ] Back button works from chat screen

## Performance Notes

- Auto-refresh interval: **5 seconds**
- Message character limit: **2000 characters**
- Pagination: **50 messages per page**
- Search: **Real-time as you type**

## API Endpoints Used

```
GET    /api/chat/conversations
GET    /api/chat/conversations/:id
GET    /api/chat/conversations/:id/messages
POST   /api/chat/conversations/:id/messages
POST   /api/chat/conversations
GET    /api/chat/chat-partners
PUT    /api/chat/conversations/:id/read
GET    /api/chat/rooms
POST   /api/chat/rooms
```

## Support Contact

For issues or questions:
1. Check the `LIVE_CHAT_IMPLEMENTATION_SUMMARY.md` file
2. Review console logs for errors
3. Verify all backend routes are active
4. Check user authentication tokens

---

**Happy Chatting!** 💬

The live chat system is now fully functional and ready to use across all panels!

