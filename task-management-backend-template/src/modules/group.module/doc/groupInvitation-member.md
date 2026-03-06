# 📋 GroupInvitation Sub-Module Documentation

## Overview

The `groupInvitation/` sub-module manages the invitation workflow for users to join groups. Supports both registered users (by userId) and non-registered users (by email), with token-based acceptance and BullMQ-powered async email delivery.

---

## 🏗️ Schema Design

### GroupInvitation Entity

```
┌─────────────────────────────────────────────────────────┐
│                GROUP_INVITATION                         │
├─────────────────────────────────────────────────────────┤
│ _id: ObjectId                                           │
│ groupId: ObjectId (ref: Group)                          │
│ invitedByUserId: ObjectId (ref: User)                   │
│ invitedUserId: ObjectId (ref: User, optional)           │
│ email: String (lowercase, optional)                     │
│ status: Enum (pending|accepted|declined|expired|cancelled)│
│ token: String (unique, auto-generated)                  │
│ expiresAt: Date (auto: +7 days)                         │
│ message: String (optional, max 500 chars)               │
│ metadata: Mixed (extensible)                            │
│ isDeleted: Boolean (soft delete)                        │
│ createdAt: Date                                         │
│ updatedAt: Date                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### 1. Send Single Invitation

```http
POST /api/v1/group-invitations/:id/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "message": "Join our development team!"
}
```

**Response:**
```json
{
  "success": true,
  "code": 201,
  "message": "Invitation sent successfully. Email will be delivered shortly.",
  "data": {
    "_invitationId": "64abc...",
    "groupId": "...",
    "invitedByUserId": "...",
    "email": "newuser@example.com",
    "status": "pending",
    "expiresAt": "2026-03-13T10:30:00Z"
  }
}
```

---

### 2. Send Bulk Invitations

```http
POST /api/v1/group-invitations/:id/send-bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "emails": ["user1@example.com", "user2@example.com"],
  "userIds": ["64user123...", "64user456..."],
  "message": "Welcome to our team!"
}
```

**Response:**
```json
{
  "success": true,
  "code": 201,
  "message": "15 invitations sent successfully",
  "data": [...]
}
```

**Limits:**
- Maximum 20 invitations per request
- Maximum 100 pending invitations per group

---

### 3. Get Pending Invitations

```http
GET /api/v1/group-invitations/:id/pending?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_invitationId": "...",
      "email": "user@example.com",
      "invitedByUserId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "expiresAt": "2026-03-13T10:30:00Z",
      "daysUntilExpiry": 7
    }
  ]
}
```

---

### 4. Get My Invitations

```http
GET /api/v1/group-invitations/my?status=pending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_invitationId": "...",
      "groupId": {
        "_groupId": "...",
        "name": "Development Team",
        "description": "...",
        "avatarUrl": "..."
      },
      "invitedByUserId": {
        "name": "John Doe"
      },
      "status": "pending",
      "expiresAt": "2026-03-13T10:30:00Z"
    }
  ]
}
```

---

### 5. Accept Invitation

```http
POST /api/v1/group-invitations/accept
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "abc123def456..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined the group!",
  "data": {
    "_invitationId": "...",
    "status": "accepted"
  }
}
```

---

### 6. Decline Invitation

```http
POST /api/v1/group-invitations/:id/decline
Authorization: Bearer <token>
```

---

### 7. Cancel Invitation

```http
DELETE /api/v1/group-invitations/:id
Authorization: Bearer <token>
```

**Note:** Only inviter, owner, or admin can cancel

---

### 8. Get Invitation Count

```http
GET /api/v1/group-invitations/count?status=pending
Authorization: Bearer <token>
```

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

## 🔄 Business Logic Flow

### Send Invitation Flow

```
1. Validate user authentication
2. Check user has permission (owner/admin)
3. Verify group exists and is active
4. Check recipient is not already a member
5. Check pending invitation limit
6. Check no duplicate invitation exists
7. Create invitation with auto-generated token
8. Queue email job in BullMQ
9. Invalidate cache
10. Return invitation
```

### Accept Invitation Flow

```
1. Validate token
2. Find invitation by token
3. Check invitation is valid (not expired, pending)
4. Verify user matches invitedUserId
5. Create GroupMember document
6. Increment group's currentMemberCount
7. Update invitation status to 'accepted'
8. Invalidate caches
9. Return accepted invitation
```

### Bulk Invitation Flow

```
1. Validate total invitations <= 20
2. For each email:
   - Create invitation (skip if fails)
   - Queue email job
3. For each userId:
   - Create invitation (skip if fails)
4. Return successful invitations
5. Continue on individual failures
```

---

## 🐂 BullMQ Integration

### Queue Configuration

```typescript
Queue: 'group-invitations-queue'
Connection: Redis (same as Socket.IO)
Attempts: 3
Backoff: Exponential (5s delay)
```

### Job Data Structure

```typescript
{
  invitationId: string;
  email?: string;
  groupName: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  message?: string;
}
```

### Worker Process

```typescript
1. Receive job from queue
2. Extract invitation data
3. Send email via email service
4. Log success/failure
5. Retry on failure (max 3 attempts)
```

---

## 🗂️ File Structure

```
groupInvitation/
├── groupInvitation.interface.ts   # TypeScript interfaces
├── groupInvitation.constant.ts    # Constants and limits
├── groupInvitation.model.ts       # Mongoose schema and model
├── groupInvitation.service.ts     # Business logic with BullMQ
├── groupInvitation.controller.ts  # HTTP request handlers
├── groupInvitation.route.ts       # Route definitions
└── ../doc/
    └── groupInvitation-member.md  # This file
```

---

## 📊 Database Indexes

```javascript
// Find pending invitations for a group
groupInvitationSchema.index({ groupId: 1, status: 1, isDeleted: 1 });

// Find invitations for a user
groupInvitationSchema.index({ invitedUserId: 1, status: 1, isDeleted: 1 });

// Find invitations by email
groupInvitationSchema.index({ email: 1, status: 1, isDeleted: 1 });

// Find expired invitations for cleanup
groupInvitationSchema.index({ expiresAt: 1, status: 1 });

// Invitation management
groupInvitationSchema.index({ invitedByUserId: 1, createdAt: -1, isDeleted: 1 });

// Token lookup (unique)
groupInvitationSchema.index({ token: 1 }, { unique: true });
```

---

## 🏎️ Redis Caching

### Cache Keys

```
groupInvitation:group:{groupId}:invitations:pending  // Pending list (TTL: 2 min)
groupInvitation:invitation:{groupId}:{userId}        // Single invitation (TTL: 5 min)
```

### Cache Invalidation

Invalidated on:
- Invitation created
- Invitation accepted/declined/cancelled
- Invitation expired

---

## ⚠️ Important Business Rules

1. **Token Security**: Tokens are auto-generated, unique, and not exposed in responses
2. **Expiry**: Invitations expire after 7 days (configurable)
3. **Duplicate Prevention**: Only one pending invitation per recipient per group
4. **Pending Limit**: Maximum 100 pending invitations per group
5. **Bulk Limit**: Maximum 20 invitations per request
6. **Permission**: Only owners and admins can send invitations
7. **Email Optional**: Can invite by userId alone (registered users)
8. **Soft Delete**: Never hard delete invitations (audit trail)

---

## 📧 Email Template Data

```typescript
{
  to: email,
  template: 'group-invitation',
  data: {
    groupName: string,
    invitedBy: string,
    acceptUrl: `${FRONTEND_URL}/invite/${token}`,
    expiresAt: Date,
    message: string
  }
}
```

---

## 🔍 Common Queries

### Find Pending Invitations

```javascript
GroupInvitation.find({
  groupId,
  status: 'pending',
  isDeleted: false,
  expiresAt: { $gt: new Date() }
}).populate('invitedByUserId invitedUserId');
```

### Expire Old Invitations (Cron Job)

```javascript
GroupInvitation.updateMany(
  {
    expiresAt: { $lt: new Date() },
    status: 'pending',
    isDeleted: false
  },
  { $set: { status: 'expired' } }
);
```

### Count Invitations by Status

```javascript
GroupInvitation.aggregate([
  { $match: { groupId, isDeleted: false } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

---

## 🧪 Testing Guidelines

```javascript
// Unit tests:
// - Service: createInvitation validation
// - Service: acceptInvitation token validation
// - Service: bulk invitation limits
// - Service: cache invalidation
// - Worker: email job processing
// - Controller: permission checks
```

---

## 📝 Invitation Status Flow

```
pending → accepted (user accepts)
pending → declined (user declines)
pending → expired (time passes)
pending → cancelled (sender cancels)
```

---

**Last Updated**: 2026-03-06  
**Version**: 1.0.0
