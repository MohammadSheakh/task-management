# 🔧 Legacy Flow Documents - Required Updates List

**Date**: 12-03-26  
**Status**: ⚠️ **NEEDS UPDATES**  

---

## 📋 Legacy Flow Documents Status

The following **v1.0 flow documents** contain **outdated references** that need to be fixed:

### Affected Documents:
1. ⚠️ `01-child-student-home-flow.md` (v1.0)
2. ⚠️ `02-business-parent-dashboard-flow.md` (v1.0)
3. ⚠️ `03-child-task-creation-flow.md` (v1.0)

---

## ✅ What Was Fixed

### Flow 01 (Child Home Screen) - ✅ FIXED in v1.5

**File**: `01-child-student-home-flow-v1.5.md` ✅

**Issues Fixed**:
- ✅ Base path: `/api/v1/` → `/v1/`
- ✅ Group endpoints removed (not used in this flow)
- ✅ Added TaskProgress endpoints reference
- ✅ Added Chart aggregation endpoints reference
- ✅ Updated permission structure reference
- ✅ Marked as legacy (see v2.0 for Socket.IO)

---

## ⚠️ Remaining Issues to Fix

### Flow 02 (Parent Dashboard) - ⚠️ NEEDS UPDATE

**File**: `02-business-parent-dashboard-flow.md` (v1.0)

**Issues to Fix**:

#### 1. Uses Old Group Endpoints ❌
```http
# WRONG (v1.0):
GET /api/v1/groups/:groupId/members
PUT /api/v1/groups/:groupId/members/:memberId/permissions

# CORRECT (should be):
GET /v1/children-business-user/children
PUT /v1/children-business-user/set-secondary-user
```

**Fix Required**:
- Replace all `/api/v1/groups/` → `/v1/children-business-user/`
- Update permission logic for Secondary User flag

---

#### 2. Missing TaskProgress Endpoints ❌

**Add These Endpoints**:
```http
# Task Progress Tracking (NEW!)
GET  /v1/task-progress/:taskId/children
GET  /v1/task-progress/child/:childId/tasks
PUT  /v1/task-progress/:taskId/status
PUT  /v1/task-progress/:taskId/subtasks/:index/complete
```

**Where to Add**:
- Add new section: "Task Progress Monitoring"
- Include request/response examples
- Update sequence diagram

---

#### 3. Missing Chart Aggregation Endpoints ❌

**Add These 10 Endpoints**:
```http
# Admin Dashboard Charts
GET /v1/analytics/charts/user-growth?days=30
GET /v1/analytics/charts/task-status
GET /v1/analytics/charts/monthly-income?months=12
GET /v1/analytics/charts/user-ratio

# Parent Dashboard Charts
GET /v1/analytics/charts/family-activity/:businessUserId?days=7
GET /v1/analytics/charts/child-progress/:businessUserId
GET /v1/analytics/charts/status-by-child/:businessUserId

# Task Monitoring Charts
GET /v1/analytics/charts/completion-trend/:userId?days=30
GET /v1/analytics/charts/activity-heatmap/:userId?days=30
GET /v1/analytics/charts/collaborative-progress/:taskId
```

**Where to Add**:
- Add new section: "Analytics & Charts"
- Include Chart.js integration examples
- Update dashboard load flow

---

#### 4. Permission Structure Changed ❌

**Old Logic (v1.0)**:
```typescript
// Group-based permissions
if (groupMember.permissions.canCreateTasks) {
  return true;
}
```

**New Logic (should be)**:
```typescript
// childrenBusinessUser-based permissions
if (user.isSecondaryUser) {
  return true;  // Secondary user can create tasks
}
```

**Where to Fix**:
- Update "Permission Management" section
- Replace group permissions with Secondary User flag
- Add reference to childrenBusinessUser module

---

#### 5. Base Path Inconsistency ❌

**Inconsistent Usage**:
```
/api/v1/tasks          ❌ Wrong
/v1/tasks              ✅ Correct
```

**Fix Required**:
- Search & replace all `/api/v1/` → `/v1/`
- Ensure consistency throughout document

---

### Flow 03 (Child Task Creation) - ⚠️ NEEDS UPDATE

**File**: `03-child-task-creation-flow.md` (v1.0)

**Issues to Fix**:

#### 1. Uses Old Group Endpoints ❌

**Wrong (v1.0)**:
```http
GET /api/v1/groups/my-groups
GET /api/v1/groups/:groupId/members
```

**Correct (should be)**:
```http
GET /v1/children-business-user/children
```

---

#### 2. Permission Logic Outdated ❌

**Old (v1.0)**:
```typescript
// Group-based permission checking
const groupMembership = user.groupMemberships.find(g => g.groupId === targetGroupId);
return groupMembership?.permissions.canCreateTasks === true;
```

**New (should be)**:
```typescript
// childrenBusinessUser-based permission
if (user.isSecondaryUser) {
  return true;  // Can create ALL task types
}
// Non-secondary user: Personal tasks only
return taskType === 'personal';
```

---

#### 3. Missing Secondary User Flow ❌

**Add New Section**:
```markdown
## Permission Check: Secondary User

### Check if Child is Secondary User
GET /v1/children-business-user/children
Authorization: Bearer {{parentToken}}

Response:
{
  "docs": [
    {
      "childUserId": "child001",
      "isSecondaryUser": true  // Can create tasks for family
    }
  ]
}
```

---

#### 4. Missing TaskProgress Reference ❌

**Add Reference**:
```markdown
## Related: Task Progress Tracking

For granular progress tracking with real-time parent notifications, use:
- PUT /v1/task-progress/:taskId/subtasks/:index/complete
- See Flow 05 (v2.0) for complete documentation
```

---

#### 5. Base Path Inconsistency ❌

Same as Flow 02 - replace all `/api/v1/` → `/v1/`

---

## 📝 Recommended Action Plan

### Option 1: Create v1.5 Versions (Recommended)
**Pros**:
- ✅ Preserves original v1.0 as historical reference
- ✅ Clear versioning (v1.0 → v1.5)
- ✅ Can add "See v2.0 for Socket.IO" notes
- ✅ No breaking changes for existing users

**Cons**:
- ⚠️ More files to maintain
- ⚠️ Slightly confusing for new users

**Files to Create**:
1. ✅ `01-child-student-home-flow-v1.5.md` - DONE!
2. ⏳ `02-business-parent-dashboard-flow-v1.5.md` - TODO
3. ⏳ `03-child-task-creation-flow-v1.5.md` - TODO

---

### Option 2: Update Existing Files
**Pros**:
- ✅ Fewer files to maintain
- ✅ Clear single source of truth

**Cons**:
- ❌ Breaks existing links/bookmarks
- ❌ Loses historical reference
- ❌ Confusing for users who have v1.0 printed/saved

**Files to Update**:
1. ⏳ `01-child-student-home-flow.md` - TODO
2. ⏳ `02-business-parent-dashboard-flow.md` - TODO
3. ⏳ `03-child-task-creation-flow.md` - TODO

---

### Option 3: Keep as-Is + Add Warning Notes
**Pros**:
- ✅ No work required
- ✅ Users warned about outdated info

**Cons**:
- ❌ Outdated documentation remains
- ❌ Confusing for developers
- ❌ May cause implementation errors

**Action**:
- Add warning banner at top of each v1.0 file:
```markdown
> ⚠️ **WARNING**: This document contains outdated references.
> - Uses old `/api/v1/` paths (should be `/v1/`)
> - Uses old group endpoints (now `/children-business-user/`)
> - Missing TaskProgress & Chart endpoints
> 
> **For updated version**: See Flow XX (v1.5) or Flow XX (v2.0) for Socket.IO
```

---

## ✅ What I Recommend

**Best Approach**: **Option 1** - Create v1.5 versions

**Why**:
1. ✅ Preserves history (v1.0 still available)
2. ✅ Clear upgrade path (v1.0 → v1.5 → v2.0)
3. ✅ Fixes all technical debt
4. ✅ Adds references to new endpoints
5. ✅ Points users to v2.0 for Socket.IO

**Work Required**:
- ✅ Flow 01 v1.5 - DONE!
- ⏳ Flow 02 v1.5 - ~30 minutes
- ⏳ Flow 03 v1.5 - ~30 minutes

---

## 📊 Impact Analysis

### If We Don't Fix:

**For Frontend Developers**:
- ❌ May implement wrong endpoints
- ❌ May use old permission logic
- ❌ May miss new TaskProgress features
- ❌ May miss new Chart endpoints

**For Backend Team**:
- ❌ Confusion about which endpoints to support
- ❌ May need to support both old & new endpoints
- ❌ Increased maintenance burden

**For QA**:
- ❌ Testing against wrong endpoints
- ❌ May miss critical features
- ❌ Test plans based on outdated docs

---

### If We Fix (Option 1):

**Benefits**:
- ✅ Clear, accurate documentation
- ✅ All new features documented
- ✅ Easy migration path to v2.0
- ✅ Reduced confusion
- ✅ Better developer experience

**Cost**:
- ⏳ ~1 hour of work
- ⏳ 2 new files to maintain

---

## 🎯 Decision Needed

**Question**: Should I proceed with creating v1.5 versions of Flow 02 and Flow 03?

**Estimated Time**: 1 hour total

**Deliverables**:
1. ✅ `01-child-student-home-flow-v1.5.md` - DONE!
2. ⏳ `02-business-parent-dashboard-flow-v1.5.md`
3. ⏳ `03-child-task-creation-flow-v1.5.md`
4. ⏳ Updated README with version matrix

---

**Status**: ⏳ **Awaiting Decision**  
**Recommendation**: ✅ **Proceed with Option 1 (Create v1.5 versions)**
