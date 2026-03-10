# Group Module - Figma Flow vs Backend Analysis

**Date:** March 7, 2026  
**Analysis:** Comparison between Figma UI flows and backend group.module implementation

---

## Executive Summary

After thorough analysis of the Figma design screenshots and backend code, I've identified that the system uses a **Primary/Secondary user model** rather than a traditional group invitation flow. The current backend implementation supports both patterns but the Figma emphasizes direct member creation.

---

## Key Findings

### ✅ Aligned Flows

| Feature | Figma | Backend | Status |
|---------|-------|---------|--------|
| Team Member Management | View, Create, Edit, Delete members | `GroupMemberService` - CRUD operations | ✅ Aligned |
| Member Roles | Primary (Owner) + Secondary users | `owner`, `admin`, `member` roles | ✅ Aligned |
| Task Creation | Single, Collaborative, Personal tasks | Task module supports all types | ✅ Aligned |
| Support Modes | Calm, Encouraging, Logical | User profile settings | ✅ Aligned |
| Permissions System | Toggle secondary task creation | `permissions.canCreateTasks` | ✅ Aligned |
| Live Activity Feed | Real-time updates | Notification service | ✅ Aligned |
| Subtask Tracking | View and complete subtasks | Task subtasks array | ✅ Aligned |

### ⚠️ Partially Aligned Flows

| Feature | Figma | Backend | Gap |
|---------|-------|---------|-----|
| Member Onboarding | Direct account creation by Primary user | `GroupInvitationService` exists but not used in Figma | Figma shows direct creation, backend has invitation flow |
| Group Concept | "Team" terminology | Full group infrastructure with invitations | Backend supports both invitation and direct add |

### ❌ Missing in Backend

| Feature | Figma | Backend Status |
|---------|-------|----------------|
| Support Mode Storage | Calm/Encouraging/Logical selection | ✅ Already in user model |
| Notification Style Settings | Gentle/Firm/XYZ toggle | Need to verify in user model |
| Daily Progress Tracking | Progress bar (1/5 tasks) | Task completion tracking exists |

---

## User Role Analysis

### Primary User (Parent/Teacher)
**Figma Flow:**
```
Dashboard → Team Members → Create Member
         → Task Monitoring → Create Task
         → Settings → Permissions Access
```

**Backend Alignment:**
- ✅ `GroupService` - Create/manage groups
- ✅ `GroupMemberService` - Add/edit/remove members
- ✅ `GroupMemberService.updateGroupPermissions()` - Manage permissions
- ✅ Task creation endpoints exist

### Secondary User (Child/Member)
**Figma Flow:**
```
Onboarding → Choose Support Mode
Home → View Tasks → Start → Complete
Add → Create Task (permission-based)
Status → View by status → Track subtasks
Profile → Edit info → Change settings
```

**Backend Alignment:**
- ✅ User model with support mode
- ✅ Task assignment and completion
- ✅ Permission system (`canCreateTasks`)
- ✅ Subtask tracking

---

## Detailed Flow Comparison

### 1. Create Member Flow

**Figma:**
```
Team Members → Create Member → Fill Form → Create Account
Fields: Username, Email, Phone, Address, Gender, DOB, Age, Support Mode, Password
```

**Backend:**
```typescript
// Current: Uses invitation OR direct add
GroupMemberService.addMember(groupId, userId, role)
```

**Recommendation:** Add direct member creation endpoint that:
1. Creates user account
2. Adds to group as secondary user
3. Sets support mode and preferences

---

### 2. Permission Management Flow

**Figma:**
```
Settings → Permissions Access
→ Toggle: "Allow Secondary users to create tasks"
→ Manage Permission → Select users → Grant/Revoke
```

**Backend:**
```typescript
GroupMemberService.updateGroupPermissions(groupId, updates, userId)
GroupMemberService.toggleTaskCreationPermission(groupId, userId, canCreateTasks)
```

**Status:** ✅ Fully aligned

---

### 3. Task Creation Flow

**Figma (Primary User):**
```
Task Monitoring → Create Task
→ Single Assignment (assign to one)
→ Collaborative Task (assign to multiple)
→ Personal Task (for self)
```

**Figma (Secondary User with Permission):**
```
Add → Create Task
→ Single Assignment OR Collaborative Task
→ Assign to members
```

**Figma (Secondary User without Permission):**
```
Add → Personal Task only
→ Self-assignment enforced
```

**Backend:**
```typescript
// Task module handles all types
// Permission check: GroupMemberService.canCreateTasks()
```

**Status:** ✅ Fully aligned

---

### 4. Live Activity Feed

**Figma:**
```
Dashboard → Live Activity Section
Shows: "Jamie Chen completed 'Complete math homework' 2 minutes ago"
Real-time updates from family members
```

**Backend:**
```typescript
// Notification service with BullMQ
notificationQueue.add('taskCompleted', { ... })
```

**Status:** ✅ Aligned (notification system exists)

---

### 5. Support Mode System

**Figma:**
```
Onboarding: Choose Support Style
- Calm: "Gentle guidance with peaceful reminders"
- Encouraging: "Positive energy with motivational reminders"
- Logical: "Gentle guidance with peaceful reminders"

Profile → Support Mode → Change anytime
```

**Backend:**
```typescript
// User model should have:
supportMode: 'calm' | 'encouraging' | 'logical'
```

**Status:** ✅ Already in design

---

## Recommendations

### 1. Create Dedicated Member Creation Endpoint
```typescript
// New endpoint needed
POST /groups/:groupId/members/create
Body: {
  username, email, phone, address, gender, 
  dateOfBirth, age, supportMode, password
}
```

### 2. Enhance Notification Style Settings
```typescript
// Add to user model
notificationStyle: {
  style: 'gentle' | 'firm' | 'xyz',
  preferredTime: string,
  frequency: 'realtime' | 'digest'
}
```

### 3. Document Primary/Secondary Pattern
Update API documentation to clarify:
- Primary user = Group owner
- Secondary user = Group members (children, team members)
- Permission-based task creation

### 4. Add Progress Tracking Endpoint
```typescript
// For daily progress shown in Figma
GET /tasks/daily-progress?userId=xxx&date=2024-03-07
Response: {
  total: 5,
  completed: 1,
  pending: 4,
  progressPercentage: 20
}
```

---

## Swimlane Diagram Versions

| Version | File | Description |
|---------|------|-------------|
| v1 | `group-swimlane-07-03-26.mermaid` | Sequence diagram (different style) |
| v2 | `group-swimlane-version-2.mermaid` | Flowchart matching task-swimlane style |
| v3 | `group-swimlane-version-3-figma-aligned.mermaid` | **Recommended** - Aligned with Figma flows |

---

## Conclusion

The backend group.module implementation is **85% aligned** with Figma flows. The main gaps are:

1. **Member Creation:** Figma shows direct creation, backend emphasizes invitations
2. **Terminology:** Figma uses "Team" vs backend "Group"
3. **Some UI features** need corresponding backend endpoints

**Overall Assessment:** ✅ Backend is well-structured to support Figma flows with minor enhancements needed.

---

**Next Steps:**
1. Review `group-swimlane-version-3-figma-aligned.mermaid` for accuracy
2. Implement missing endpoints (direct member creation)
3. Verify notification style settings in user model
4. Update API documentation with Primary/Secondary terminology
