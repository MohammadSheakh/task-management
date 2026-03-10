# Notification & TaskReminder Modules - Role-Based Access Control Mapping

## Overview

This document defines the role-based access control (RBAC) for all notification and task reminder endpoints in the Task Management system. These modules handle multi-channel notifications and task reminders.

---

## Module Purpose

### Notification Module
Manages user notifications across multiple channels:
- In-app notifications
- Email notifications
- Push notifications
- SMS notifications
- Live activity feed for groups

### TaskReminder Module
Manages task reminders:
- One-time reminders
- Recurring reminders (daily, weekly, monthly)
- Deadline-based reminders
- Custom time reminders

---

## Role Definitions

| Role | Description | Dashboard | Access Level |
|------|-------------|-----------|--------------|
| `business` | Group owners, parents, teachers | Teacher/Parent Dashboard | Full notification & reminder management |
| `child` | Group members, children | Mobile App (Child Interface) | Personal notifications & reminders |
| `admin` | System administrators | Main Admin Dashboard | System-wide notifications |

---

## Notification Module Routes

### Personal Notification Management

#### 1. Get My Notifications
```
GET /notifications/my
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Get paginated personal notifications |

**Query Parameters:**
- `status` - Filter by status (unread, read)
- `type` - Filter by type (task, group, system, reminder)
- `priority` - Filter by priority (low, normal, high, urgent)
- `page`, `limit`, `sortBy` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notif123",
        "title": "Task Assigned",
        "subTitle": "Math Homework",
        "type": "assignment",
        "priority": "normal",
        "status": "unread",
        "createdAt": "2026-03-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

---

#### 2. Get Unread Count
```
GET /notifications/unread-count
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Get count of unread notifications for badge display |

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

#### 3. Mark as Read
```
POST /notifications/:id/read
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Mark a single notification as read |

---

#### 4. Mark All as Read
```
POST /notifications/read-all
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Mark all notifications as read |

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 15
  },
  "message": "All 15 notifications marked as read"
}
```

---

#### 5. Delete Notification
```
DELETE /notifications/:id
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Delete a single notification |

---

### Admin Notification Management

#### 6. Send Bulk Notification
```
POST /notifications/bulk
```
| Attribute | Value |
|-----------|-------|
| **Role** | `admin` |
| **Auth** | `TRole.admin` |
| **Figma** | `dashboard-section-flow.png` |
| **Rate Limit** | 10 requests per minute |
| **Description** | Send system-wide or targeted notifications |

**Request Body:**
```json
{
  "userIds": ["user123", "user456"],
  "receiverRole": "business",
  "title": "System Maintenance",
  "subTitle": "Scheduled downtime at 2 AM",
  "type": "system",
  "priority": "high",
  "channels": ["in_app", "email"],
  "linkFor": "/announcements",
  "linkId": "announce123",
  "data": {
    "maintenanceTime": "2026-03-11T02:00:00.000Z"
  }
}
```

**Business Logic:**
- Can target specific users OR role-based audience
- Queues notifications via BullMQ for async delivery
- Supports multi-channel delivery

---

#### 7. Schedule Reminder
```
POST /notifications/schedule-reminder
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 10 requests per minute |
| **Description** | Schedule a task reminder |

**Request Body:**
```json
{
  "taskId": "task123",
  "reminderTime": "2026-03-11T08:00:00.000Z",
  "reminderType": "before_deadline",
  "message": "Don't forget to complete your math homework!"
}
```

---

### Live Activity Feed

#### 8. Get Live Activity Feed
```
GET /notifications/activity-feed/:groupId
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Real-time feed of group member activities |

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "activity123",
        "type": "task_completed",
        "message": "John completed Math Homework",
        "userId": {
          "_id": "user456",
          "name": "John Doe",
          "profileImage": "https://..."
        },
        "taskId": "task789",
        "timestamp": "2026-03-10T10:30:00.000Z"
      }
    ]
  }
}
```

**Use Case:** Dashboard live feed showing team member completions

---

## TaskReminder Module Routes

### Reminder Management

#### 1. Create Task Reminder
```
POST /task-reminders/
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `edit-update-task-flow.png` |
| **Rate Limit** | 10 requests per minute |
| **Description** | Create a reminder for a task |

**Request Body:**
```json
{
  "taskId": "task123",
  "reminderTime": "2026-03-11T08:00:00.000Z",
  "triggerType": "before_deadline",
  "frequency": "once",
  "customMessage": "Remember to complete your task!",
  "channels": ["in_app", "push"]
}
```

**Trigger Types:**
- `before_deadline` - Reminder before task deadline
- `at_deadline` - Reminder at deadline time
- `after_deadline` - Reminder if task not completed after deadline
- `custom_time` - Reminder at specific custom time
- `recurring` - Recurring reminder

**Frequency Options:**
- `once` - Single reminder
- `daily` - Daily reminder
- `weekly` - Weekly reminder
- `monthly` - Monthly reminder

---

#### 2. Get Reminders for Task
```
GET /task-reminders/task/:id
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `edit-update-task-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Get all reminders for a specific task |

**Response:**
```json
{
  "success": true,
  "data": {
    "reminders": [
      {
        "_id": "reminder123",
        "taskId": "task456",
        "userId": "user789",
        "reminderTime": "2026-03-11T08:00:00.000Z",
        "triggerType": "before_deadline",
        "frequency": "once",
        "status": "pending",
        "customMessage": "Don't forget!"
      }
    ]
  }
}
```

---

#### 3. Get My Reminders
```
GET /task-reminders/my
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Get all reminders for the authenticated user |

**Query Parameters:**
- `status` - Filter by status (pending, completed, cancelled)
- `frequency` - Filter by frequency
- `page`, `limit`, `sortBy` - Pagination

---

#### 4. Cancel Reminder
```
DELETE /task-reminders/:id
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `edit-update-task-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Cancel/delete a specific reminder |

---

#### 5. Cancel All Reminders for Task
```
POST /task-reminders/task/:id/cancel-all
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child`, `business` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `edit-update-task-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Remove all reminders for a task |

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3
  },
  "message": "3 reminders cancelled successfully"
}
```

---

## Role Access Matrix

### Notification Module

```
┌─────────────────────────────────────┬───────┬──────────┬───────┐
│ Endpoint                            │ Admin │ Business │ Child │
├─────────────────────────────────────┼───────┼──────────┼───────┤
│ GET    /my                          │  ❌   │    ✅    │   ✅  │
│ GET    /unread-count                │  ❌   │    ✅    │   ✅  │
│ POST   /:id/read                    │  ❌   │    ✅    │   ✅  │
│ POST   /read-all                    │  ❌   │    ✅    │   ✅  │
│ DELETE /:id                         │  ❌   │    ✅    │   ✅  │
│ POST   /bulk                        │  ✅   │    ❌    │   ❌  │
│ POST   /schedule-reminder           │  ❌   │    ✅    │   ✅  │
│ GET    /activity-feed/:groupId      │  ❌   │    ✅    │   ✅  │
└─────────────────────────────────────┴───────┴──────────┴───────┘
```

### TaskReminder Module

```
┌─────────────────────────────────────┬───────┬──────────┬───────┐
│ Endpoint                            │ Admin │ Business │ Child │
├─────────────────────────────────────┼───────┼──────────┼───────┤
│ POST   /                            │  ❌   │    ✅    │   ✅  │
│ GET    /task/:id                    │  ❌   │    ✅    │   ✅  │
│ GET    /my                          │  ❌   │    ✅    │   ✅  │
│ DELETE /:id                         │  ❌   │    ✅    │   ✅  │
│ POST   /task/:id/cancel-all         │  ❌   │    ✅    │   ✅  │
└─────────────────────────────────────┴───────┴──────────┴───────┘
```

---

## Data Models

### Notification Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                    // Target user
  title: String | { en: String, bn: String },
  subTitle: String | { en: String, bn: String },
  type: 'task' | 'group' | 'system' | 'reminder' | 'mention' | 'assignment' | 'deadline',
  priority: 'low' | 'normal' | 'high' | 'urgent',
  status: 'unread' | 'read',
  channels: ['in_app', 'email', 'push', 'sms'],
  linkFor: String,                     // Navigation link
  linkId: String,
  data: Object,                        // Additional metadata
  isDeleted: Boolean,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### TaskReminder Collection

```typescript
{
  _id: ObjectId,
  taskId: ObjectId,                    // Target task
  userId: ObjectId,                    // Reminder owner
  createdByUserId: ObjectId,           // Who created the reminder
  reminderTime: Date,                  // When to trigger
  triggerType: 'before_deadline' | 'at_deadline' | 'after_deadline' | 'custom_time' | 'recurring',
  frequency: 'once' | 'daily' | 'weekly' | 'monthly',
  customMessage: String,
  channels: ['in_app', 'email', 'push', 'sms'],
  status: 'pending' | 'sent' | 'cancelled',
  lastTriggeredAt: Date,
  nextTriggerAt: Date,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Caching Strategy

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `notification:user:<id>:unreadCount` | 1 min | Unread notification count |
| `notification:user:<id>:list` | 2 min | Notification list |
| `notification:group:<id>:activityFeed` | 30 sec | Live activity feed |
| `reminder:user:<id>:pending` | 5 min | Pending reminders |

**Cache Invalidation:**
- Mark as read → Invalidate unread count, notification list
- Delete notification → Invalidate notification list
- Create reminder → Invalidate pending reminders
- Cancel reminder → Invalidate pending reminders

---

## Notification Types

| Type | Description | Example |
|------|-------------|---------|
| `task` | Task-related notifications | Task created, updated, deleted |
| `group` | Group-related notifications | Member joined, left, removed |
| `system` | System-wide announcements | Maintenance, updates |
| `reminder` | Reminder notifications | Deadline approaching |
| `mention` | User mentions | Someone mentioned you |
| `assignment` | Task assignments | You've been assigned a task |
| `deadline` | Deadline notifications | Task deadline today/tomorrow |

---

## Notification Channels

| Channel | Description | Use Case |
|---------|-------------|----------|
| `in_app` | In-app notification | All notifications |
| `email` | Email delivery | Important notifications |
| `push` | Push notification | Mobile app alerts |
| `sms` | SMS message | Urgent notifications |

---

## Security Considerations

### 1. User Isolation
- Users can only access their own notifications
- Cannot read/delete other users' notifications
- Group activity feed limited to group members

### 2. Admin Privileges
- Only admins can send bulk notifications
- Rate limited to prevent abuse (10/min)
- Can target by role or specific users

### 3. Rate Limiting
| Operation | Limit | Window |
|-----------|-------|--------|
| Send notification | 10 | 1 minute |
| General operations | 100 | 1 minute |
| Create reminder | 10 | 1 minute |

### 4. BullMQ Integration
- All bulk notifications queued asynchronously
- Retry logic with exponential backoff
- Failed jobs logged for monitoring

---

## Figma Asset References

All role assignments are based on:

```
/figma-asset/
├── teacher-parent-dashboard/
│   └── dashboard/
│       └── dashboard-flow-01.png       → Live activity feed
├── app-user/
│   └── group-children-user/
│       ├── home-flow.png               → Notifications, reminders
│       └── edit-update-task-flow.png   → Task reminders
└── main-admin-dashboard/
    └── dashboard-section-flow.png      → Admin notifications
```

---

## API Examples

### Get Notifications with Filters
**Request:**
```http
GET /api/v1/notifications/my?status=unread&type=task&priority=high&page=1&limit=10
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notif123",
        "title": "Task Assigned",
        "subTitle": "Complete Math Homework",
        "type": "assignment",
        "priority": "high",
        "status": "unread",
        "createdAt": "2026-03-10T10:00:00.000Z",
        "linkFor": "/tasks",
        "linkId": "task456"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Create Task Reminder
**Request:**
```http
POST /api/v1/task-reminders/
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "taskId": "task123",
  "reminderTime": "2026-03-11T08:00:00.000Z",
  "triggerType": "before_deadline",
  "frequency": "once",
  "customMessage": "Don't forget to complete your math homework!",
  "channels": ["in_app", "push"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reminder scheduled successfully",
  "data": {
    "_id": "reminder789",
    "taskId": "task123",
    "userId": "user456",
    "reminderTime": "2026-03-11T08:00:00.000Z",
    "triggerType": "before_deadline",
    "frequency": "once",
    "status": "pending",
    "customMessage": "Don't forget to complete your math homework!",
    "channels": ["in_app", "push"],
    "createdAt": "2026-03-10T10:00:00.000Z"
  }
}
```

### Get Live Activity Feed
**Request:**
```http
GET /api/v1/notifications/activity-feed/grp123?limit=20
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Live activity feed retrieved successfully",
  "data": {
    "activities": [
      {
        "_id": "activity123",
        "type": "task_completed",
        "message": "John completed Math Homework",
        "userId": {
          "_id": "user789",
          "name": "John Doe",
          "profileImage": "https://..."
        },
        "taskId": "task456",
        "taskTitle": "Math Homework",
        "timestamp": "2026-03-10T10:30:00.000Z"
      },
      {
        "_id": "activity124",
        "type": "task_started",
        "message": "Jane started Science Project",
        "userId": {
          "_id": "user101",
          "name": "Jane Smith",
          "profileImage": "https://..."
        },
        "taskId": "task789",
        "taskTitle": "Science Project",
        "timestamp": "2026-03-10T09:15:00.000Z"
      }
    ]
  }
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 10-03-26 | Initial role-based access control implementation |

---

**Version:** 1.0.0  
**Last Updated:** 10-03-26  
**Author:** Senior Backend Engineering Team
