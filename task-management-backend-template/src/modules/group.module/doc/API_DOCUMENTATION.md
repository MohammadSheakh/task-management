# Group Management Module - API Documentation

## 📋 Overview

Complete API documentation for the Group Management Module with support for **Family/Team** group management, member administration, and permission control.

**Base URL:** `{{baseUrl}}/v1`  
**Last Updated:** 10-03-26  
**Version:** 2.0

---

## 🏗️ Architecture

### Module Structure
```
src/modules/group.module/
├── group/                   # Parent Group Module
│   ├── group.constant.ts    # Enums and constants
│   ├── group.interface.ts   # TypeScript interfaces
│   ├── group.model.ts       # Mongoose schema & model
│   ├── group.service.ts     # Business logic
│   ├── group.controller.ts  # HTTP handlers
│   ├── group.middleware.ts  # Custom middleware
│   └── group.route.ts       # API routes
│
├── groupMember/             # Group Member Module
│   ├── groupMember.constant.ts
│   ├── groupMember.interface.ts
│   ├── groupMember.model.ts
│   ├── groupMember.service.ts
│   ├── groupMember.controller.ts
│   ├── groupMember.validation.ts
│   └── groupMember.route.ts
│
└── doc/                     # Documentation
    ├── API_DOCUMENTATION.md
    ├── group-roles-mapping.md
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
| `business` | Group owners, parents, teachers | Full group & member management |
| `child` | Group members, children/students | View own data, leave groups |
| `admin` | System administrators | Platform-wide oversight |

---

## 📚 Group Endpoints

**Base Path:** `/groups`

### 1. Create Group
```http
POST /groups
Authorization: Bearer <token>
Role: business
Rate Limit: 5 requests per minute
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Business user (parent/teacher) creates a family/team group

**Request Body:**
```json
{
  "name": "Smith Family",
  "description": "Our family task management group",
  "visibility": "private",
  "maxMembers": 5
}
```

**Visibility Options:**
| Type | Description |
|------|-------------|
| `private` | Only members can see the group |
| `public` | Anyone can see and request to join |
| `inviteOnly` | Only invited users can join |

**Response (201 Created):**
```json
{
  "code": 201,
  "message": "Group created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Smith Family",
    "description": "Our family task management group",
    "visibility": "private",
    "maxMembers": 5,
    "currentMemberCount": 1,
    "ownerUserId": "507f1f77bcf86cd799439010",
    "status": "active"
  },
  "success": true
}
```

---

### 2. Get My Groups
```http
GET /groups/my?visibility=private&status=active&page=1&limit=10&sortBy=-createdAt
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Business user retrieves their managed groups

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `visibility` | string | - | Filter: `private`, `public`, `inviteOnly` |
| `status` | string | - | Filter: `active`, `suspended`, `archived` |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max: 100) |
| `sortBy` | string | `-createdAt` | Sort field (`-` for descending) |

**Response:**
```json
{
  "code": 200,
  "message": "Groups retrieved successfully",
  "data": {
    "groups": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Smith Family",
        "description": "Our family task management group",
        "visibility": "private",
        "maxMembers": 5,
        "currentMemberCount": 4,
        "status": "active",
        "ownerUserId": {
          "_id": "507f1f77bcf86cd799439010",
          "name": "John Parent",
          "email": "john@example.com",
          "profileImage": "https://..."
        },
        "createdAt": "2026-01-01T10:00:00.000Z"
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

### 3. Get Group by ID
```http
GET /groups/:id
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group members only
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Retrieve specific group information

**Response:**
```json
{
  "code": 200,
  "message": "Group retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Smith Family",
    "description": "Our family task management group",
    "visibility": "private",
    "maxMembers": 5,
    "currentMemberCount": 4,
    "status": "active",
    "ownerUserId": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Parent",
      "email": "john@example.com",
      "profileImage": "https://..."
    },
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-05T14:00:00.000Z"
  },
  "success": true
}
```

---

### 4. Update Group
```http
PUT /groups/:id
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Group owner/admin updates group settings

**Request Body:**
```json
{
  "name": "Smith Family Updated",
  "description": "Updated description",
  "visibility": "inviteOnly",
  "maxMembers": 10
}
```

**Updatable Fields:**
- `name`, `description`, `visibility`
- `maxMembers`, `status`

**Response:**
```json
{
  "code": 200,
  "message": "Group updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Smith Family Updated",
    "description": "Updated description",
    "visibility": "inviteOnly",
    "maxMembers": 10,
    "currentMemberCount": 4,
    "status": "active"
  },
  "success": true
}
```

---

### 5. Delete Group (Soft Delete)
```http
DELETE /groups/:id
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner only
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Group owner deletes the group (soft delete)

**Response:**
```json
{
  "code": 200,
  "message": "Group deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isDeleted": true
  },
  "success": true
}
```

---

### 6. Get Group Statistics
```http
GET /groups/:id/statistics
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group members only
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Get member count, utilization, status stats

**Response:**
```json
{
  "code": 200,
  "message": "Group statistics retrieved successfully",
  "data": {
    "totalMembers": 4,
    "maxMembers": 5,
    "isFull": false,
    "utilizationPercentage": 80,
    "status": "active",
    "visibility": "private"
  },
  "success": true
}
```

---

### 7. Search Groups
```http
GET /groups/search?q=family&visibility=public&page=1&limit=10
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Search public/invite-only groups

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (group name/description) |
| `visibility` | string | Filter: `public`, `inviteOnly` |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "code": 200,
  "message": "Groups search completed successfully",
  "data": {
    "groups": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Johnson Family",
        "description": "Public family group",
        "visibility": "public",
        "currentMemberCount": 3,
        "maxMembers": 10
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  },
  "success": true
}
```

---

## 📚 GroupMember Endpoints

**Base Path:** `/groups/:id`

### 1. Get Group Members
```http
GET /groups/:id/members?status=active&role=member&page=1&limit=10
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group members only
```

**Figma Reference:** `team-member-flow-01.png`

**Description:** Group owner/admin retrieves all group members

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `active`, `inactive`, `blocked` |
| `role` | string | Filter: `owner`, `admin`, `member` |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "code": 200,
  "message": "Group members retrieved successfully",
  "data": {
    "members": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "groupId": "507f1f77bcf86cd799439011",
        "userId": {
          "_id": "507f1f77bcf86cd799439010",
          "name": "John Parent",
          "email": "john@example.com",
          "profileImage": "https://..."
        },
        "role": "owner",
        "status": "active",
        "joinedAt": "2026-01-01T10:00:00.000Z",
        "permissions": {
          "canCreateTasks": true,
          "canInviteMembers": true,
          "canRemoveMembers": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "totalPages": 1
    }
  },
  "success": true
}
```

---

### 2. Get Member Details
```http
GET /groups/:groupId/members/:userId
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group members only
```

**Figma Reference:** `team-member-flow-01.png`

**Description:** Retrieve individual member information

**Response:**
```json
{
  "code": 200,
  "message": "Member retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "groupId": "507f1f77bcf86cd799439011",
    "userId": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Parent",
      "email": "john@example.com",
      "profileImage": "https://..."
    },
    "role": "admin",
    "status": "active",
    "joinedAt": "2026-01-01T10:00:00.000Z",
    "permissions": {
      "canCreateTasks": true,
      "canInviteMembers": true,
      "canRemoveMembers": true,
      "grantedBy": "507f1f77bcf86cd799439010",
      "grantedAt": "2026-01-01T10:00:00.000Z"
    }
  },
  "success": true
}
```

---

### 3. Add Member to Group
```http
POST /groups/:id/members
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `team-member-flow-01.png`

**Description:** Group owner/admin adds a new member

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439013",
  "role": "member"
}
```

**Role Options:**
| Role | Description |
|------|-------------|
| `owner` | Full control (only group creator) |
| `admin` | Can manage members and settings |
| `member` | Regular member with limited permissions |

**Response:**
```json
{
  "code": 201,
  "message": "Member added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "groupId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439013",
    "role": "member",
    "status": "active",
    "joinedAt": "2026-01-05T10:00:00.000Z"
  },
  "success": true
}
```

---

### 4. Update Member Role
```http
PUT /groups/:groupId/members/:userId/role
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner only
```

**Figma Reference:** `team-member-flow-01.png`

**Description:** Group owner promotes/demotes member role

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Member role updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "groupId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439013",
    "role": "admin",
    "status": "active"
  },
  "success": true
}
```

---

### 5. Remove Member from Group
```http
DELETE /groups/:groupId/members/:userId
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `team-member-flow-01.png`

**Description:** Group owner/admin removes a member

**Response:**
```json
{
  "code": 200,
  "message": "Member removed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "isDeleted": true
  },
  "success": true
}
```

---

### 6. Leave Group (Self-Removal)
```http
POST /groups/:id/leave
Authorization: Bearer <token>
Role: child, business
Rate Limit: 100 requests per minute
Access: Group members only
```

**Figma Reference:** `home-flow.png`

**Description:** Child/secondary user leaves the group voluntarily

**Response:**
```json
{
  "code": 200,
  "message": "Successfully left the group",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "isDeleted": true
  },
  "success": true
}
```

---

### 7. Get Member Count
```http
GET /groups/:id/count
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group members only
```

**Figma Reference:** `dashboard-flow-01.png`

**Description:** Get total number of group members

**Response:**
```json
{
  "code": 200,
  "message": "Member count retrieved successfully",
  "data": {
    "count": 4
  },
  "success": true
}
```

---

### 8. Check Membership
```http
GET /groups/:groupId/check/:userId
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
```

**Figma Reference:** `team-member-flow-01.png`

**Description:** Verify user's membership status

**Response:**
```json
{
  "code": 200,
  "message": "Membership check completed",
  "data": {
    "isMember": true
  },
  "success": true
}
```

---

## 🔒 Group Permissions Endpoints

**Base Path:** `/groups/:id/permissions`

### 1. Get Group Permissions
```http
GET /groups/:id/permissions
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `permission-flow.png`

**Description:** Get which members have task creation permissions

**Response:**
```json
{
  "code": 200,
  "message": "Group permissions retrieved successfully",
  "data": {
    "groupId": "507f1f77bcf86cd799439011",
    "allowSecondaryTasks": true,
    "membersWithPermission": [
      {
        "_groupMemberId": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439013",
        "name": "Jane Child",
        "email": "jane@example.com",
        "profileImage": "https://...",
        "permissions": {
          "canCreateTasks": true,
          "canInviteMembers": false,
          "canRemoveMembers": false,
          "grantedAt": "2026-01-01T10:00:00.000Z"
        }
      }
    ]
  },
  "success": true
}
```

---

### 2. Update Group Permissions
```http
PUT /groups/:id/permissions
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `permission-flow.png`

**Description:** Grant/revoke task creation permissions for members

**Request Body:**
```json
{
  "memberPermissions": [
    {
      "userId": "507f1f77bcf86cd799439013",
      "canCreateTasks": true,
      "canInviteMembers": false,
      "canRemoveMembers": false
    }
  ]
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Group permissions updated successfully",
  "data": {
    "groupId": "507f1f77bcf86cd799439011",
    "allowSecondaryTasks": true,
    "membersWithPermission": [...]
  },
  "success": true
}
```

---

### 3. Toggle Task Creation Permission
```http
POST /groups/:id/permissions/toggle
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `permission-flow.png`

**Description:** Enable/disable task creation for a specific member

**Request Body:**
```json
{
  "memberId": "507f1f77bcf86cd799439012",
  "canCreateTasks": true
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Task creation permission granted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Jane Child",
      "email": "jane@example.com"
    },
    "permissions": {
      "canCreateTasks": true,
      "canInviteMembers": false,
      "canRemoveMembers": false
    }
  },
  "success": true
}
```

---

## 👥 Member Management Endpoints

**Base Path:** `/groups/:id/members`

### 1. Create Member Account
```http
POST /groups/:id/members/create
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `create-child-flow.png`

**Description:** Primary user creates a secondary user account and adds to group

**Request Body:**
```json
{
  "username": "Jane Child",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecurePass123!",
  "gender": "female",
  "dateOfBirth": "2010-01-15",
  "age": 16,
  "supportMode": "calm",
  "notificationStyle": "gentle"
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Member account created successfully",
  "data": {
    "member": {
      "_id": "507f1f77bcf86cd799439012",
      "groupId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439013",
      "role": "member",
      "status": "active"
    },
    "user": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Jane Child",
      "email": "jane@example.com",
      "role": "user"
    }
  },
  "success": true
}
```

---

### 2. Update Member Profile
```http
PATCH /groups/:id/members/:userId/profile
Authorization: Bearer <token>
Role: business
Rate Limit: 100 requests per minute
Access: Group owner/admin only
```

**Figma Reference:** `edit-child-flow.png`

**Description:** Primary user updates a member's profile information

**Request Body:**
```json
{
  "username": "Jane Child Updated",
  "email": "jane.updated@example.com",
  "phoneNumber": "+1234567890",
  "supportMode": "encouraging",
  "notificationStyle": "firm"
}
```

**Updatable Fields:**
- `username`, `email`, `phoneNumber`
- `address`, `gender`, `dateOfBirth`, `age`
- `supportMode`, `notificationStyle`

**Response:**
```json
{
  "code": 200,
  "message": "Member profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Jane Child Updated",
    "email": "jane.updated@example.com",
    "phoneNumber": "+1234567890",
    "profile": {
      "supportMode": "encouraging",
      "notificationStyle": "firm"
    }
  },
  "success": true
}
```

---

## 🎯 Key Features

### 1. Subscription-Based Group Limits
- Business users need active subscription to create groups
- Group size limited by subscription plan
- Enforced at API level

```json
{
  "code": 400,
  "message": "You must have an active business subscription to add children accounts",
  "success": false
}
```

### 2. Role Hierarchy
```
OWNER (Group Creator)
  ├─ Can delete group
  ├─ Can promote/demote members
  ├─ Can manage all settings
  └─ Can remove any member

ADMIN (Trusted Member)
  ├─ Can add/remove members
  ├─ Can manage settings
  └─ Cannot delete group or remove owner

MEMBER (Regular User)
  ├─ Can view group info
  ├─ Can view own tasks
  └─ Can leave group (self-removal)
```

### 3. Permission System
- Secondary users need `canCreateTasks` permission for group tasks
- Permissions granted by group owner/admin
- Stored in `GroupMember.permissions`

### 4. Access Control
- Users can only access groups they're members of
- Only owners/admins can manage members
- Only owners can delete groups

---

## 📊 Database Schema

### Group Collection
```javascript
{
  _id: ObjectId,
  ownerUserId: ObjectId,           // References User
  name: String,                    // max 100
  description: String,             // max 1000
  visibility: String,              // 'private' | 'public' | 'inviteOnly'
  maxMembers: Number,
  currentMemberCount: Number,
  status: String,                  // 'active' | 'suspended' | 'archived'
  avatarUrl: String,
  coverImageUrl: String,
  tags: [String],
  metadata: Object,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### GroupMember Collection
```javascript
{
  _id: ObjectId,
  groupId: ObjectId,               // References Group
  userId: ObjectId,                // References User
  role: String,                    // 'owner' | 'admin' | 'member'
  status: String,                  // 'active' | 'inactive' | 'blocked'
  joinedAt: Date,
  note: String,                    // max 500
  permissions: {
    canCreateTasks: Boolean,
    canInviteMembers: Boolean,
    canRemoveMembers: Boolean,
    grantedBy: ObjectId,
    grantedAt: Date
  },
  metadata: Object,
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
  "message": "You must have an active business subscription to create groups",
  "success": false
}
```

```json
{
  "code": 400,
  "message": "This group has reached its maximum member capacity",
  "success": false
}
```

### 403 Forbidden
```json
{
  "code": 403,
  "message": "You do not have permission to access this group",
  "success": false
}
```

```json
{
  "code": 403,
  "message": "Only owners and admins can create member accounts",
  "success": false
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Group not found",
  "success": false
}
```

```json
{
  "code": 404,
  "message": "Member not found in this group",
  "success": false
}
```

---

## 🧪 Testing with cURL

### Create a Group
```bash
curl -X POST http://localhost:6733/api/v1/groups \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smith Family",
    "description": "Our family task management group",
    "visibility": "private",
    "maxMembers": 5
  }'
```

### Get My Groups
```bash
curl -X GET "http://localhost:6733/api/v1/groups/my" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Add Member to Group
```bash
curl -X POST http://localhost:6733/api/v1/groups/GROUP_ID/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "role": "member"
  }'
```

### Toggle Task Creation Permission
```bash
curl -X POST http://localhost:6733/api/v1/groups/GROUP_ID/permissions/toggle \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "MEMBER_ID",
    "canCreateTasks": true
  }'
```

---

## 📝 Notes

1. **Subscription Required**: Business users need active subscription to create/manage groups
2. **Soft Delete**: Groups and members use `isDeleted` flag instead of hard deletion
3. **Pagination**: Default limit is 10, max is 100
4. **Sorting**: Use `-` prefix for descending order (e.g., `-createdAt`)
5. **Population**: Related user fields auto-populated in list views
6. **Rate Limiting**: All endpoints have rate limiting configured
7. **Caching**: Frequently accessed data cached with Redis (5 min TTL for details, 3 min for lists)

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
