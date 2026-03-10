# Group Module - Figma-Aligned API Endpoints

**Date:** 07-03-26  
**Version:** V1  
**Status:** ✅ Complete

---

## Overview

This document describes the new Figma-aligned API endpoints added to the `group.module` to support the **Primary/Secondary user model** shown in the Teacher/Parent Dashboard and App User (Children) interfaces.

---

## New Endpoints Summary

| # | Method | Endpoint | Purpose | Figma Reference |
|---|--------|----------|---------|-----------------|
| 12 | POST | `/api/v1/groups/:id/members/create` | Create member account | `create-child-flow.png` |
| 13 | PATCH | `/api/v1/groups/:id/members/:userId/profile` | Update member profile | `edit-child-flow.png` |

---

## Endpoint Details

### POST `/api/v1/groups/:id/members/create`

**Create Member Account (Direct Creation Flow)**

This endpoint allows Primary users (Group Owners/Admins) to directly create member accounts for children/team members without sending invitations.

#### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
```json
{
  "id": "group_id"
}
```

**Body:**
```json
{
  "username": "Alax Morgn",
  "email": "alaxmorgn121@gmail.com",
  "phoneNumber": "14164161631",
  "address": "USA",
  "gender": "male",
  "dateOfBirth": "2012-12-12",
  "age": 6,
  "supportMode": "calm",
  "notificationStyle": "gentle",
  "password": "SecurePass123"
}
```

#### Validation Rules

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `username` | string | ✅ Yes | 3-50 characters |
| `email` | string | ✅ Yes | Valid email, unique |
| `phoneNumber` | string | ❌ No | - |
| `address` | string | ❌ No | - |
| `gender` | enum | ✅ Yes | `male`, `female`, `other` |
| `dateOfBirth` | string | ✅ Yes | Format: `YYYY-MM-DD` |
| `age` | number | ✅ Yes | 1-150 |
| `supportMode` | enum | ✅ Yes | `calm`, `encouraging`, `logical` |
| `notificationStyle` | enum | ❌ No | `gentle`, `firm`, `xyz` (default: `gentle`) |
| `password` | string | ✅ Yes | Min 8 chars, must contain uppercase, lowercase, and number |

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Member account created successfully",
  "data": {
    "member": {
      "_id": "65f1234567890abcdef12345",
      "groupId": "65f1234567890abcdef67890",
      "userId": "65f1234567890abcdef11111",
      "role": "member",
      "status": "active",
      "permissions": {
        "canCreateTasks": false,
        "canInviteMembers": false,
        "canRemoveMembers": false,
        "grantedBy": "65f1234567890abcdef99999",
        "grantedAt": "2024-03-07T10:30:00.000Z"
      },
      "joinedAt": "2024-03-07T10:30:00.000Z",
      "isDeleted": false
    },
    "user": {
      "_id": "65f1234567890abcdef11111",
      "name": "Alax Morgn",
      "email": "alaxmorgn121@gmail.com",
      "phoneNumber": "14164161631",
      "role": "user",
      "profileId": "65f1234567890abcdef22222",
      "profileImage": {
        "imageUrl": "/uploads/users/user.png"
      },
      "isEmailVerified": false,
      "authProvider": "local",
      "isDeleted": false,
      "createdAt": "2024-03-07T10:30:00.000Z",
      "updatedAt": "2024-03-07T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

```json
// Group not found
{
  "success": false,
  "message": "Group not found"
}

// Group is full
{
  "success": false,
  "message": "This group has reached its maximum member capacity"
}

// Email already exists
{
  "success": false,
  "message": "A user with this email already exists"
}

// Unauthorized
{
  "success": false,
  "message": "Only owners and admins can create member accounts"
}
```

#### Business Logic Flow

```
1. Verify group exists and is active
2. Check group member limit
3. Verify creator has permission (owner/admin)
4. Check email uniqueness
5. Create UserProfile with supportMode & notificationStyle
6. Create User account
7. Link UserProfile to User
8. Add user to group as member (role: member)
9. Update group member count
10. Invalidate Redis cache
11. Queue welcome email (BullMQ async)
```

#### Scalability Features

- ✅ **Redis Cache Invalidation** - Clears cached member lists
- ✅ **Rate Limiting** - 100 requests/minute per user
- ✅ **BullMQ Email Queue** - Async welcome email (non-blocking)
- ✅ **Transaction-like Flow** - Sequential with rollback on error
- ✅ **Permission Checks** - Owner/Admin only

---

### PATCH `/api/v1/groups/:id/members/:userId/profile`

**Update Member Profile**

Allows Primary users to update member profile information including support mode and notification preferences.

#### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
```json
{
  "id": "group_id",
  "userId": "member_user_id"
}
```

**Body (All fields optional):**
```json
{
  "username": "Alax Morgn Updated",
  "email": "newemail@gmail.com",
  "phoneNumber": "14164161632",
  "address": "Canada",
  "gender": "male",
  "dateOfBirth": "2012-12-12",
  "age": 7,
  "supportMode": "encouraging",
  "notificationStyle": "firm"
}
```

#### Validation Rules

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `username` | string | ❌ No | 3-50 characters |
| `email` | string | ❌ No | Valid email, unique across platform |
| `phoneNumber` | string | ❌ No | - |
| `address` | string | ❌ No | - |
| `gender` | enum | ❌ No | `male`, `female`, `other` |
| `dateOfBirth` | string | ❌ No | Format: `YYYY-MM-DD` |
| `age` | number | ❌ No | 1-150 |
| `supportMode` | enum | ❌ No | `calm`, `encouraging`, `logical` |
| `notificationStyle` | enum | ❌ No | `gentle`, `firm`, `xyz` |

**Note:** At least one field must be provided for update.

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Member profile updated successfully",
  "data": {
    "_id": "65f1234567890abcdef11111",
    "name": "Alax Morgn Updated",
    "email": "newemail@gmail.com",
    "phoneNumber": "14164161632",
    "role": "user",
    "profileId": {
      "_id": "65f1234567890abcdef22222",
      "userId": "65f1234567890abcdef11111",
      "location": "Canada",
      "gender": "male",
      "dob": "2012-12-12T00:00:00.000Z",
      "supportMode": "encouraging",
      "notificationStyle": "firm"
    },
    "profileImage": {
      "imageUrl": "/uploads/users/user.png"
    },
    "isEmailVerified": false,
    "authProvider": "local",
    "isDeleted": false,
    "createdAt": "2024-03-07T10:30:00.000Z",
    "updatedAt": "2024-03-07T11:45:00.000Z"
  }
}
```

**Error Responses:**

```json
// Member not found
{
  "success": false,
  "message": "Member not found in this group"
}

// Email already in use
{
  "success": false,
  "message": "Email already in use by another user"
}

// Unauthorized
{
  "success": false,
  "message": "Only owners and admins can update member profiles"
}

// No fields provided
{
  "success": false,
  "message": "At least one field must be provided for update"
}
```

#### Business Logic Flow

```
1. Verify updater has permission (owner/admin)
2. Verify member exists in group
3. Update User fields (if provided)
   - Check email uniqueness if changing
4. Update UserProfile fields (if provided)
5. Reload user with populated profile
6. Invalidate Redis cache
```

#### Scalability Features

- ✅ **Redis Cache Invalidation** - Clears cached member data
- ✅ **Rate Limiting** - 100 requests/minute per user
- ✅ **Selective Updates** - Only updates provided fields
- ✅ **Permission Checks** - Owner/Admin only
- ✅ **Email Uniqueness Validation** - Prevents conflicts

---

## Usage Examples

### Example 1: Create Member Account

```javascript
// Using fetch API
const response = await fetch('https://api.example.com/api/v1/groups/65f123/members/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'Jamie Chen',
    email: 'jamiechen@example.com',
    phoneNumber: '14164161631',
    address: 'USA',
    gender: 'female',
    dateOfBirth: '2015-06-15',
    age: 8,
    supportMode: 'encouraging',
    notificationStyle: 'gentle',
    password: 'SecurePass123'
  })
});

const data = await response.json();
console.log(data);
```

### Example 2: Update Member Profile

```javascript
// Using axios
const response = await axios.patch(
  'https://api.example.com/api/v1/groups/65f123/members/65f456/profile',
  {
    supportMode: 'logical',
    notificationStyle: 'firm'
  },
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
    }
  }
);

console.log(response.data);
```

---

## Permission Matrix

| Action | Owner | Admin | Member (Secondary) |
|--------|-------|-------|-------------------|
| Create member account | ✅ Yes | ✅ Yes | ❌ No |
| Update member profile | ✅ Yes | ✅ Yes | ❌ No (can only update self via other endpoint) |
| Delete member | ✅ Yes | ✅ Yes | ❌ No |

---

## Figma Flow Alignment

### Create Member Flow
```
Figma: team-members/create-child-flow.png

Teacher/Parent Dashboard:
  Team Members → Create Member → Fill Form
    ↓
  Backend: POST /groups/:id/members/create
    ↓
  Response: Member created + User account created
    ↓
  UI: Show success + Navigate to Team Members list
```

### Edit Member Flow
```
Figma: team-members/edit-child-flow.png

Teacher/Parent Dashboard:
  Team Members → Edit Member → Update Form
    ↓
  Backend: PATCH /groups/:id/members/:userId/profile
    ↓
  Response: Updated user profile
    ↓
  UI: Show success + Refresh member card
```

---

## Testing Checklist

- [ ] Create member with valid data
- [ ] Create member with duplicate email (should fail)
- [ ] Create member in full group (should fail)
- [ ] Create member as non-admin (should fail)
- [ ] Update member profile with all fields
- [ ] Update member email to existing email (should fail)
- [ ] Update member profile as non-admin (should fail)
- [ ] Verify Redis cache invalidation
- [ ] Verify welcome email is queued
- [ ] Verify support mode is saved correctly
- [ ] Verify notification style is saved correctly

---

## Next Steps

### Phase 2: Enhanced Features
- [ ] `GET /api/v1/tasks/daily-progress` - Daily progress endpoint
- [ ] `GET /api/v1/notifications/activity-feed/:groupId` - Live activity feed

### Phase 3: Documentation
- [ ] Update swimlane diagrams
- [ ] Create Postman collection
- [ ] Add integration tests

---

*Generated: 07-03-26*
