# Group Module - Figma Alignment Implementation Plan

**Date:** March 7, 2026  
**Status:** Ready for Implementation  
**Approach:** Enhance existing `group.module` (NOT from scratch)

---

## Executive Decision: Enhance Current Module ✅

### Rationale

| Aspect | Current Module | From Scratch | Winner |
|--------|---------------|--------------|--------|
| **Redis Caching** | ✅ Fully implemented | ❌ Need to build | Current |
| **BullMQ Queue** | ✅ Configured | ❌ Need setup | Current |
| **Permission System** | ✅ Already exists | ❌ Need to design | Current |
| **Soft Delete** | ✅ Implemented | ❌ Need to add | Current |
| **Pagination** | ✅ Working | ❌ Need to implement | Current |
| **Type Safety** | ✅ TypeScript ready | ❌ All new types | Current |
| **Error Handling** | ✅ ApiError pattern | ❌ Need to build | Current |
| **Test Coverage** | ⚠️ May need updates | ❌ All new tests | Current |
| **Documentation** | ✅ JSDoc comments | ❌ All new docs | Current |
| **Development Time** | ~4-6 hours | ~16-24 hours | Current |

**Estimated Time Savings:** 12-18 hours

---

## Implementation Tasks

### Phase 1: User Model Enhancement (30 min)
**File:** `src/modules/user.module/user/user.interface.ts`

**Changes Needed:**
```typescript
// Add to IUser interface
supportMode?: 'calm' | 'encouraging' | 'logical';
notificationStyle?: 'gentle' | 'firm' | 'xyz';
preferredTime?: string; // For task reminders
```

**Status:** ⏳ Pending

---

### Phase 2: Group Member Service - Direct Member Creation (2 hours)

**File:** `src/modules/group.module/groupMember/groupMember.service.ts`

**New Method:**
```typescript
/**
 * Create Member Account (Primary User Flow)
 * Figma: team-members/create-child-flow.png
 * 
 * Creates a new user account AND adds to group as secondary user
 * 
 * @param groupId - Group ID
 * @param memberData - Member details
 * @param createdByUserId - Primary user creating the member
 * @returns Created member with user info
 */
async createMemberAccount(
  groupId: string,
  memberData: {
    username: string;
    email: string;
    phoneNumber: string;
    address?: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: Date;
    age: number;
    supportMode: 'calm' | 'encouraging' | 'logical';
    password: string;
  },
  createdByUserId: string
): Promise<IGroupMemberDocument & { user: IUser }>
```

**Implementation Steps:**
1. Validate group exists and is active
2. Check group member limit
3. Verify email uniqueness
4. Create UserProfile with supportMode/notificationStyle
5. Create User account
6. Add user to group as member
7. Update group member count
8. Invalidate cache
9. Return created member

---

### Phase 3: Group Member Controller - New Endpoint (30 min)

**File:** `src/modules/group.module/groupMember/groupMember.controller.ts`

**New Controller Method:**
```typescript
/**
 * Create Member Account
 * Primary User | GroupMember #09 | Create member account
 * Figma: team-members/create-child-flow.png
 * 
 * @param {string} id - Group ID
 * @body {string} username - Member username
 * @body {string} email - Member email
 * @body {string} phoneNumber - Phone number
 * @body {string} gender - Gender
 * @body {Date} dateOfBirth - Date of birth
 * @body {number} age - Age
 * @body {string} supportMode - Support mode preference
 * @body {string} password - Password
 */
createMemberAccount = async (req: Request, res: Response)
```

---

### Phase 4: Member Edit/Update Enhancement (1 hour)

**File:** `src/modules/group.module/groupMember/groupMember.service.ts`

**New/Update Method:**
```typescript
/**
 * Update Member Profile
 * Figma: team-members/edit-child-flow.png
 * 
 * Updates user profile fields (not group membership)
 */
async updateMemberProfile(
  groupId: string,
  userId: string,
  updateData: {
    username?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: Date;
    age?: number;
    supportMode?: 'calm' | 'encouraging' | 'logical';
  },
  updatedByUserId: string
): Promise<IUser>
```

---

### Phase 5: Daily Progress Endpoint (1 hour)

**File:** `src/modules/task.module/task.service.ts` (task module)

**New Method:**
```typescript
/**
 * Get Daily Progress for User
 * Figma: home-flow.png (Daily Progress: 1/5)
 * 
 * @param userId - User ID
 * @param date - Date (default: today)
 * @returns Progress data
 */
async getDailyProgress(
  userId: string,
  date?: Date
): Promise<{
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  progressPercentage: number;
  tasks: Array<{
    _id: string;
    title: string;
    status: string;
    subtasks?: {
      total: number;
      completed: number;
    };
  }>;
}>
```

---

### Phase 6: Live Activity Feed (1.5 hours)

**File:** `src/modules/notification.module/notification.service.ts`

**New Method:**
```typescript
/**
 * Get Live Activity Feed for Group
 * Figma: dashboard-flow-01.png (Live Activity section)
 * 
 * @param groupId - Group ID
 * @param limit - Number of activities (default: 10)
 * @returns Recent activities
 */
async getLiveActivityFeed(
  groupId: string,
  limit?: number
): Promise<Array<{
  type: 'task_completed' | 'task_started' | 'subtask_completed' | 'member_joined';
  actor: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  task?: {
    _id: string;
    title: string;
  };
  timestamp: Date;
  message: string;
}>>
```

---

### Phase 7: Routes Update (15 min)

**File:** `src/modules/group.module/groupMember/groupMember.route.ts`

**New Routes:**
```typescript
router.post(
  '/:id/members/create',
  validateRequest(GroupMemberValidation.createMemberAccount),
  auth(),
  groupMemberController.createMemberAccount
);

router.patch(
  '/:id/members/:userId/profile',
  validateRequest(GroupMemberValidation.updateMemberProfile),
  auth(),
  groupMemberController.updateMemberProfile
);
```

---

### Phase 8: Validation Schema (30 min)

**File:** `src/modules/group.module/groupMember/groupMember.validation.ts`

**New Validation:**
```typescript
export const GroupMemberValidation = {
  createMemberAccount: {
    body: z.object({
      username: z.string().min(3).max(50),
      email: z.string().email(),
      phoneNumber: z.string().optional(),
      gender: z.enum(['male', 'female', 'other']),
      dateOfBirth: z.string().isoDate(),
      age: z.number().min(1).max(150),
      supportMode: z.enum(['calm', 'encouraging', 'logical']),
      password: z.string().min(8),
    }),
  },
  // ... other validations
};
```

---

### Phase 9: Update Swimlane Documentation (15 min)

**File:** `src/modules/group.module/doc/group.module.drawio`

**Update:** Add direct member creation flow alongside invitation flow

---

## API Endpoints Summary

### New Endpoints

| Method | Endpoint | Purpose | Figma Reference |
|--------|----------|---------|-----------------|
| POST | `/api/v1/groups/:id/members/create` | Create member account | create-child-flow.png |
| PATCH | `/api/v1/groups/:id/members/:userId/profile` | Update member profile | edit-child-flow.png |
| GET | `/api/v1/groups/:id/activity-feed` | Get live activity | dashboard-flow-01.png |
| GET | `/api/v1/users/:id/daily-progress` | Get daily progress | home-flow.png |

### Existing Endpoints (No Changes)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/groups/my-groups` | Get user's groups |
| POST | `/api/v1/groups` | Create group |
| GET | `/api/v1/groups/:id/members` | Get members |
| POST | `/api/v1/groups/:id/invitations` | Invite members |
| POST | `/api/v1/invitations/:id/accept` | Accept invitation |
| PUT | `/api/v1/groups/:id/members/:userId/role` | Update role |
| DELETE | `/api/v1/groups/:id/members/:userId` | Remove member |
| GET | `/api/v1/groups/:id/permissions` | Get permissions |
| PUT | `/api/v1/groups/:id/permissions` | Update permissions |

---

## Testing Strategy

### Unit Tests
- [ ] `createMemberAccount()` - Test account creation flow
- [ ] `updateMemberProfile()` - Test profile updates
- [ ] `getDailyProgress()` - Test progress calculation
- [ ] `getLiveActivityFeed()` - Test activity aggregation

### Integration Tests
- [ ] Full member creation flow (UI → API → DB)
- [ ] Permission-based task creation
- [ ] Live activity feed updates

### E2E Tests (Optional)
- [ ] Cypress/Playwright tests for critical flows

---

## Migration Plan

### No Breaking Changes ✅

All existing endpoints remain functional. New endpoints are additive.

### Data Migration

**Not Required** - User profiles already support `supportMode` and `notificationStyle`.

### Backward Compatibility

- ✅ Invitation flow still works
- ✅ Direct member addition still works
- ✅ New direct creation is additional option

---

## Success Criteria

- [ ] All 9 phases completed
- [ ] Unit tests passing (>80% coverage)
- [ ] API documentation updated
- [ ] Figma flows fully supported
- [ ] No breaking changes to existing APIs
- [ ] Redis caching working for new endpoints
- [ ] BullMQ queue configured for notifications

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: User Model | 30 min | None |
| Phase 2: Member Creation Service | 2 hours | Phase 1 |
| Phase 3: Member Creation Controller | 30 min | Phase 2 |
| Phase 4: Member Update | 1 hour | Phase 1 |
| Phase 5: Daily Progress | 1 hour | Task module |
| Phase 6: Live Activity | 1.5 hours | Notification module |
| Phase 7: Routes | 15 min | Phase 3, 4 |
| Phase 8: Validation | 30 min | Phase 3, 4 |
| Phase 9: Documentation | 15 min | All phases |
| **Testing** | **2 hours** | All phases |
| **Total** | **~10 hours** | |

---

## Files to Create/Modify

### Modify (8 files)
1. `src/modules/user.module/user/user.interface.ts`
2. `src/modules/group.module/groupMember/groupMember.service.ts`
3. `src/modules/group.module/groupMember/groupMember.controller.ts`
4. `src/modules/group.module/groupMember/groupMember.route.ts`
5. `src/modules/group.module/groupMember/groupMember.validation.ts`
6. `src/modules/task.module/task.service.ts`
7. `src/modules/notification.module/notification.service.ts`
8. `src/modules/group.module/doc/group.module.drawio`

### Create (0 files)
- All work is enhancement of existing files

---

## Next Steps

1. ✅ **Approve this plan**
2. ⏳ **Implement Phase 1-3** (Member creation flow)
3. ⏳ **Implement Phase 4-6** (Enhanced features)
4. ⏳ **Implement Phase 7-9** (Routes & validation)
5. ⏳ **Write tests**
6. ⏳ **Update API documentation**
7. ⏳ **Test with Figma flows**

---

**Recommendation:** Start with Phase 1-3 to get the core member creation flow working, then iterate on enhanced features.

**Shall I proceed with the implementation?** 🚀
