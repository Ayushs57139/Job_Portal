# Job Events Management System - Implementation Plan

## Overview
A comprehensive Job Events Management System for both admin panel and main website, allowing admins to create, manage, and monitor job-related events (job fairs, recruitment drives, career workshops, etc.) with full filtering and statistics capabilities.

## Features Required

### Admin Panel Features

#### 1. Job Events Dashboard
- **Statistics Cards:**
  - All Job Events
  - Upcoming Job Events
  - Completed Job Events
  - Ongoing Job Events
  - Active Job Events
  - Closed Job Events
  - Job Events By Companies
  - Job Events By Consultancies

#### 2. Filtering System
- **Status Filters:**
  - All
  - Upcoming
  - Completed
  - Ongoing
  - Active
  - Closed

- **Organizer Filters:**
  - All
  - By Companies
  - By Consultancies

- **Date Filters:**
  - Last 24 Hours
  - Last 7 Days
  - Last 14 Days
  - Last 30 Days
  - Last 90 Days
  - Last 120 Days
  - Last 6 Months
  - Last 9 Months
  - Last 12 Months
  - Custom Date Range

#### 3. Event Management
- Create new job events
- Edit existing events
- Delete events
- Change event status
- View event details
- View registrations
- Export attendee lists

#### 4. Event Form Fields
- Title
- Description
- Event Type (Job Fair, Recruitment Drive, Career Workshop, Networking Event, etc.)
- Start Date & Time
- End Date & Time
- Venue/Location
- Address (Full address, City, State, Country)
- Organizer Type (Company/Consultancy)
- Organizer Details
- Contact Information (Email, Phone)
- Registration Settings
  - Registration Required (Yes/No)
  - Registration Deadline
  - Max Participants
- Event Link (Virtual event URL)
- Banner Image
- Tags/Keywords
- Status (Active, Closed, Cancelled)

### Main Website Features

#### 1. Job Events Listing Page
- Display all active job events
- Filter by location, date, type
- Search functionality
- Sort by date, popularity
- Pagination

#### 2. Event Detail Page
- Full event information
- Registration form
- Share on social media
- Add to calendar
- Map/directions
- Related events

#### 3. Event Registration
- User registration form
- Email confirmation
- Registration management
- Attendance tracking

## Database Schema

### JobEvent Model
```javascript
{
  title: String (required),
  description: String (required),
  eventType: String (enum: ['job_fair', 'recruitment_drive', 'career_workshop', 'networking_event', 'campus_placement', 'other']),
  
  // Date & Time
  startDate: Date (required),
  endDate: Date (required),
  startTime: String,
  endTime: String,
  
  // Location
  venue: String,
  address: String,
  city: String,
  state: String,
  country: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  
  // Organizer
  organizerType: String (enum: ['company', 'consultancy', 'admin']),
  organizerId: ObjectId (ref: 'Company' or 'Consultancy'),
  organizerName: String,
  
  // Contact
  contactEmail: String,
  contactPhone: String,
  
  // Registration
  registrationRequired: Boolean (default: true),
  registrationDeadline: Date,
  maxParticipants: Number (0 = unlimited),
  currentParticipants: Number (default: 0),
  
  // Virtual Event
  isVirtual: Boolean (default: false),
  eventLink: String,
  
  // Media
  bannerImage: String,
  gallery: [String],
  
  // Additional Info
  tags: [String],
  featured: Boolean (default: false),
  
  // Status
  status: String (enum: ['active', 'closed', 'cancelled', 'completed']),
  
  // Metadata
  views: Number (default: 0),
  registrations: Number (default: 0),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### EventRegistration Model
```javascript
{
  eventId: ObjectId (ref: 'JobEvent', required),
  userId: ObjectId (ref: 'User'),
  
  // Participant Info
  name: String (required),
  email: String (required),
  phone: String (required),
  
  // Additional Info
  company: String,
  designation: String,
  experience: String,
  resume: String,
  
  // Status
  status: String (enum: ['registered', 'confirmed', 'attended', 'cancelled']),
  registrationDate: Date (default: Date.now),
  confirmationSent: Boolean (default: false),
  attended: Boolean (default: false),
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Admin Endpoints
```
GET    /api/job-events                    - Get all events with filters
GET    /api/job-events/stats               - Get event statistics
GET    /api/job-events/:id                 - Get single event
POST   /api/job-events                     - Create new event
PUT    /api/job-events/:id                 - Update event
DELETE /api/job-events/:id                 - Delete event
PUT    /api/job-events/:id/status          - Update event status
GET    /api/job-events/:id/registrations   - Get event registrations
POST   /api/job-events/:id/export          - Export registrations
```

### Public Endpoints
```
GET    /api/job-events/public              - Get active events
GET    /api/job-events/public/:id          - Get event details
GET    /api/job-events/upcoming            - Get upcoming events
GET    /api/job-events/featured            - Get featured events
POST   /api/job-events/:id/register        - Register for event
GET    /api/job-events/:id/check-registration - Check if user registered
```

## Implementation Steps

### Phase 1: Backend Setup (Priority)
1. Create JobEvent model
2. Create EventRegistration model
3. Implement API endpoints
4. Add validation and error handling
5. Implement email notifications
6. Add file upload for banners

### Phase 2: Admin Panel
1. Create AdminJobEventsScreen component
2. Implement statistics dashboard
3. Add filtering system
4. Create event form (create/edit)
5. Implement event list with actions
6. Add event detail modal
7. Implement registration management
8. Add export functionality

### Phase 3: Main Website
1. Create JobEventsListScreen
2. Create JobEventDetailScreen
3. Implement event registration form
4. Add search and filter UI
5. Implement event cards
6. Add calendar integration
7. Implement social sharing

### Phase 4: Enhancements
1. Email notifications (registration confirmation, reminders)
2. Calendar export (ICS files)
3. QR code for check-in
4. Analytics and reporting
5. Event feedback/ratings
6. Recurring events
7. Event templates

## File Structure

### Admin Panel
```
admin/src/
├── screens/Admin/
│   └── AdminJobEventsScreen.js          (Main screen)
├── components/JobEvents/
│   ├── EventCard.js                      (Event display card)
│   ├── EventForm.js                      (Create/Edit form)
│   ├── EventDetailModal.js               (Event details)
│   ├── RegistrationList.js               (Registrations list)
│   └── EventStatistics.js                (Stats dashboard)
└── config/
    └── api.js                            (API methods - DONE)
```

### Main Website
```
src/
├── screens/
│   ├── JobEventsScreen.js                (Events listing)
│   ├── JobEventDetailScreen.js           (Event details)
│   └── EventRegistrationScreen.js        (Registration form)
├── components/JobEvents/
│   ├── EventCard.js                      (Event card)
│   ├── EventFilters.js                   (Filter component)
│   └── RegistrationForm.js               (Registration form)
└── services/
    └── jobEventsService.js               (API calls)
```

## UI/UX Design

### Admin Panel
- Tab-based interface (List / Create)
- Statistics cards at the top
- Filter bar with all options
- Event cards with quick actions
- Modal for event details
- Form with validation
- Responsive design

### Main Website
- Grid/List view toggle
- Prominent search bar
- Filter sidebar
- Event cards with images
- Detailed event page
- Registration modal/page
- Mobile-friendly design

## Status Logic

### Event Status Calculation
```javascript
function calculateEventStatus(event) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  if (event.status === 'cancelled' || event.status === 'closed') {
    return event.status;
  }
  
  if (now < startDate) {
    return 'upcoming';
  } else if (now >= startDate && now <= endDate) {
    return 'ongoing';
  } else {
    return 'completed';
  }
}
```

## Notifications

### Email Templates Needed
1. Event Created (Admin notification)
2. Registration Confirmation (User)
3. Event Reminder (24 hours before)
4. Event Cancelled (All registered users)
5. Event Updated (All registered users)
6. Registration Approved (If approval required)

## Security Considerations
- Admin-only event creation
- Input validation and sanitization
- File upload restrictions (images only)
- Rate limiting on registration
- CAPTCHA for public registration
- Email verification for registrations

## Testing Checklist
- [ ] Create event
- [ ] Edit event
- [ ] Delete event
- [ ] Change event status
- [ ] Filter by status
- [ ] Filter by organizer
- [ ] Filter by date range
- [ ] Search events
- [ ] View event details
- [ ] Register for event
- [ ] View registrations
- [ ] Export registrations
- [ ] Email notifications
- [ ] Mobile responsiveness

## Next Steps
1. Review and approve this plan
2. Set up backend models and API
3. Implement admin panel UI
4. Implement main website UI
5. Test thoroughly
6. Deploy to production

## Estimated Timeline
- Backend Setup: 2-3 days
- Admin Panel: 3-4 days
- Main Website: 3-4 days
- Testing & Refinement: 2-3 days
- **Total: 10-14 days**

## Dependencies
- React Native (Admin Panel)
- React Native Web (Main Website)
- Date picker component
- Image upload component
- Email service (for notifications)
- Map integration (optional)
