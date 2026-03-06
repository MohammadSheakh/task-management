# 📋 GroupMember Sub-Module Documentation

## Overview

The `groupMember/` sub-module manages membership relationships between users and groups, including role management, permissions, and membership lifecycle.

---

## 🏗️ Schema Design

### GroupMember Entity

```
┌─────────────────────────────────────────────────────────┐
│                   GROUP_MEMBER                          │
├─────────────────────────────────────────────────────────┤
│ _id: ObjectId                                           │
│ groupId: ObjectId (ref: Group, immutable)               │
│ userId: ObjectId (ref: User, immutable)                 │
│ role: Enum (owner|admin|member)                         │
│ status: Enum (active|inactive|blocked)                  │
│ joinedAt: Date (auto-set)                               │
│ note: String (optional, max 500 chars)                  │
│ metadata: Mixed (extensible)                            │
│ isDeleted: Boolean (soft delete)                        │
│ createdAt: Date                                         │
│ updatedAt: Date                                         │
└─────────────────────────────────────────────────────────┘
```

### Unique Constraint

```javascript
// Prevent duplicate memberships
{ groupId: 1, userId: 1 } with partialFilterExpression: { isDeleted: false }
```

---

## 📡 API Endpoints

### 1. Get Group Members (Paginated)

```http
GET /api/v1/groups/:id/members?page=1&limit=20&status=active&role=admin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Group members retrieved successfully",
  "data": [
    {
      "_groupMemberId": "64abc...",
      "groupId": "64xyz...",
      "userId": {
        "_id": "64user...",
        "name": "John Doe",
        "email": "john@example.com",
        "profileImage": "url..."
      },
      "role": "owner",
      "status": "active",
      "joinedAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Specific Member

```http
GET /api/v1/groups/:groupId/members/:userId
Authorization: Bearer <token>
```

---

### 3. Add Member to Group

```http
POST /api/v1/groups/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "64user123...",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "code": 201,
  "message": "Member added successfully",
  "data": {
    "_groupMemberId": "...",
    "groupId": "...",
    "userId": "...",
    "role": "member",
    "status": "active"
  }
}
```

---

### 4. Update Member Role

```http
PUT /api/v1/groups/:groupId/members/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

**Note:** Only owner can promote/demote members

---

### 5. Remove Member

```http
DELETE /api/v1/groups/:groupId/members/:userId
Authorization: Bearer <token>
```

**Note:** Soft delete - sets `isDeleted: true`

---

### 6. Leave Group

```http
POST /api/v1/groups/:id/leave
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully left the group"
}
```

---

### 7. Get Member Count

```http
GET /api/v1/groups/:id/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 25
  }
}
```

---

### 8. Check Membership

```http
GET /api/v1/groups/:groupId/check/:userId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isMember": true
  }
}
```

---

## 🔄 Business Logic Flow

### Add Member Flow

```
1. Validate user authentication
2. Check group exists and is active
3. Verify user is not already a member
4. Check group is not full (currentMemberCount < maxMembers)
5. Create GroupMember document
6. Increment group's currentMemberCount
7. Invalidate Redis caches
8. Return membership
```

### Remove Member Flow

```
1. Validate user has permission (owner/admin)
2. Find membership record
3. If removing owner, verify there's another owner
4. Set isDeleted = true (soft delete)
5. Decrement group's currentMemberCount
6. Invalidate caches
7. Return removed membership
```

### Update Role Flow

```
1. Validate user is owner (only owner can change roles)
2. Find membership record
3. Update role field
4. Save changes
5. Invalidate cache
6. Return updated membership
```

---

## 🔐 Role Hierarchy & Permissions

### Role Hierarchy

```
owner (level 3) > admin (level 2) > member (level 1)
```

### Permission Matrix

| Permission | Owner | Admin | Member |
|------------|-------|-------|--------|
| Edit Group | ✅ | ✅ | ❌ |
| Delete Group | ✅ | ❌ | ❌ |
| Invite Members | ✅ | ✅ | ❌ |
| Remove Members | ✅ | ✅ | ❌ |
| Promote Members | ✅ | ❌ | ❌ |
| Demote Members | ✅ | ❌ | ❌ |
| Manage Settings | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| Manage Tasks | ✅ | ✅ | ✅ |

---

## 🗂️ File Structure

```
groupMember/
├── groupMember.interface.ts    # TypeScript interfaces
├── groupMember.constant.ts     # Constants and permissions
├── groupMember.model.ts        # Mongoose schema and model
├── groupMember.service.ts      # Business logic with Redis
├── groupMember.controller.ts   # HTTP request handlers
├── groupMember.route.ts        # Route definitions
└── ../doc/
    └── group-member.md         # This file
```

---

## 📊 Database Indexes

```javascript
// Primary: Find all members of a group
groupMemberSchema.index({ groupId: 1, status: 1, isDeleted: 1 });

// Find all groups for a user
groupMemberSchema.index({ userId: 1, status: 1, isDeleted: 1 });

// Prevent duplicate memberships (unique)
groupMemberSchema.index({ groupId: 1, userId: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDeleted: false } 
});

// Find members by role
groupMemberSchema.index({ groupId: 1, role: 1, status: 1 });

// Analytics: Track member growth
groupMemberSchema.index({ joinedAt: -1, groupId: 1 });
```

---

## 🏎️ Redis Caching

### Cache Keys

```
groupMember:group:{groupId}:members     // Member list (TTL: 3 min)
groupMember:group:{groupId}:user:{userId} // Single member (TTL: 5 min)
user:{userId}:groups                    // User's groups (TTL: 10 min)
```

### Cache Invalidation

Invalidated on:
- Member added
- Member removed
- Member role changed
- Member left group

---

## ⚠️ Important Business Rules

1. **Owner Protection**: Cannot remove the only owner - must transfer ownership first
2. **Unique Membership**: User can only be member of a group once
3. **Soft Delete**: Never hard delete membership records (audit trail)
4. **Auto Join Date**: `joinedAt` is auto-set on creation
5. **Immutable References**: `groupId` and `userId` cannot be changed
6. **Member Count Sync**: Group's `currentMemberCount` must stay in sync

---

## 🔍 Common Queries

### Find All Active Members

```javascript
GroupMember.find({
  groupId,
  status: 'active',
  isDeleted: false
}).populate('userId', 'name email profileImage');
```

### Find Owners/Admins

```javascript
GroupMember.find({
  groupId,
  role: { $in: ['owner', 'admin'] },
  status: 'active',
  isDeleted: false
});
```

### Count Members by Role

```javascript
GroupMember.aggregate([
  { $match: { groupId, status: 'active', isDeleted: false } },
  { $group: { _id: '$role', count: { $sum: 1 } } }
]);
```

---

## 🧪 Testing Guidelines

```javascript
// Unit tests:
// - Service: addMember validation (duplicate, group full)
// - Service: removeMember (owner protection)
// - Service: updateMemberRole (permission check)
// - Service: cache invalidation
// - Controller: role-based access control
```

---

**Last Updated**: 2026-03-06  
**Version**: 1.0.0
