# Notification & Task Reminder Module - API Documentation

## 📋 Overview

Complete API documentation for the Notification and Task Reminder Module with support for **multi-channel notifications**, **live activity feeds**, and **scheduled task reminders**.

**Base URL:** `{{baseUrl}}/v1`
**Last Updated:** 16-03-26
**Version:** 2.1 - Parent Dashboard Activity Feed Added

**New in v2.1:**
- ✅ Added `GET /notifications/dashboard/activity-feed` endpoint for parent dashboard
- ✅ Automatically fetches activities from all children without groupId
- ✅ Includes timeAgo formatting for user-friendly display

---

## 🏗️ Architecture

### Module Structure
```
src/modules/notification.module/
├── notification/            # Notification Module
│   ├── notification.constant.ts
│   ├── notification.interface.ts
│   ├── notification.model.ts
│   ├── notification.service.ts
│   ├── notification.controller.ts
│   └── notification.route.ts
│
├── taskReminder/            # Task Reminder Module
│   ├── taskReminder.constant.ts
│   ├── taskReminder.interface.ts
│   ├── taskReminder.model.ts
│   ├── taskReminder.service.ts
│   ├── taskReminder.controller.ts
│   └── taskReminder.route.ts
│
└── doc/                     # Documentation
    ├── API_DOCUMENTATION.md
    ├── notification-roles-mapping.md
    └── dia/                 # Mermaid diagrams
```

---

## 🔐 Authentication

All endpoints require JWT authentication via Bearer token:

```http
Authorization: Bearer <access_token>
```

### User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `child` | Group members, students | Personal notifications & reminders |
| `business` | Group owners, parents, teachers | Personal notifications & reminders |
| `admin` | System administrators | Bulk notifications, system-wide alerts |

---

## 📚 Notification Endpoints

**Base Path:** `/notifications`

### 1. Get My Notifications
```http
GET /notifications/my?status=unread&type=task&priority=high&page=1&limit=20&sortBy=-createdAt
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `home-flow.png`

**Description:** User retrieves their personal notifications with pagination

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter: `unread`, `read` |
| `type` | string | - | Filter: `task`, `group`, `system`, `reminder`, `mention`, `assignment`, `deadline` |
| `priority` | string | - | Filter: `low`, `normal`, `high`, `urgent` |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |
| `sortBy` | string | `-createdAt` | Sort field (`-` for descending) |

**Response:**
```json
{
  "code": 200,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "senderId": "507f1f77bcf86cd799439010",
        "receiverId": "507f1f77bcf86cd799439012",
        "title": "Task Assigned",
        "subTitle": "You've been assigned to Math Homework",
        "type": "assignment",
        "priority": "high",
        "status": "unread",
        "channels": ["in_app", "email"],
        "linkFor": "/tasks",
        "linkId": "507f1f77bcf86cd799439013",
        "data": {
          "taskId": "507f1f77bcf86cd799439013",
          "taskTitle": "Math Homework"
        },
        "createdAt": "2026-01-05T10:00:00.000Z",
        "readAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  },
  "success": true
}
```

---

### 2. Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `home-flow.png`

**Description:** Get count of unread notifications for badge display

**Response:**
```json
{
  "code": 200,
  "message": "Unread count retrieved successfully",
  "data": {
    "count": 5
  },
  "success": true
}
```

---

### 3. Mark Notification as Read
```http
POST /notifications/:id/read
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `home-flow.png`

**Description:** Mark a single notification as read

**Response:**
```json
{
  "code": 200,
  "message": "Notification marked as read",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "read",
    "readAt": "2026-01-05T14:00:00.000Z"
  },
  "success": true
}
```

---

### 4. Mark All as Read
```http
POST /notifications/read-all
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `home-flow.png`

**Description:** Mark all user notifications as read

**Response:**
```json
{
  "code": 200,
  "message": "All 15 notifications marked as read",
  "data": {
    "count": 15
  },
  "success": true
}
```

---

### 5. Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `home-flow.png`

**Description:** Delete a single notification

**Response:**
```json
{
  "code": 200,
  "message": "Notification deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isDeleted": true
  },
  "success": true
}
```

---

### 6. Send Bulk Notification (Admin Only)
```http
POST /notifications/bulk
Authorization: Bearer <admin_token>
Role: admin
Rate Limit: 10 requests per minute
```

**Figma Reference:** `dashboard-section-flow.png`

**Description:** Admin sends system-wide or targeted notifications

**Request Body:**
```json
{
  "userIds": ["507f1f77bcf86cd799439010", "507f1f77bcf86cd799439011"],
  "receiverRole": "business",
  "title": "System Maintenance",
  "subTitle": "Scheduled downtime at 2 AM",
  "type": "system",
  "priority": "high",
  "channels": ["in_app", "email"],
  "linkFor": "/announcements",
  "linkId": "507f1f77bcf86cd799439012",
  "data": {
    "maintenanceTime": "2026-01-06T02:00:00.000Z"
  }
}
```

**Notification Types:**
| Type | Description |
|------|-------------|
| `task` | Task-related notifications |
| `group` | Group-related notifications |
| `system` | System-wide announcements |
| `reminder` | Reminder notifications |
| `mention` | User mentions |
| `assignment` | Task assignments |
| `deadline` | Deadline alerts |
| `custom` | Custom notifications |

**Priority Levels:**
| Priority | Description |
|----------|-------------|
| `low` | Low priority, no immediate action needed |
| `normal` | Normal priority |
| `high` | High priority, action needed soon |
| `urgent` | Urgent, immediate action required |

**Delivery Channels:**
| Channel | Description |
|---------|-------------|
| `in_app` | In-app notification |
| `email` | Email delivery |
| `push` | Push notification |
| `sms` | SMS message |

**Response:**
```json
{
  "code": 201,
  "message": "25 notifications sent successfully",
  "data": [
    {
      "userId": "507f1f77bcf86cd799439010",
      "notificationId": "507f1f77bcf86cd799439011",
      "status": "sent"
    }
  ],
  "success": true
}
```

---

### 7. Schedule Reminder
```http
POST /notifications/schedule-reminder
Authorization: Bearer <token>
Role: child, business
Rate Limit: 10 requests per minute
```

**Figma Reference:** `home-flow.png`

**Description:** User schedules a task reminder

**Request Body:**
```json
{
  "taskId": "507f1f77bcf86cd799439013",
  "reminderTime": "2026-01-06T08:00:00.000Z",
  "reminderType": "before_deadline",
  "message": "Don't forget to complete your math homework!"
}
```

**Reminder Types:**
| Type | Description |
|------|-------------|
| `before_deadline` | Reminder before task deadline |
| `at_deadline` | Reminder at deadline time |
| `after_deadline` | Reminder if task not completed after deadline |
| `custom` | Custom reminder time |

**Response:**
```json
{
  "code": 201,
  "message": "Reminder scheduled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "taskId": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "reminderTime": "2026-01-06T08:00:00.000Z",
    "reminderType": "before_deadline",
    "message": "Don't forget to complete your math homework!",
    "status": "pending",
    "createdAt": "2026-01-05T10:00:00.000Z"
  },
  "success": true
}
```

---

### 8. Get Live Activity Feed
```http
GET /notifications/activity-feed/:groupId?limit=20
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
Access: Group members only
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Real-time feed of group member task completions and activities

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Number of activities to return (max: 50) |

**Response:**
```json
{
  "code": 200,
  "message": "Live activity feed retrieved successfully",
  "data": {
    "activities": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "type": "task_completed",
        "message": "John completed Math Homework",
        "userId": {
          "_id": "507f1f77bcf86cd799439010",
          "name": "John Doe",
          "profileImage": "https://..."
        },
        "taskId": "507f1f77bcf86cd799439013",
        "taskTitle": "Math Homework",
        "timestamp": "2026-01-05T14:00:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439016",
        "type": "task_started",
        "message": "Jane started Science Project",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Jane Smith",
          "profileImage": "https://..."
        },
        "taskId": "507f1f77bcf86cd799439014",
        "taskTitle": "Science Project",
        "timestamp": "2026-01-05T13:00:00.000Z"
      }
    ]
  },
  "success": true
}
```

**Activity Types:**
| Type | Description |
|------|-------------|
| `task_created` | Task was created |
| `task_started` | User started working on task |
| `task_updated` | Task was updated |
| `task_completed` | User completed task |
| `task_deleted` | Task was deleted |
| `subtask_completed` | Subtask was completed |
| `task_assigned` | User was assigned to task |
| `member_joined` | New member joined group |
| `member_left` | Member left group |
| `comment_added` | Comment was added |
| `attachment_added` | Attachment was added |

---

### 9. Get Live Activity Feed For Parent Dashboard
```http
GET /notifications/dashboard/activity-feed?limit=10
Authorization: Bearer <token>
Role: business (Parent/Teacher)
Rate Limit: 100 requests per minute
```

**Figma Reference:** `teacher-parent-dashboard/dashboard/dashboard-flow-01.png` (Live Activity section)

**Description:**
Dedicated endpoint for parent dashboard to fetch recent task-related activities from all children.
No groupId required - automatically fetches from business user's children.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | `10` | Number of activities to return (max: 50) |

**Request Example:**
```http
GET /notifications/dashboard/activity-feed?limit=10
Authorization: Bearer {{accessToken}}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "activity001",
      "type": "task_completed",
      "actor": {
        "_id": "child001",
        "name": "Alex Morgan",
        "profileImage": "https://example.com/images/alex.jpg"
      },
      "task": {
        "_id": "task001",
        "title": "Complete Math Homework"
      },
      "timestamp": "2026-03-16T10:28:00.000Z",
      "timeAgo": "2 minutes ago",
      "message": "Alex Morgan completed 'Complete Math Homework'"
    },
    {
      "_id": "activity002",
      "type": "subtask_completed",
      "actor": {
        "_id": "child002",
        "name": "Jamie Chen",
        "profileImage": "https://example.com/images/jamie.jpg"
      },
      "task": {
        "_id": "task002",
        "title": "Science Project"
      },
      "timestamp": "2026-03-16T10:25:00.000Z",
      "timeAgo": "5 minutes ago",
      "message": "Jamie Chen completed a subtask in 'Science Project'"
    },
    {
      "_id": "activity003",
      "type": "task_started",
      "actor": {
        "_id": "child001",
        "name": "Alex Morgan",
        "profileImage": "https://example.com/images/alex.jpg"
      },
      "task": {
        "_id": "task003",
        "title": "History Essay"
      },
      "timestamp": "2026-03-16T09:15:00.000Z",
      "timeAgo": "1 hour ago",
      "message": "Alex Morgan started 'History Essay'"
    }
  ],
  "message": "Live activity feed retrieved successfully for parent dashboard"
}
```

**Frontend Usage Examples:**
```javascript
// Fetch live activity feed for dashboard
const { data } = await api.get('/notifications/dashboard/activity-feed?limit=10');

// Display activities in Live Activity section
data.forEach(activity => {
  renderActivityItem({
    profileImage: activity.actor.profileImage,
    name: activity.actor.name,
    message: activity.message,
    timeAgo: activity.timeAgo
  });
});
```

**Authorization:**
- **Role:** `business` (Parent/Teacher) only
- **Permission:** Must have active children in the system

**Notes:**
- Returns activities from all active children of the business user
- Activities include: task completions, task starts, subtask completions, task creations
- Response includes `timeAgo` field for user-friendly display
- Cached for 30 seconds for real-time feel
- Sorted by most recent first

---

## 📚 Task Reminder Endpoints

**Base Path:** `/task-reminders`

### 1. Create Task Reminder
```http
POST /task-reminders
Authorization: Bearer <token>
Role: child, business
Rate Limit: 10 requests per minute
```

**Figma Reference:** `edit-update-task-flow.png`

**Description:** User creates a reminder for a task (deadline, custom time)

**Request Body:**
```json
{
  "taskId": "507f1f77bcf86cd799439013",
  "reminderTime": "2026-01-06T08:00:00.000Z",
  "triggerType": "before_deadline",
  "frequency": "once",
  "customMessage": "Remember to complete your task!",
  "channels": ["in_app", "push"]
}
```

**Trigger Types:**
| Type | Description |
|------|-------------|
| `before_deadline` | Reminder before task deadline |
| `at_deadline` | Reminder at deadline time |
| `after_deadline` | Reminder if task not completed after deadline |
| `custom_time` | Reminder at specific custom time |
| `recurring` | Recurring reminder |

**Frequency Options:**
| Frequency | Description |
|-----------|-------------|
| `once` | Single reminder |
| `daily` | Daily reminder |
| `weekly` | Weekly reminder |
| `monthly` | Monthly reminder |

**Response:**
```json
{
  "code": 201,
  "message": "Reminder scheduled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "taskId": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "reminderTime": "2026-01-06T08:00:00.000Z",
    "triggerType": "before_deadline",
    "frequency": "once",
    "customMessage": "Remember to complete your task!",
    "channels": ["in_app", "push"],
    "status": "pending",
    "createdAt": "2026-01-05T10:00:00.000Z"
  },
  "success": true
}
```

---

### 2. Get Reminders for Task
```http
GET /task-reminders/task/:id?page=1&limit=10
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
Access: Users with access to parent task
```

**Figma Reference:** `edit-update-task-flow.png`

**Description:** Get all reminders associated with a specific task

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response:**
```json
{
  "code": 200,
  "message": "Task reminders retrieved successfully",
  "data": {
    "reminders": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "taskId": "507f1f77bcf86cd799439013",
        "userId": "507f1f77bcf86cd799439012",
        "reminderTime": "2026-01-06T08:00:00.000Z",
        "triggerType": "before_deadline",
        "frequency": "once",
        "customMessage": "Remember to complete your task!",
        "status": "pending",
        "createdAt": "2026-01-05T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  },
  "success": true
}
```

---

### 3. Get My Reminders
```http
GET /task-reminders/my?status=pending&frequency=daily&page=1&limit=20&sortBy=reminderTime
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `home-flow.png`

**Description:** Get all reminders for the authenticated user

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter: `pending`, `sent`, `cancelled`, `failed` |
| `frequency` | string | - | Filter: `once`, `daily`, `weekly`, `monthly` |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `sortBy` | string | `reminderTime` | Sort field |

**Response:**
```json
{
  "code": 200,
  "message": "My reminders retrieved successfully",
  "data": {
    "reminders": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "taskId": {
          "_id": "507f1f77bcf86cd799439013",
          "title": "Math Homework"
        },
        "reminderTime": "2026-01-06T08:00:00.000Z",
        "triggerType": "before_deadline",
        "frequency": "once",
        "customMessage": "Remember to complete your task!",
        "status": "pending",
        "createdAt": "2026-01-05T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  },
  "success": true
}
```

---

### 4. Cancel Reminder
```http
DELETE /task-reminders/:id
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
Access: Reminder creator only
```

**Figma Reference:** `edit-update-task-flow.png`

**Description:** Cancel/delete a specific reminder

**Response:**
```json
{
  "code": 200,
  "message": "Reminder cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "cancelled",
    "cancelledAt": "2026-01-05T14:00:00.000Z"
  },
  "success": true
}
```

---

### 5. Cancel All Reminders for Task
```http
POST /task-reminders/task/:id/cancel-all
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
Access: Users with access to parent task
```

**Figma Reference:** `edit-update-task-flow.png`

**Description:** Remove all reminders associated with a task

**Response:**
```json
{
  "code": 200,
  "message": "3 reminders cancelled successfully",
  "data": {
    "count": 3
  },
  "success": true
}
```

---

## 🎯 Key Features

### 1. Multi-Channel Delivery
Notifications can be delivered through multiple channels:
- **In-App**: Real-time notifications in the application
- **Email**: Email delivery for important notifications
- **Push**: Mobile push notifications
- **SMS**: SMS for urgent notifications

### 2. i18n Support
Notification titles and subtitles support internationalization:
```json
{
  "title": {
    "en": "Task Assigned",
    "bn": "কাজ অর্পিত"
  },
  "subTitle": {
    "en": "You've been assigned to Math Homework",
    "bn": "আপনাকে গণিতের হোমওয়ার্ক অর্পিত করা হয়েছে"
  }
}
```

### 3. Scheduled Delivery
Reminders can be scheduled for future delivery with BullMQ queue system.

### 4. Priority-Based Routing
- `low`: Standard delivery
- `normal`: Standard delivery
- `high`: Prioritized delivery
- `urgent`: Immediate delivery via all channels

### 5. Live Activity Feed
Real-time feed showing group member activities with automatic updates.

### 6. Automatic Notifications
System automatically sends notifications for:
- Task assignments
- Task completions
- Deadline reminders
- Group invitations
- Member activities

---

## 📊 Database Schema

### Notification Collection
```javascript
{
  _id: ObjectId,
  senderId: ObjectId,                // References User
  receiverId: ObjectId,              // References User
  receiverRole: String,              // For broadcast notifications
  title: String | Object,            // Supports i18n
  subTitle: String | Object,         // Supports i18n
  type: String,                      // 'task' | 'group' | 'system' | etc.
  priority: String,                  // 'low' | 'normal' | 'high' | 'urgent'
  channels: [String],                // ['in_app', 'email', 'push', 'sms']
  status: String,                    // 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  linkFor: String,                   // Navigation link type
  linkId: ObjectId,                  // Entity ID to link to
  referenceFor: String,              // Reference type
  referenceId: ObjectId,             // Reference entity ID
  data: Object,                      // Additional data
  metadata: Object,                  // Metadata for extensibility
  readAt: Date,                      // When notification was read
  deliveredAt: Date,                 // When notification was delivered
  scheduledFor: Date,                // Scheduled delivery time
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### TaskReminder Collection
```javascript
{
  _id: ObjectId,
  taskId: ObjectId,                  // References Task
  userId: ObjectId,                  // References User
  createdByUserId: ObjectId,         // References User
  reminderTime: Date,                // When to send reminder
  triggerType: String,               // 'before_deadline' | 'at_deadline' | etc.
  frequency: String,                 // 'once' | 'daily' | 'weekly' | 'monthly'
  customMessage: String,             // max 500
  channels: [String],                // ['in_app', 'email', 'push', 'sms']
  status: String,                    // 'pending' | 'sent' | 'cancelled' | 'failed'
  lastTriggeredAt: Date,             // Last time reminder was sent
  nextReminderTime: Date,            // Next scheduled time
  sentCount: Number,                 // Number of times sent
  maxOccurrences: Number,            // Max times to send (for recurring)
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "code": 400,
  "message": "Task ID is required",
  "success": false
}
```

```json
{
  "code": 400,
  "message": "Reminder time must be in the future",
  "success": false
}
```

### 403 Forbidden
```json
{
  "code": 403,
  "message": "You do not have permission to access this notification",
  "success": false
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Notification not found",
  "success": false
}
```

```json
{
  "code": 404,
  "message": "Task not found",
  "success": false
}
```

---

## 🧪 Testing with cURL

### Get My Notifications
```bash
curl -X GET "http://localhost:6733/api/v1/notifications/my?status=unread&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Unread Count
```bash
curl -X GET "http://localhost:6733/api/v1/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Mark Notification as Read
```bash
curl -X POST http://localhost:6733/api/v1/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Mark All as Read
```bash
curl -X POST http://localhost:6733/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Send Bulk Notification (Admin)
```bash
curl -X POST http://localhost:6733/api/v1/notifications/bulk \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverRole": "business",
    "title": "System Maintenance",
    "subTitle": "Scheduled downtime at 2 AM",
    "type": "system",
    "priority": "high",
    "channels": ["in_app", "email"]
  }'
```

### Create Task Reminder
```bash
curl -X POST http://localhost:6733/api/v1/task-reminders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_ID",
    "reminderTime": "2026-01-06T08:00:00.000Z",
    "triggerType": "before_deadline",
    "frequency": "once",
    "customMessage": "Remember to complete your task!",
    "channels": ["in_app", "push"]
  }'
```

### Get Live Activity Feed
```bash
curl -X GET "http://localhost:6733/api/v1/notifications/activity-feed/GROUP_ID?limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Notes

1. **Timezone Handling**: All dates stored in UTC. Frontend handles timezone conversion.
2. **Soft Delete**: Notifications and reminders use `isDeleted` flag instead of hard deletion.
3. **Pagination**: Default limit is 20, max is 100.
4. **Sorting**: Use `-` prefix for descending order (e.g., `-createdAt`).
5. **Population**: Related user fields auto-populated in list views.
6. **Rate Limiting**: All endpoints have rate limiting configured.
7. **Caching**: Unread counts cached with Redis (30 sec TTL), notification lists (2 min TTL).
8. **BullMQ Queue**: Scheduled reminders processed asynchronously via BullMQ.
9. **i18n**: Titles and subtitles support multi-language via object format.

---

## 🚀 Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

---

## 📞 Support

For issues or questions:
- Check error messages
- Review server logs
- Contact backend team

---

**Last Updated:** 10-03-26  
**Author:** Senior Backend Engineering Team  
**Status:** ✅ Complete and Production-Ready
