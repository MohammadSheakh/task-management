# 📬 Notification Module - Architecture Documentation (v2.0)

**Version**: 2.0 - Updated with Socket.IO Real-Time Integration  
**Status**: ✅ Production Ready  
**Last Updated**: 12-03-26  

---

## 🎯 Module Overview (v2.0)

The Notification Module provides a comprehensive, multi-channel notification system designed for high-scale task management applications. It supports **real-time notifications via Socket.IO**, scheduled reminders, bulk notifications, and multi-channel delivery (in-app, email, push, SMS) with **real-time family activity broadcasting**.

### Key Features (v2.0)

- ✅ **Multi-Channel Notification Delivery**
  - In-app notifications with **real-time Socket.IO updates** ⭐
  - Email notifications with i18n support
  - Push notifications for mobile devices
  - SMS notifications for critical alerts

- ✅ **Task Reminders**
  - One-time and recurring reminders
  - Deadline-based triggers (before, at, after)
  - BullMQ scheduled job processing
  - Automatic rescheduling for recurring reminders

- ✅ **Real-Time Features** ⭐ NEW!
  - Socket.IO for instant notification delivery
  - Family activity broadcasting
  - Real-time parent notifications
  - Task progress notifications

- ✅ **Notification Management**
  - CRUD operations for notifications
  - Read/unread status tracking
  - Bulk notification operations
  - Soft delete with retention policies

- ✅ **Scalability & Performance**
  - Redis caching for unread counts (60s TTL)
  - Redis caching for notification lists (300s TTL)
  - **Socket.IO state caching (1 min TTL)** ⭐ NEW!
  - Rate limiting (10 notifications/min for sending, 100 req/min general)
  - BullMQ for async processing
  - Database indexes optimized for 100K+ users

---

## 📂 Module Structure (v2.0)

```
notification.module/
├── doc/
│   ├── dia/                        # 8 Mermaid diagrams (v2.0)
│   │   ├── notification-schema-v2.mermaid
│   │   ├── notification-system-architecture-v2.mermaid
│   │   ├── notification-sequence-v2.mermaid
│   │   ├── notification-user-flow-v2.mermaid
│   │   ├── notification-swimlane-v2.mermaid
│   │   ├── notification-state-machine-v2.mermaid
│   │   ├── notification-component-architecture-v2.mermaid
│   │   ├── notification-data-flow-v2.mermaid
│   │   └── taskReminder-schema-v2.mermaid
│   ├── README.md                   # Module documentation
│   ├── API_DOCUMENTATION.md        # API reference
│   ├── NOTIFICATION_MODULE_ARCHITECTURE-v2.md  # This file
│   ├── NOTIFICATION_MODULE_SYSTEM_GUIDE-v2.md  # ⭐ NEW!
│   ├── notification-member.md
│   ├── taskReminder-member.md
│   └── perf/
│       └── notification-module-performance-report.md
│
├── notification/
│   ├── notification.interface.ts              # TypeScript interfaces
│   ├── notification.constant.ts               # Constants & enums
│   ├── notification.model.ts                  # Mongoose schema & model
│   ├── notification.service.ts                # Business logic with Socket.IO ⭐
│   ├── notification.controller.ts             # HTTP handlers
│   └── notification.route.ts                  # API routes
│
└── taskReminder/
    ├── taskReminder.interface.ts              # TypeScript interfaces
    ├── taskReminder.constant.ts               # Constants & enums
    ├── taskReminder.model.ts                  # Mongoose schema & model
    ├── taskReminder.service.ts                # Business logic with BullMQ
    ├── taskReminder.controller.ts             # HTTP handlers
    └── taskReminder.route.ts                  # API routes
```

---

## 🏗️ Architecture Design (v2.0)

### Design Principles

1. **Multi-Channel Delivery**
   - In-app with real-time Socket.IO ⭐
   - Email, Push, SMS for critical alerts
   - Configurable channel preferences

2. **Real-Time First** ⭐ NEW!
   - Socket.IO for instant delivery
   - Family activity broadcasting
   - Real-time parent notifications

3. **Cache-First Strategy**
   - Redis cache-aside pattern
   - Configurable TTLs per data type
   - Automatic cache invalidation
   - Socket.IO state caching

4. **Async Processing**
   - BullMQ for heavy operations
   - Scheduled reminders via BullMQ
   - Bulk notification processing

5. **Scalability**
   - Designed for 100K+ users
   - Horizontal scaling ready
   - Read replica support

---

## 📊 Database Schema (v2.0)

### Notification Collection

```typescript
interface INotification {
  _id: Types.ObjectId;
  title: Object;                    // i18n object
  subTitle: Object;                 // i18n object
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  receiverRole: string;
  type: 'task' | 'reminder' | 'assignment' | 'deadline' | 'activity' | 'permission';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: ('in_app' | 'email' | 'push' | 'sms')[];
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  isRead: boolean;
  readAt?: Date;
  sentAt?: Date;
  linkFor: string;
  linkId: Types.ObjectId;
  data: Object;                     // Additional metadata
  scheduledFor?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

```typescript
// Primary query: Get user's notifications
notificationSchema.index({ receiverId: 1, createdAt: -1, isDeleted: false });

// Unread count
notificationSchema.index({ receiverId: 1, status: 1, isDeleted: false });

// Scheduled notifications
notificationSchema.index({ scheduledFor: 1, status: 1, isDeleted: false });

// Text search
notificationSchema.index({ 'title.en': 'text', 'subTitle.en': 'text' });

// Link-based notifications
notificationSchema.index({ linkFor: 1, linkId: 1, isDeleted: false });
```

---

## 🔄 Real-Time Integration (v2.0) ⭐ NEW!

### Socket.IO Notification Delivery

```typescript
// Real-time notification delivery
async createNotification(notificationData: INotification) {
  const notification = await Notification.create(notificationData);
  
  // Try real-time delivery first
  const delivered = await socketService.emitNotificationToUser(
    notification.receiverId.toString(),
    'notification:new',
    notification
  );
  
  if (!delivered) {
    // User offline - fall back to push notification
    await this.sendPushNotification(notification);
  }
  
  return notification;
}
```

### Family Activity Broadcasting

```typescript
// Broadcast family activity
async broadcastFamilyActivity(businessUserId: string, activity: IFamilyActivity) {
  // Add to Redis activity feed
  await redisClient.lPush(
    `socket:family:${businessUserId}:activity`,
    JSON.stringify(activity)
  );
  
  // Keep only last 50 activities
  await redisClient.lTrim(
    `socket:family:${businessUserId}:activity`,
    0, 49
  );
  
  // Broadcast via Socket.IO
  socketService.emitToGroup(businessUserId, 'group:activity', activity);
}
```

### Redis Cache Keys (v2.0)

```typescript
// Notification caches
notification:unread:{userId}              // TTL: 60s
notification:list:{userId}                // TTL: 300s
notification:{notificationId}             // TTL: 3600s

// Socket.IO state ⭐ NEW!
socket:notification:{userId}:state        // TTL: 60s
socket:family:{businessUserId}:activity   // TTL: 120s
```

---

## 🎯 Key Components (v2.0)

### 1. Notification Service

**File**: `notification.service.ts`

**Responsibilities**:
- Create and send notifications
- Real-time Socket.IO delivery ⭐ NEW!
- Multi-channel delivery (email, push, SMS)
- Redis caching
- Bulk notifications

**Key Methods**:
```typescript
class NotificationService {
  // Create single notification
  async createNotification(
    data: INotification,
    scheduledFor?: Date
  ): Promise<INotification>

  // Send bulk notifications
  async sendBulkNotification(
    payload: IBulkNotificationPayload
  ): Promise<INotification[]>

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: INotificationQueryOptions
  ): Promise<PaginatedResponse>

  // Get unread count
  async getUnreadCount(userId: string): Promise<number>

  // Mark as read
  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification>

  // ⭐ NEW: Real-time delivery
  async emitNotificationToUser(
    userId: string,
    event: string,
    data: any
  ): Promise<boolean>

  // ⭐ NEW: Broadcast family activity
  async broadcastFamilyActivity(
    businessUserId: string,
    activity: IFamilyActivity
  ): Promise<void>
}
```

---

### 2. Task Reminder Service

**File**: `taskReminder.service.ts`

**Responsibilities**:
- Create task reminders
- Schedule reminders via BullMQ
- Process recurring reminders
- Send reminder notifications

**Key Methods**:
```typescript
class TaskReminderService {
  // Create reminder
  async createReminder(
    data: ITaskReminderData
  ): Promise<ITaskReminder>

  // Process reminder (BullMQ job)
  async processReminder(reminderId: string): Promise<void>

  // Send reminder notification
  async sendReminderNotification(
    reminder: ITaskReminder
  ): Promise<void>

  // Reschedule recurring reminder
  async rescheduleReminder(
    reminder: ITaskReminder
  ): Promise<void>
}
```

---

## 🔐 Security Features (v2.0)

### 1. Authentication

- ✅ JWT authentication required for all endpoints
- ✅ Role-based access control
  - Common role: View own notifications
  - Admin role: Bulk operations

### 2. Authorization

```typescript
// Users can only see their own notifications
GET /notifications/my  // ✅ Own notifications
GET /notifications/:id  // ❌ Others' notifications (unless admin)

// Admin-only endpoints
POST /notifications/bulk  // ✅ Admin only
```

### 3. Data Privacy

```typescript
// ✅ Good: Aggregated notification data
{
  unreadCount: 5,
  totalCount: 150
}

// ❌ Bad: Exposing notification content in analytics
{
  notifications: [
    { title: "Private message", ... }  // Never expose!
  ]
}
```

---

## 📈 Performance Optimization (v2.0)

### 1. Redis Caching Strategy

```typescript
// Cache-aside pattern
async getUnreadCount(userId: string): Promise<number> {
  const cacheKey = `notification:unread:${userId}`;
  
  // 1. Try cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return parseInt(cached);  // ~5ms
  }
  
  // 2. Cache miss - query DB
  const count = await Notification.countDocuments({
    receiverId: userId,
    status: { $ne: 'read' },
    isDeleted: false
  });  // ~50ms
  
  // 3. Write to cache (60s TTL)
  await redisClient.setEx(cacheKey, 60, count.toString());
  
  // 4. Return data
  return count;
}
```

**Cache TTLs (v2.0)**:
```typescript
// Notification caches
unread:count: 60s
notification:list: 300s
notification:detail: 3600s

// Socket.IO state ⭐ NEW!
socket:state: 60s
socket:activity: 120s
```

### 2. Cache Invalidation (v2.0)

```typescript
// Invalidate on notification changes
async markAsRead(notificationId: string, userId: string) {
  // Update notification
  await Notification.findByIdAndUpdate(notificationId, {
    status: 'read',
    readAt: new Date()
  });
  
  // Invalidate caches
  await redisClient.del([
    `notification:unread:${userId}`,
    `notification:list:${userId}`,
    `notification:${notificationId}`
  ]);
  
  // Broadcast via Socket.IO
  await socketService.emitToUser(userId, 'notification:read', {
    notificationId,
    timestamp: new Date()
  });
}
```

---

## 📊 API Endpoints Summary (v2.0)

### Notification Management (6 endpoints)

| Method | Endpoint | Auth | Description | Real-Time |
|--------|----------|------|-------------|-----------|
| GET | `/notifications/my` | ✅ | Get my notifications | ❌ |
| GET | `/notifications/unread-count` | ✅ | Get unread count | ❌ |
| POST | `/notifications/:id/read` | ✅ | Mark as read | ✅ Broadcast |
| POST | `/notifications/read-all` | ✅ | Mark all as read | ✅ Broadcast |
| DELETE | `/notifications/:id` | ✅ | Delete notification | ✅ Broadcast |
| POST | `/notifications/bulk` | ✅ Admin | Send bulk notifications | ❌ |

### Task Reminders (5 endpoints)

| Method | Endpoint | Auth | Description | Real-Time |
|--------|----------|------|-------------|-----------|
| POST | `/task-reminders/` | ✅ | Create reminder | ❌ |
| GET | `/task-reminders/task/:taskId` | ✅ | Get task reminders | ❌ |
| GET | `/task-reminders/my` | ✅ | Get my reminders | ❌ |
| DELETE | `/task-reminders/:id` | ✅ | Cancel reminder | ❌ |
| POST | `/task-reminders/task/:id/cancel-all` | ✅ | Cancel all reminders | ❌ |

**Total**: 11 endpoints

---

## 🔗 External Dependencies (v2.0)

### Internal Modules

- ✅ **user.module** - User data source
- ✅ **task.module** - Task references
- ✅ **childrenBusinessUser.module** - Family relationships
- ✅ **taskProgress.module** - Progress notifications
- ✅ **Socket.IO service** - Real-time delivery ⭐ NEW!

### External Services

- ✅ **MongoDB** - Primary database
- ✅ **Redis** - Caching layer
- ✅ **BullMQ** - Scheduled jobs
- ✅ **Socket.IO** - Real-time delivery ⭐ NEW!
- ✅ **Email Service** - SendGrid/SES
- ✅ **FCM** - Push notifications
- ✅ **Twilio** - SMS notifications

---

## 🧪 Testing Strategy (v2.0)

### Unit Tests

```typescript
describe('NotificationService', () => {
  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      // Test successful creation
    });

    it('should deliver via Socket.IO', async () => {
      // Test real-time delivery
    });

    it('should fall back to push if offline', async () => {
      // Test fallback mechanism
    });
  });

  describe('broadcastFamilyActivity', () => {
    it('should broadcast to family room', async () => {
      // Test family broadcasting
    });

    it('should cache activity feed', async () => {
      // Test activity caching
    });
  });
});
```

### Integration Tests

```typescript
describe('Notification API (v2.0)', () => {
  describe('POST /notifications/:id/read', () => {
    it('should return 200 with notification data', async () => {
      // Test endpoint
    });

    it('should broadcast via Socket.IO', async () => {
      // Test real-time broadcast
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('should use cache for fast response', async () => {
      // Test caching
    });
  });
});
```

---

## 🚀 Future Enhancements

### Phase 2 (Optional)

- [ ] Notification templates
- [ ] A/B testing for notification content
- [ ] Advanced scheduling (cron-based)
- [ ] Notification preferences per user
- [ ] Real-time notification analytics

### Phase 3 (Future)

- [ ] AI-powered notification timing
- [ ] Smart notification batching
- [ ] Notification priority escalation
- [ ] Cross-device synchronization

---

## 📝 Related Documentation (v2.0)

- [API Documentation](./API_DOCUMENTATION.md)
- [Performance Report](./perf/notification-module-performance-report.md)
- [Diagrams (v2.0)](./dia/) ⭐ UPDATED
- [System Guide](./NOTIFICATION_MODULE_SYSTEM_GUIDE-v2.md) ⭐ NEW!
- [Socket.IO Integration](../../helpers/socket/SOCKET_IO_INTEGRATION.md) ⭐ NEW!

---

**Document Generated**: 08-03-26  
**Updated**: 12-03-26 (v2.0)  
**Author**: Qwen Code Assistant  
**Status**: ✅ Production Ready (v2.0)
