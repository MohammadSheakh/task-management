# 📋 Group Sub-Module Documentation

## Overview

The `group/` sub-module handles core group/team functionality including creation, retrieval, updates, and deletion of groups.

---

## 🏗️ Schema Design

### Group Entity

```
┌─────────────────────────────────────────────────────────┐
│                      GROUP                              │
├─────────────────────────────────────────────────────────┤
│ _id: ObjectId                                           │
│ name: String (required, max 100 chars)                  │
│ description: String (optional, max 1000 chars)          │
│ ownerUserId: ObjectId (ref: User, immutable)            │
│ visibility: Enum (private|public|inviteOnly)            │
│ maxMembers: Number (default: 100, max: 10000)           │
│ currentMemberCount: Number (auto-maintained)            │
│ avatarUrl: String (optional)                            │
│ coverImageUrl: String (optional)                        │
│ status: Enum (active|suspended|archived)                │
│ tags: String[] (max 20 tags)                            │
│ metadata: Mixed (extensible)                            │
│ isDeleted: Boolean (soft delete)                        │
│ createdAt: Date                                         │
│ updatedAt: Date                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### 1. Create Group

```http
POST /api/v1/groups
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Development Team",
  "description": "Core development team members",
  "visibility": "private",
  "maxMembers": 50
}
```

**Response:**
```json
{
  "success": true,
  "code": 201,
  "message": "Group created successfully",
  "data": {
    "_groupId": "64abc123...",
    "name": "Development Team",
    "ownerUserId": "64xyz789...",
    "visibility": "private",
    "maxMembers": 50,
    "currentMemberCount": 1,
    "status": "active"
  }
}
```

---

### 2. Get My Groups (Paginated)

```http
GET /api/v1/groups/my?page=1&limit=10&visibility=private&sortBy=-createdAt
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Groups retrieved successfully",
  "data": {
    "results": [...],
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalResults": 47
  }
}
```

---

### 3. Get Group by ID

```http
GET /api/v1/groups/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "_groupId": "64abc123...",
    "name": "Development Team",
    "description": "Core development team members",
    "ownerUserId": {
      "_id": "64xyz789...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "visibility": "private",
    "maxMembers": 50,
    "currentMemberCount": 12
  }
}
```

---

### 4. Update Group

```http
PUT /api/v1/groups/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Team Name",
  "description": "Updated description",
  "visibility": "inviteOnly"
}
```

---

### 5. Delete Group

```http
DELETE /api/v1/groups/:id
Authorization: Bearer <token>
```

**Note:** Soft delete - sets `isDeleted: true`

---

### 6. Get Group Statistics

```http
GET /api/v1/groups/:id/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMembers": 12,
    "maxMembers": 50,
    "isFull": false,
    "utilizationPercentage": 24,
    "status": "active",
    "visibility": "private"
  }
}
```

---

### 7. Search Groups

```http
GET /api/v1/groups/search?q=development&visibility=public&sortBy=-currentMemberCount
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_groupId": "...",
      "name": "Development Team",
      "currentMemberCount": 45,
      "visibility": "public"
    }
  ]
}
```

---

## 🔄 Business Logic Flow

### Create Group Flow

```
1. Validate user authentication
2. Check user hasn't exceeded MAX_GROUPS_PER_USER (50)
3. Validate group name uniqueness (case-insensitive)
4. Create group with ownerUserId
5. Set currentMemberCount = 1 (owner is first member)
6. Return created group
```

### Update Group Flow

```
1. Validate user is owner or admin
2. If name changed, validate uniqueness
3. Prevent ownerUserId change
4. Update group fields
5. Invalidate Redis cache
6. Return updated group
```

### Delete Group Flow

```
1. Validate user is owner
2. Set isDeleted = true (soft delete)
3. Invalidate all related caches
4. Return deleted group
```

---

## 🗂️ File Structure

```
group/
├── group.interface.ts       # TypeScript interfaces
├── group.constant.ts        # Constants and limits
├── group.model.ts           # Mongoose schema and model
├── group.service.ts         # Business logic with Redis caching
├── group.controller.ts      # HTTP request handlers
├── group.route.ts           # Route definitions with middleware
└── ../doc/
    ├── group-member.md      # This file
    ├── group-schema.mermaid # ER diagram
    └── group-flow.mermaid   # Sequence diagram
```

---

## 🔐 Permissions

| Operation | Owner | Admin | Member | Public |
|-----------|-------|-------|--------|--------|
| Create    | ✅    | ❌    | ❌     | ❌     |
| Read      | ✅    | ✅    | ✅     | ⚠️ (if public) |
| Update    | ✅    | ✅    | ❌     | ❌     |
| Delete    | ✅    | ❌    | ❌     | ❌     |
| Search    | ✅    | ✅    | ✅     | ⚠️ (public only) |

---

## 📊 Database Indexes

```javascript
// Performance optimization for 100K+ users
groupSchema.index({ ownerUserId: 1, isDeleted: 1, createdAt: -1 });
groupSchema.index({ visibility: 1, status: 1, isDeleted: 1 });
groupSchema.index({ name: 'text', description: 'text' }); // Text search
groupSchema.index({ status: 1, isDeleted: 1, updatedAt: -1 });
groupSchema.index({ currentMemberCount: -1, status: 1 });
```

---

## 🏎️ Redis Caching

### Cache Keys

```
group:{groupId}                    // Group data (TTL: 5 min)
user:{userId}:groups               // User's groups (TTL: 10 min)
group:{groupId}:memberCount        // Member count (TTL: 1 min)
```

### Cache Invalidation

Cache is invalidated on:
- Group update
- Group delete
- Member join/leave
- Member count change

---

## ⚠️ Important Notes

1. **Soft Delete**: Never hard delete groups - use `isDeleted: true`
2. **Owner Immutability**: `ownerUserId` cannot be changed after creation
3. **Name Uniqueness**: Group names must be unique per owner
4. **Member Count**: Auto-maintained via aggregation, cached in Redis
5. **Rate Limiting**: 5 groups per minute per user

---

## 🧪 Testing Guidelines

```javascript
// Unit tests needed:
// - Service: createGroup validation
// - Service: getGroupById cache hit/miss
// - Service: updateGroup cache invalidation
// - Controller: permission checks
// - Middleware: isGroupOwner, isGroupAdmin
```

---

**Last Updated**: 2026-03-06  
**Version**: 1.0.0
