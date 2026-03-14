# 🎨 Company Labels - Visual Guide

## What You'll See

### 1. User List View

```
┌─────────────────────────────────────────────────────────────────┐
│ Name                    │ Email              │ Role    │ Actions │
├─────────────────────────────────────────────────────────────────┤
│ ABC Company             │ abc@company.com    │ EMPLOYER│ 👁 🏷️ 🗑 │
│ ⭐ Premium Company      │                    │         │         │
│ 💼 Actively Hiring      │                    │         │         │
├─────────────────────────────────────────────────────────────────┤
│ XYZ Consultancy         │ xyz@consult.com    │ EMPLOYER│ 👁 🏷️ 🗑 │
│ ✓ Verified Employer     │                    │         │         │
│ 🎗️ Featured Company     │                    │         │         │
│ 🚨 Urgent Company       │                    │         │         │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Label Badges

Each label appears as a colored badge below the company name:

**Premium Company**
```
┌──────────────────────────┐
│ ⭐ Premium Company       │  Gold background
└──────────────────────────┘
```

**Starred Company**
```
┌──────────────────────────┐
│ ⭐ Starred Company       │  Red background
└──────────────────────────┘
```

**Featured Company**
```
┌──────────────────────────┐
│ 🎗️ Featured Company      │  Blue background
└──────────────────────────┘
```

**Actively Hiring**
```
┌──────────────────────────┐
│ 💼 Actively Hiring       │  Green background
└──────────────────────────┘
```

**Urgent Company**
```
┌──────────────────────────┐
│ 🚨 Urgent Company        │  Red background
└──────────────────────────┘
```

**Verified Employer**
```
┌──────────────────────────┐
│ ✓ Verified Employer      │  Purple background
└──────────────────────────┘
```

**Top Rated**
```
┌──────────────────────────┐
│ 🏆 Top Rated             │  Orange background
└──────────────────────────┘
```

### 3. Manage Labels Button

In the Actions column, you'll see a new tag icon (🏷️):

```
Actions Column:
┌─────────────────┐
│ 👁 View         │
│ 🏷️ Manage Labels│  ← NEW!
│ 🔐 Login As     │
│ 🗑 Delete       │
└─────────────────┘
```

### 4. Label Management Modal

When you click the tag icon, this modal opens:

```
╔═══════════════════════════════════════════════════════════╗
║                  Manage Company Labels                  ✕ ║
╠═══════════════════════════════════════════════════════════╣
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ ABC Company                                         │  ║
║  │ Company                                             │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  Select Labels:                                             ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ ⭐ Premium Company                              ✓   │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ ⭐ Starred Company                                  │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ 🎗️ Featured Company                                 │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ 💼 Actively Hiring                              ✓   │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ 🚨 Urgent Company                                   │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ ✓ Verified Employer                                 │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ 🏆 Top Rated                                        │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  Preview:                                                   ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ ⭐ Premium Company  💼 Actively Hiring              │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌──────────┐  ┌────────────────────────────────────┐     ║
║  │ Cancel   │  │ ✓ Save Labels                      │     ║
║  └──────────┘  └────────────────────────────────────┘     ║
╚═══════════════════════════════════════════════════════════╝
```

## Color Scheme

### Label Colors

| Label | Primary Color | Background | Border |
|-------|--------------|------------|--------|
| Premium Company | Gold (#FFD700) | Light Gold (#FFF9E6) | Gold |
| Starred Company | Red (#FF6B6B) | Light Red (#FFE6E6) | Red |
| Featured Company | Blue (#4A90E2) | Light Blue (#E6F2FF) | Blue |
| Actively Hiring | Green (#27AE60) | Light Green (#E6F7EE) | Green |
| Urgent Company | Red (#E74C3C) | Light Red (#FFE6E6) | Red |
| Verified Employer | Purple (#9B59B6) | Light Purple (#F3E6FF) | Purple |
| Top Rated | Orange (#F39C12) | Light Orange (#FFF3E0) | Orange |

## Interactive Elements

### 1. Label Selection

**Unselected State:**
```
┌─────────────────────────────────────────────────────────┐
│ ⭐ Premium Company                                      │
└─────────────────────────────────────────────────────────┘
```

**Selected State:**
```
┌─────────────────────────────────────────────────────────┐
│ ⭐ Premium Company                                  ✓   │  ← Checkmark appears
└─────────────────────────────────────────────────────────┘
   ↑ Background changes to light color
```

### 2. Hover Effects

**Desktop Hover:**
- Background color lightens
- Slight shadow appears
- Cursor changes to pointer
- Smooth transition

**Mobile Touch:**
- Tap to select/deselect
- Visual feedback on touch
- No hover effects

## Responsive Layouts

### Desktop View (>1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ Name: ABC Company                                            │
│ Labels: ⭐ Premium  💼 Actively Hiring  🎗️ Featured         │
│                                                              │
│ Email: abc@company.com                                       │
│ Role: EMPLOYER                                               │
│ Actions: 👁 🏷️ 🔐 🗑                                         │
└──────────────────────────────────────────────────────────────┘
```

### Tablet View (768px - 1024px)

```
┌────────────────────────────────────────────┐
│ Name: ABC Company                          │
│ Labels: ⭐ Premium  💼 Actively Hiring     │
│         🎗️ Featured                        │
│                                            │
│ Email: abc@company.com                     │
│ Role: EMPLOYER                             │
│ Actions: 👁 🏷️ 🔐 🗑                       │
└────────────────────────────────────────────┘
```

### Mobile View (<768px)

```
┌──────────────────────────────┐
│ ABC Company                  │
│ ⭐ Premium Company           │
│ 💼 Actively Hiring           │
│ 🎗️ Featured Company          │
│                              │
│ abc@company.com              │
│ EMPLOYER                     │
│                              │
│ [👁 View] [🏷️ Labels]       │
│ [🔐 Login] [🗑 Delete]       │
└──────────────────────────────┘
```

## User Journey

### Step-by-Step Visual Flow

**Step 1: Navigate to Users**
```
Sidebar → Users → Companies Tab
```

**Step 2: Find Company**
```
Search or scroll to find company
```

**Step 3: Click Tag Icon**
```
Actions Column → 🏷️ (Tag Icon)
```

**Step 4: Select Labels**
```
Click on labels to select
Multiple selections allowed
Preview updates in real-time
```

**Step 5: Save**
```
Click "Save Labels" button
Modal closes
Labels appear immediately
```

**Step 6: View Result**
```
Labels visible below company name
Color-coded badges
Multiple labels in a row
```

## Badge Variations

### Single Label
```
ABC Company
⭐ Premium Company
```

### Two Labels
```
ABC Company
⭐ Premium Company  💼 Actively Hiring
```

### Three Labels
```
ABC Company
⭐ Premium Company  💼 Actively Hiring  🎗️ Featured Company
```

### Many Labels (Wraps to Next Line)
```
ABC Company
⭐ Premium Company  💼 Actively Hiring  🎗️ Featured Company
✓ Verified Employer  🏆 Top Rated
```

## Empty States

### No Labels Assigned
```
ABC Company
(No labels - just company name)
```

### No Labels Selected in Modal
```
Preview:
┌─────────────────────────────────────────┐
│ No labels selected                      │
└─────────────────────────────────────────┘
```

## Success States

### After Saving Labels
```
✓ Success
Labels updated successfully

(Modal closes, labels appear in list)
```

## Error States

### API Error
```
✗ Error
Failed to update labels
Please try again
```

### Network Error
```
✗ Error
Network connection failed
Check your internet connection
```

## Accessibility

### Screen Reader Support
- Label names are read aloud
- Button purposes are clear
- Modal is properly announced
- Keyboard navigation works

### Keyboard Navigation
- Tab through labels
- Space/Enter to select
- Escape to close modal
- Arrow keys to navigate

### Color Contrast
- All text meets WCAG AA standards
- Icons are clearly visible
- Borders provide additional context
- Not relying on color alone

## Animation & Transitions

### Modal Opening
```
Fade in (0.2s)
Smooth appearance
No jarring movements
```

### Label Selection
```
Instant feedback
Checkmark appears
Background changes
Smooth transition (0.2s)
```

### Badge Appearance
```
Fade in after save
Smooth rendering
No layout shift
```

## Best Practices

### Visual Hierarchy
1. Company name (largest, bold)
2. Labels (medium, colored)
3. Other info (smaller, gray)

### Spacing
- Consistent gaps between labels
- Proper padding in badges
- Clear separation from other elements

### Readability
- High contrast text
- Appropriate font sizes
- Clear icons
- Sufficient spacing

## Summary

The Company Labels feature provides a visually appealing and user-friendly way to categorize and highlight companies. With color-coded badges, intuitive selection interface, and responsive design, it enhances both admin experience and company visibility.

### Visual Highlights
- 🎨 7 distinct color schemes
- 🏷️ Clear badge design
- ✨ Smooth animations
- 📱 Responsive layouts
- ♿ Accessible interface

---

**Status**: ✅ Fully Implemented
**Version**: 1.0.0
**Last Updated**: March 5, 2026
