# 🔍 Backend-Frontend Alignment Report

**Date**: 2026-03-06
**Status**: ⚠️ REVIEW REQUIRED

---

## Executive Summary

I've conducted a thorough review of the generated backend code against the Flutter app and Website flows. This report identifies **critical misalignments**, **missing features**, and **recommendations** to ensure the backend properly supports the frontend applications.

---

## 1. Task Module Alignment

### ✅ What's Aligned

| Feature | Flutter App | Backend | Status |
|---------|-------------|---------|--------|
| Task Creation | ✅ `add_screen.dart` | ✅ `POST /tasks` | ✅ Aligned |
| Task List | ✅ `home_screen.dart` | ✅ `GET /tasks` | ✅ Aligned |
| Task Details | ✅ `task_details_screen.dart` | ✅ `GET /tasks/:id` | ✅ Aligned |
| Update Task | ✅ `edit_task_screen.dart` | ✅ `PUT /tasks/:id` | ✅ Aligned |
| Delete Task | ✅ `task_details_screen.dart` | ✅ `DELETE /tasks/:id` | ✅ Aligned |
| Subtasks | ✅ `SubTask` model | ✅ Subtask fields | ✅ Aligned |
| Task Status | ✅ `TaskStatus` enum | ✅ `TTaskStatus` enum | ✅ Aligned |

### ⚠️ Critical Issues Found

#### Issue #1: Task Model Field Mismatch

**Flutter Model (`task_model.dart`):**
```dart
class Task {
  final String title;
  final String description;
  final String time;              // ❌ Backend has 'startTime'
  final int? totalSubtasks;
  final int? completedSubtasks;
  final TaskStatus status;
  final DateTime createdAt;
  final DateTime startTime;
  final DateTime? completedTime;
  final List<SubTask> subtasks;   // ❌ Backend stores as array of strings
}
```

**Backend Model (`task.interface.ts`):**
```typescript
interface ITask {
  title: string;
  description?: string;
  scheduledTime?: string;         // ⚠️ Should be 'time' or add 'time' alias
  startTime: Date;                // ✅ Matches
  totalSubtasks?: number;
  completedSubtasks?: number;
  status: TTaskStatus;
  createdAt?: Date;
  completedTime?: Date;
  // ❌ Missing: subtasks array (currently stored as simple array)
}
```

**Impact**: 
- Flutter expects `time` field, backend uses `scheduledTime`
- Flutter has full `SubTask` objects, backend may not store detailed subtasks
- This will cause **data parsing errors** in Flutter app

**Recommendation**:
```typescript
// Add to task.interface.ts
subtasks?: ISubTask[];  // Full subtask objects

// Add alias in model transformation
time: scheduledTime     // API response should include 'time' for Flutter
```

---

#### Issue #2: SubTask Model Incomplete

**Flutter Model (`sub_task_model.dart`):**
```dart
class SubTask {
  final String title;
  final bool isCompleted;
  final String? duration;
}
```

**Backend**: 
- ❌ No dedicated SubTask model found
- ❌ Subtasks stored as simple strings or basic objects
- ❌ Missing `isCompleted` and `duration` fields

**Impact**:
- Cannot track individual subtask completion status
- Cannot store duration for each subtask
- Flutter UI for subtask progress will fail

**Recommendation**:
```typescript
// Create subtask.interface.ts
export interface ISubTask {
  title: string;
  isCompleted: boolean;
  duration?: string;
  completedAt?: Date;
  order: number;
}

// Add to task.model.ts
subtasks: [
  {
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    duration: { type: String },
    completedAt: { type: Date },
    order: { type: Number, default: 0 }
  }
]
```

---

#### Issue #3: Missing API Endpoints

**Flutter App Requires:**
1. ❌ `POST /tasks/:id/subtasks` - Add subtask individually
2. ❌ `PUT /tasks/:id/subtasks/:subtaskId` - Update subtask
3. ❌ `DELETE /tasks/:id/subtasks/:subtaskId` - Delete subtask
4. ❌ `POST /tasks/:id/complete` - Mark task complete (Flutter shows "Completed" button)
5. ❌ `GET /tasks/statistics` - Already exists but needs verification

**Current Backend Routes:**
- ✅ `PUT /tasks/:id/subtasks/progress` - Update all subtasks at once
- ✅ `PUT /tasks/:id/status` - Update status
- ✅ `GET /tasks/statistics` - Get statistics

**Impact**:
- Cannot add subtasks after task creation (Flutter allows this)
- Cannot delete individual subtasks
- Cannot mark task complete with confirmation dialog (Flutter flow)

**Recommendation**: Add missing endpoints to `task.route.ts`

---

#### Issue #4: Task Status Transition Logic

**Flutter Flow (`task_details_screen.dart`):**
```dart
// Shows "Completed" button only if task is NOT completed
if (!isCompleted) {
  ElevatedButton(
    onPressed: () {
      // Shows confirmation dialog
      SupportAlertCards.show();
      // Then navigate to MainBottomNav
    }
  )
}
```

**Backend (`task.constant.ts`):**
```typescript
enum TTaskStatus {
  pending = 'pending',
  inProgress = 'inProgress',
  completed = 'completed'
}
```

**Issue**: 
- ⚠️ Backend has `inProgress` status, but Flutter doesn't show transition to it
- Flutter jumps from `pending` → `completed`
- Backend middleware `validateStatusTransition` may block this

**Recommendation**:
1. Update Flutter to show "Start Task" button (pending → inProgress)
2. OR update backend to allow direct pending → completed transition
3. Add `completedTime` automatically when status becomes `completed`

---

### 📋 Task Module Action Items

| Priority | Issue | Action Required | Files to Update |
|----------|-------|-----------------|-----------------|
| 🔴 HIGH | SubTask model missing | Create full SubTask model with isCompleted, duration | `subtask.interface.ts`, `subtask.model.ts` |
| 🔴 HIGH | Field name mismatch | Add `time` alias for `scheduledTime` in API response | `task.controller.ts`, `task.interface.ts` |
| 🔴 HIGH | Missing subtask CRUD | Add individual subtask endpoints | `task.route.ts`, `task.controller.ts` |
| 🟡 MEDIUM | Status transition | Clarify pending→inProgress→completed flow | `task.constant.ts`, Flutter UI |
| 🟡 MEDIUM | Subtask storage | Store subtasks as objects, not strings | `task.model.ts` |

---

## 2. Notification Module Alignment

### ✅ What's Aligned

| Feature | Flutter App | Backend | Status |
|---------|-------------|---------|--------|
| Notification List | ✅ `notification_screen.dart` | ✅ `GET /notifications/my` | ✅ Aligned |
| Unread Count | ✅ Shows blue dot | ✅ `GET /notifications/unread-count` | ✅ Aligned |
| Mark as Read | ✅ Implicit in UI | ✅ `POST /notifications/:id/read` | ✅ Aligned |

### ⚠️ Issues Found

#### Issue #1: Notification Types Mismatch

**Flutter (`notification_screen.dart`):**
```dart
_dummyNotifications = [
  {
    'title': 'Task Completed',
    'message': '...',
  },
  {
    'title': 'Task Reminder',
    'message': '...',
  },
  {
    'title': 'New Task Assigned',
    'message': '...',
  },
  {
    'title': 'Task Deadline',
    'message': '...',
  },
]
```

**Backend (`notification.constant.ts`):**
```typescript
NOTIFICATION_TYPE = {
  TASK: 'task',
  GROUP: 'group',
  SYSTEM: 'system',
  REMINDER: 'reminder',
  MENTION: 'mention',
  ASSIGNMENT: 'assignment',
  DEADLINE: 'deadline',
}
```

**Status**: ✅ **ALIGNED** - Backend has all types Flutter expects

---

#### Issue #2: Missing Notification Features

**Flutter Shows:**
- ✅ Notification list with icons based on type
- ✅ Unread indicator (blue dot)
- ✅ Time formatting (min ago, hours ago, days ago)
- ❌ **Mark all as read** button (not in Flutter yet)
- ❌ **Notification settings** (mentioned in screen but not implemented)

**Backend Has:**
- ✅ `POST /notifications/read-all`
- ✅ `DELETE /notifications/:id`
- ✅ Multi-channel support (email, push, SMS)

**Recommendation**:
- Flutter needs to implement "Mark All as Read" UI
- Flutter needs notification settings screen
- Backend is ready, Flutter needs updates

---

### 📋 Notification Module Action Items

| Priority | Issue | Action Required | Files to Update |
|----------|-------|-----------------|-----------------|
| 🟢 LOW | Mark all as read | Add UI button in Flutter | Flutter `notification_screen.dart` |
| 🟢 LOW | Notification settings | Implement settings screen | Flutter (new screen) |
| 🟡 MEDIUM | Real-time notifications | Integrate Socket.IO in Flutter | Flutter (add socket service) |

---

## 3. Group Module Alignment

### ⚠️ Critical Finding: NO GROUP UI IN FLUTTER

**Backend Has:**
- ✅ Full Group CRUD
- ✅ GroupMember management
- ✅ GroupInvitation system
- ✅ BullMQ email invitations
- ✅ Role-based permissions (owner, admin, member)

**Flutter App:**
- ❌ **NO Group screens found**
- ❌ **NO Group models found**
- ❌ `group_user` folder exists but appears empty/incomplete

**Impact**:
- Group module is **100% backend-only** with no frontend
- Users cannot create or join groups from Flutter app
- All group features are unusable

---

### 📋 Group Module Action Items

| Priority | Issue | Action Required | Files to Create |
|----------|-------|-----------------|-----------------|
| 🔴 CRITICAL | No Group UI | Create complete Group UI in Flutter | `group_list_screen.dart`, `group_create_screen.dart`, `group_details_screen.dart` |
| 🔴 CRITICAL | No Group models | Create Group, GroupMember, GroupInvitation models | `group_model.dart`, `group_member_model.dart` |
| 🔴 CRITICAL | No Group API integration | Integrate backend Group APIs | Flutter API services |

---

## 4. Website Alignment

### ⚠️ Finding: Minimal Redux Integration

**Website (`apiSlice.js`):**
```javascript
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: url,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("X-Time-Zone", timeZone);
      }
      return headers;
    },
  }),
  tagTypes: ["Users", "Profile"],  // ⚠️ No Task, Group, Notification tags
  endpoints: () => ({}),  // ❌ EMPTY!
});
```

**Issues:**
1. ❌ No task endpoints defined
2. ❌ No notification endpoints defined
3. ❌ No group endpoints defined
4. ❌ Only "Users" and "Profile" tag types

**Impact**:
- Website cannot make API calls to backend
- Redux store not configured for task management
- Website is essentially disconnected from backend

---

### 📋 Website Action Items

| Priority | Issue | Action Required | Files to Update |
|----------|-------|-----------------|-----------------|
| 🔴 CRITICAL | No task API slice | Create `taskApiSlice.js` with all endpoints | `src/redux/api/taskApiSlice.js` |
| 🔴 CRITICAL | No notification API slice | Create `notificationApiSlice.js` | `src/redux/api/notificationApiSlice.js` |
| 🔴 CRITICAL | No group API slice | Create `groupApiSlice.js` | `src/redux/api/groupApiSlice.js` |
| 🟡 MEDIUM | Update tag types | Add Task, Group, Notification to tagTypes | `src/redux/api/apiSlice.js` |

---

## 5. Summary of Critical Issues

### 🔴 CRITICAL (Must Fix Before Launch)

1. **SubTask Model Incomplete** - Backend doesn't store subtasks properly
2. **Missing Subtask CRUD Endpoints** - Cannot add/delete subtasks individually
3. **No Group UI in Flutter** - Group module is unusable
4. **No Website API Integration** - Website disconnected from backend
5. **Field Name Mismatch** - `time` vs `scheduledTime` will break Flutter

### 🟡 MEDIUM (Should Fix)

1. **Status Transition Logic** - Clarify pending→inProgress→completed flow
2. **Real-time Notifications** - Add Socket.IO to Flutter
3. **Task Completion Flow** - Add "Start Task" button or allow direct completion

### 🟢 LOW (Nice to Have)

1. **Mark All as Read** - Add UI button in Flutter notifications
2. **Notification Settings** - Implement settings screen
3. **Task Statistics UI** - Ensure Flutter uses backend statistics endpoint

---

## 6. Recommended Next Steps

### Phase 1: Fix Critical Backend Issues (1-2 days)

1. ✅ Create proper SubTask model with `isCompleted`, `duration`
2. ✅ Add individual subtask CRUD endpoints
3. ✅ Add `time` field alias in API response
4. ✅ Ensure `completedTime` auto-set on task completion

### Phase 2: Fix Flutter Integration (3-5 days)

1. ✅ Update Task model to match backend
2. ✅ Update SubTask model
3. ✅ Implement subtask add/delete UI
4. ✅ Fix task completion flow
5. ✅ Add Socket.IO for real-time notifications

### Phase 3: Build Group UI (5-7 days)

1. ✅ Create Group models in Flutter
2. ✅ Create Group screens (list, create, details, members)
3. ✅ Integrate Group APIs
4. ✅ Implement invitation flow

### Phase 4: Fix Website Integration (2-3 days)

1. ✅ Create task API slice for Redux
2. ✅ Create notification API slice
3. ✅ Create group API slice
4. ✅ Update components to use Redux

---

## 7. File-by-File Backend Updates Required

### Files to Create:

```
src/modules/task.module/subtask/
├── subtask.interface.ts
├── subtask.constant.ts
├── subtask.model.ts
├── subtask.service.ts
├── subtask.controller.ts
└── subtask.route.ts
```

### Files to Update:

```
src/modules/task.module/task/
├── task.interface.ts          // Add subtasks: ISubTask[]
├── task.model.ts              // Update subtask schema
├── task.route.ts              // Add subtask CRUD routes
├── task.controller.ts         // Add subtask handlers
└── task.service.ts            // Add subtask methods
```

---

## 8. Testing Checklist

After fixes, verify:

- [ ] Create task with subtasks → Flutter displays correctly
- [ ] Add subtask to existing task → Backend saves, Flutter refreshes
- [ ] Delete subtask → Backend removes, Flutter updates UI
- [ ] Mark subtask complete → Progress bar updates
- [ ] Complete task → `completedTime` set, status changes
- [ ] Get notifications → Real-time via Socket.IO
- [ ] Create group → Invite members → Members accept
- [ ] Website loads tasks from backend

---

**Report Generated**: 2026-03-06
**Reviewed By**: Qwen Code Assistant
**Status**: ⚠️ AWAITING FIXES
