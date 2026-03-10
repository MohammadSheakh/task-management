# Group & GroupMember Modules - Role-Based Access Control Mapping

## Overview

This document defines the role-based access control (RBAC) for all group and group member endpoints in the Task Management system. These modules manage family/team groups and their memberships.

---

## Module Purpose

### Group Module
Manages family/team groups created by business users (parents/teachers):
- Create and manage family groups
- Group settings and configuration
- Group statistics and analytics

### GroupMember Module
Manages membership within groups:
- Add/remove members
- Role management (owner, admin, member)
- Permission management (task creation, invite, remove)
- Member profile management

---

## Role Definitions

| Role | Description | Dashboard | Access Level |
|------|-------------|-----------|--------------|
| `business` | Group owners, parents, teachers | Teacher/Parent Dashboard | Full group management |
| `child` | Group members, children | Mobile App (Child Interface) | Limited - view own data, leave group |
| `admin` | System administrators | Main Admin Dashboard | Platform-wide oversight |

---

## Role Hierarchy within Groups

```
┌─────────────────────────────────────────────┐
│              GROUP HIERARCHY                │
├─────────────────────────────────────────────┤
│  OWNER (Business User - Group Creator)      │
│    ├─ Can delete group                      │
│    ├─ Can promote/demote members            │
│    ├─ Can manage all settings               │
│    └─ Can remove any member (including admins)│
├─────────────────────────────────────────────┤
│  ADMIN (Business User - Trusted Member)     │
│    ├─ Can add/remove members                │
│    ├─ Can manage settings                   │
│    └─ Cannot delete group or remove owner   │
├─────────────────────────────────────────────┤
│  MEMBER (Child/Secondary User)              │
│    ├─ Can view group info                   │
│    ├─ Can view own tasks                    │
│    └─ Can leave group (self-removal)        │
└─────────────────────────────────────────────┘
```

---

## Group Module Routes

### 1. Create Group
```
POST /groups/
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `teacher-parent-dashboard/dashboard/dashboard-flow-01.png` |
| **Rate Limit** | 5 requests per minute |
| **Description** | Business user creates a family/team group |

**Request Body:**
```json
{
  "name": "Smith Family",
  "description": "Our family task management group",
  "visibility": "private",
  "maxMembers": 5
}
```

---

### 2. Get My Groups
```
GET /groups/my
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Get all groups owned/managed by business user |

**Query Parameters:**
- `visibility` - Filter by visibility (private, public, inviteOnly)
- `status` - Filter by status (active, suspended, archived)
- `page`, `limit`, `sortBy` - Pagination

---

### 3. Get Group by ID
```
GET /groups/:id
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Get detailed group information |

**Response Includes:**
- Group details (name, description, visibility)
- Owner information
- Member count
- Status

---

### 4. Update Group
```
PUT /groups/:id
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Update group settings |

**Updatable Fields:**
- `name`, `description`, `visibility`, `maxMembers`

---

### 5. Delete Group
```
DELETE /groups/:id
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner only) |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Soft delete a group |

**Business Logic:**
- Sets `isDeleted: true`
- Does not delete member records
- Invalidates all caches

---

### 6. Get Group Statistics
```
GET /groups/:id/statistics
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Get group member count and utilization |

**Response:**
```json
{
  "totalMembers": 3,
  "maxMembers": 5,
  "isFull": false,
  "utilizationPercentage": 60,
  "status": "active",
  "visibility": "private"
}
```

---

### 7. Search Groups
```
GET /groups/search?q=family
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Search public/invite-only groups |

---

## GroupMember Module Routes

### Membership Management

#### 1. Get Group Members
```
GET /groups/:id/members
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `team-member-flow-01.png` |
| **Rate Limit** | 100 requests per minute |

---

#### 2. Get Member Details
```
GET /groups/:groupId/members/:userId
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `team-member-flow-01.png` |
| **Rate Limit** | 100 requests per minute |

---

#### 3. Add Member to Group
```
POST /groups/:id/members
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `team-member-flow-01.png` |
| **Rate Limit** | 100 requests per minute |

**Request Body:**
```json
{
  "userId": "user123",
  "role": "member"
}
```

---

#### 4. Update Member Role
```
PUT /groups/:groupId/members/:userId/role
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner only) |
| **Figma** | `team-member-flow-01.png` |
| **Rate Limit** | 100 requests per minute |

**Request Body:**
```json
{
  "role": "admin"
}
```

---

#### 5. Remove Member
```
DELETE /groups/:groupId/members/:userId
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `team-member-flow-01.png` |
| **Rate Limit** | 100 requests per minute |

**Business Logic:**
- Cannot remove the only owner
- Soft delete (sets `isDeleted: true`)
- Decrements group member count

---

#### 6. Leave Group
```
POST /groups/:id/leave
```
| Attribute | Value |
|-----------|-------|
| **Role** | `child` |
| **Auth** | `TRole.commonUser` |
| **Figma** | `home-flow.png` |
| **Rate Limit** | 100 requests per minute |
| **Description** | Child/secondary user voluntarily leaves group |

**Note:** This is the ONLY route accessible to child users in the group module.

---

#### 7. Get Member Count
```
GET /groups/:id/count
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `dashboard-flow-01.png` |
| **Rate Limit** | 100 requests per minute |

---

#### 8. Check Membership
```
GET /groups/:groupId/check/:userId
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` |
| **Figma** | `team-member-flow-01.png` |
| **Rate Limit** | 100 requests per minute |

**Response:**
```json
{
  "isMember": true
}
```

---

### Permission Management

#### 9. Get Group Permissions
```
GET /groups/:id/permissions
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `permission-flow.png` |
| **Rate Limit** | 100 requests per minute |

**Response:**
```json
{
  "groupId": "grp123",
  "allowSecondaryTasks": true,
  "membersWithPermission": [
    {
      "_groupMemberId": "mem456",
      "userId": "user789",
      "name": "John Doe",
      "permissions": {
        "canCreateTasks": true,
        "canInviteMembers": false,
        "canRemoveMembers": false
      }
    }
  ]
}
```

---

#### 10. Update Group Permissions
```
PUT /groups/:id/permissions
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `permission-flow.png` |
| **Rate Limit** | 100 requests per minute |

**Request Body:**
```json
{
  "memberPermissions": [
    {
      "userId": "user789",
      "canCreateTasks": true,
      "canInviteMembers": false,
      "canRemoveMembers": false
    }
  ]
}
```

---

#### 11. Toggle Task Creation Permission
```
POST /groups/:id/permissions/toggle
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `permission-flow.png` |
| **Rate Limit** | 100 requests per minute |

**Request Body:**
```json
{
  "memberId": "mem456",
  "canCreateTasks": true
}
```

---

### Direct Member Creation & Profile Management

#### 12. Create Member Account
```
POST /groups/:id/members/create
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `create-child-flow.png` |
| **Rate Limit** | 100 requests per minute |

**Description:** Creates a new user account AND adds them to the group as a secondary user.

**Request Body:**
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890",
  "gender": "male",
  "dateOfBirth": "2010-01-15",
  "age": 16,
  "supportMode": "calm",
  "notificationStyle": "gentle"
}
```

**Business Logic:**
1. Verifies group exists and is active
2. Checks group is not full
3. Verifies creator has permission (owner/admin)
4. Creates UserProfile
5. Creates User account with `role: 'user'` (secondary)
6. Adds user to group as member
7. Updates group member count
8. Queues welcome email via BullMQ

---

#### 13. Update Member Profile
```
PATCH /groups/:id/members/:userId/profile
```
| Attribute | Value |
|-----------|-------|
| **Role** | `business` |
| **Auth** | `TRole.business` (owner/admin) |
| **Figma** | `edit-child-flow.png` |
| **Rate Limit** | 100 requests per minute |

**Description:** Updates a member's profile information (username, email, support mode, etc.)

**Updatable Fields:**
- `username`, `email`, `phoneNumber`
- `address`, `gender`, `dateOfBirth`, `age`
- `supportMode`, `notificationStyle`

---

## Role Access Matrix

### Group Module

```
┌─────────────────────────────────────┬───────┬──────────┬───────┐
│ Endpoint                            │ Admin │ Business │ Child │
├─────────────────────────────────────┼───────┼──────────┼───────┤
│ POST   /                            │  ❌   │    ✅    │   ❌  │
│ GET    /my                          │  ❌   │    ✅    │   ❌  │
│ GET    /:id                         │  ❌   │    ✅    │   ❌  │
│ PUT    /:id                         │  ❌   │    ✅    │   ❌  │
│ DELETE /:id                         │  ❌   │    ✅    │   ❌  │
│ GET    /:id/statistics              │  ❌   │    ✅    │   ❌  │
│ GET    /search                      │  ❌   │    ✅    │   ❌  │
└─────────────────────────────────────┴───────┴──────────┴───────┘
```

### GroupMember Module

```
┌─────────────────────────────────────┬───────┬──────────┬───────┐
│ Endpoint                            │ Admin │ Business │ Child │
├─────────────────────────────────────┼───────┼──────────┼───────┤
│ GET    /:id/members                 │  ❌   │    ✅    │   ❌  │
│ GET    /:groupId/members/:userId    │  ❌   │    ✅    │   ❌  │
│ POST   /:id/members                 │  ❌   │    ✅    │   ❌  │
│ PUT    /:groupId/members/:userId/role│ ❌   │    ✅    │   ❌  │
│ DELETE /:groupId/members/:userId    │  ❌   │    ✅    │   ❌  │
│ POST   /:id/leave                   │  ❌   │    ❌    │   ✅  │
│ GET    /:id/count                   │  ❌   │    ✅    │   ❌  │
│ GET    /:groupId/check/:userId      │  ❌   │    ✅    │   ❌  │
│ GET    /:id/permissions             │  ❌   │    ✅    │   ❌  │
│ PUT    /:id/permissions             │  ❌   │    ✅    │   ❌  │
│ POST   /:id/permissions/toggle      │  ❌   │    ✅    │   ❌  │
│ POST   /:id/members/create          │  ❌   │    ✅    │   ❌  │
│ PATCH  /:id/members/:userId/profile│  ❌   │    ✅    │   ❌  │
└─────────────────────────────────────┴───────┴──────────┴───────┘
```

---

## Data Models

### Group Collection

```typescript
{
  _id: ObjectId,
  ownerUserId: ObjectId,           // References User (business role)
  name: String,
  description: String,
  visibility: 'private' | 'public' | 'inviteOnly',
  maxMembers: Number,
  currentMemberCount: Number,
  status: 'active' | 'suspended' | 'archived',
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### GroupMember Collection

```typescript
{
  _id: ObjectId,
  groupId: ObjectId,               // References Group
  userId: ObjectId,                // References User
  role: 'owner' | 'admin' | 'member',
  status: 'active' | 'inactive' | 'blocked',
  joinedAt: Date,
  permissions: {
    canCreateTasks: Boolean,
    canInviteMembers: Boolean,
    canRemoveMembers: Boolean,
    grantedBy: ObjectId,
    grantedAt: Date
  },
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Caching Strategy

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `group:<id>` | 5 min | Group details |
| `group:<id>:members` | 3 min | Member list |
| `group:<id>:memberCount` | 1 min | Member count |
| `user:<id>:groups` | 10 min | User's groups |
| `groupMember:group:<id>:user:<userId>` | 5 min | Specific member |

**Cache Invalidation:**
- Create member → Invalidate group member list, member count
- Remove member → Invalidate all group caches
- Update permissions → Invalidate member list

---

## Security Considerations

### 1. Role Isolation
- Business users can only manage their own groups
- Child users can only view own data and leave groups
- No horizontal privilege escalation

### 2. Owner Protection
- Cannot remove the only owner from a group
- Must transfer ownership first

### 3. Group Capacity Enforcement
- Checks `currentMemberCount < maxMembers` before adding
- Prevents exceeding subscription limits

### 4. Permission Matrix
```
┌──────────────────────┬───────┬───────┬──────────┐
│ Permission           │ Owner │ Admin │ Member   │
├──────────────────────┼───────┼───────┼──────────┤
│ Edit Group           │   ✅  │   ✅  │    ❌    │
│ Delete Group         │   ✅  │   ❌  │    ❌    │
│ Invite Members       │   ✅  │   ✅  │    ❌    │
│ Remove Members       │   ✅  │   ✅  │    ❌    │
│ Promote Members      │   ✅  │   ❌  │    ❌    │
│ Manage Settings      │   ✅  │   ✅  │    ❌    │
│ View Analytics       │   ✅  │   ✅  │    ❌    │
│ Create Tasks         │   ✅  │   ✅  │    ⚠️    │
└──────────────────────┴───────┴───────┴──────────┘
```
⚠️ Members need explicit `canCreateTasks` permission

---

## Figma Asset References

All role assignments are based on:

```
/figma-asset/
└── teacher-parent-dashboard/
    ├── dashboard/
    │   └── dashboard-flow-01.png
    ├── team-members/
    │   ├── create-child-flow.png
    │   ├── edit-child-flow.png
    │   └── team-member-flow-01.png
    └── settings-permission-section/
        └── permission-flow.png
```

---

**Version:** 1.0.0  
**Last Updated:** 10-03-26  
**Author:** Senior Backend Engineering Team
