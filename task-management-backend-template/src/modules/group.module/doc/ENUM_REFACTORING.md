# Enum Refactoring - Group Module

## Overview

Refactored group module to use TypeScript enums instead of hardcoded string literals and const objects for better type safety and maintainability.

---

## Why Use Enums?

### Before (❌ Problem):
```typescript
// group.constant.ts
export const GROUP_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
} as const;

// group.interface.ts  
export type TGroupStatus = 'active' | 'suspended' | 'archived'; // Hardcoded!
```

**Problems:**
1. **DRY Violation**: Type is hardcoded separately from constant
2. **Maintenance Burden**: Must update both when adding new status
3. **No Type Safety**: Can use wrong string without compile error
4. **Inconsistency Risk**: Type and constant can get out of sync

### After (✅ Solution):
```typescript
// group.constant.ts
export enum GroupStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

// Type derived from enum
export type TGroupStatus = `${GroupStatus}`;
```

**Benefits:**
1. **Single Source of Truth**: Type derived from enum
2. **Type Safety**: Compile error if wrong value used
3. **Maintainability**: Add new status in one place
4. **IDE Support**: Autocomplete for enum values
5. **Refactoring**: Rename enum, all usages update automatically

---

## Changes Made

### ✅ group.constant.ts

**Added Enums:**
```typescript
export enum GroupVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  INVITE_ONLY = 'inviteOnly',
}

export enum GroupStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export enum GroupMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum GroupMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum GroupInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}
```

**Type Exports (derived from enums):**
```typescript
export type TGroupVisibility = `${GroupVisibility}`;
export type TGroupStatus = `${GroupStatus}`;
export type TGroupMemberRole = `${GroupMemberRole}`;
export type TGroupMemberStatus = `${GroupMemberStatus}`;
export type TGroupInvitationStatus = `${GroupInvitationStatus}`;
```

**Legacy Exports (for backward compatibility):**
```typescript
/** @deprecated Use GroupVisibility enum instead */
export const GROUP_VISIBILITY = GroupVisibility;

/** @deprecated Use GroupStatus enum instead */
export const GROUP_STATUS = GroupStatus;

/** @deprecated Use GroupMemberRole enum instead */
export const GROUP_MEMBER_ROLES = GroupMemberRole;

/** @deprecated Use GroupMemberStatus enum instead */
export const GROUP_MEMBER_STATUS = GroupMemberStatus;
```

---

### ✅ group.interface.ts

**Before:**
```typescript
import { Document, Types } from 'mongoose';

export type TGroupVisibility = 'private' | 'public' | 'inviteOnly';
export type TGroupStatus = 'active' | 'suspended' | 'archived';
```

**After:**
```typescript
import { Document, Types } from 'mongoose';
import { GroupVisibility, GroupStatus } from './group.constant';

export type TGroupVisibility = `${GroupVisibility}`;
export type TGroupStatus = `${GroupStatus}`;
```

---

### ✅ group.model.ts

**Import Changes:**
```typescript
// Before
import { GROUP_LIMITS, GROUP_VISIBILITY, GROUP_STATUS } from './group.constant';

// After
import { GROUP_LIMITS, GroupVisibility, GroupStatus } from './group.constant';
```

**Schema Definition:**
```typescript
// Before
visibility: {
  type: String,
  enum: Object.values(GROUP_VISIBILITY),
  default: GROUP_VISIBILITY.PRIVATE,
}

// After
visibility: {
  type: String,
  enum: Object.values(GroupVisibility),
  default: GroupVisibility.PRIVATE,
}
```

**Instance Methods:**
```typescript
// Before
groupSchema.methods.isAcceptingMembers = function (): boolean {
  return (
    this.status === GROUP_STATUS.ACTIVE &&
    this.visibility !== GROUP_VISIBILITY.PRIVATE &&
    this.currentMemberCount < this.maxMembers
  );
};

// After
groupSchema.methods.isAcceptingMembers = function (): boolean {
  return (
    this.status === GroupStatus.ACTIVE &&
    this.visibility !== GroupVisibility.PRIVATE &&
    this.currentMemberCount < this.maxMembers
  );
};
```

---

### ✅ group.service.ts

**Import Changes:**
```typescript
// Before
import { CACHE_CONFIG, GROUP_LIMITS, GROUP_STATUS } from './group.constant';

// After
import { CACHE_CONFIG, GROUP_LIMITS, GroupStatus } from './group.constant';
```

**Usage:**
```typescript
// Before
const query = {
  isDeleted: false,
  status: GROUP_STATUS.ACTIVE,
  $or: [{ ownerUserId: userId }],
};

// After
const query = {
  isDeleted: false,
  status: GroupStatus.ACTIVE,
  $or: [{ ownerUserId: userId }],
};
```

---

### ✅ group.controller.ts

**Import Changes:**
```typescript
// Before
import { GROUP_MEMBER_ROLES, GROUP_STATUS, GROUP_VISIBILITY } from './group.constant';

// After
import { GroupMemberRoles, GroupStatus, GroupVisibility } from './group.constant';
```

**Usage:**
```typescript
// Before
if (!groupData.visibility) {
  groupData.visibility = GROUP_VISIBILITY.PRIVATE;
}
if (!groupData.status) {
  groupData.status = GROUP_STATUS.ACTIVE;
}

// After
if (!groupData.visibility) {
  groupData.visibility = GroupVisibility.PRIVATE;
}
if (!groupData.status) {
  groupData.status = GroupStatus.ACTIVE;
}
```

---

### ✅ group.middleware.ts

**Import Changes:**
```typescript
// Before
import { GROUP_STATUS } from './group/group.constant';

// After
import { GroupStatus } from './group/group.constant';
```

**Usage:**
```typescript
// Before
if (group.status !== GROUP_STATUS.ACTIVE) {
  throw new ApiError(StatusCodes.BAD_REQUEST, 'This group is not active');
}

// After
if (group.status !== GroupStatus.ACTIVE) {
  throw new ApiError(StatusCodes.BAD_REQUEST, 'This group is not active');
}
```

---

## Files Updated

### Core Group Module
- ✅ `group.constant.ts` - Added enums, type exports, legacy constants
- ✅ `group.interface.ts` - Types derived from enums
- ✅ `group.model.ts` - Schema and methods use enums
- ✅ `group.service.ts` - All usages updated
- ✅ `group.controller.ts` - All usages updated
- ✅ `group.middleware.ts` - All usages updated

### GroupMember Module (⚠️ TODO)
- ⏳ `groupMember.constant.ts` - Needs enum conversion
- ⏳ `groupMember.model.ts` - Needs update
- ⏳ `groupMember.service.ts` - Needs update
- ⏳ `groupMember.controller.ts` - Needs update

---

## Benefits Summary

### Type Safety
```typescript
// ✅ Compile error if wrong value
const status: TGroupStatus = GroupStatus.ACTIVE;

// ❌ This would cause compile error now
const invalid: TGroupStatus = 'unknown'; // Error!
```

### Autocomplete
```typescript
// IDE shows all options
group.status = GroupStatus. // ← Shows: ACTIVE, SUSPENDED, ARCHIVED
```

### Maintainability
```typescript
// Add new status in ONE place
export enum GroupStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
  PENDING = 'pending', // ← Just add here!
}

// Type automatically includes it
export type TGroupStatus = `${GroupStatus}`; 
// Now includes: 'active' | 'suspended' | 'archived' | 'pending'
```

---

## Migration Guide

### For Existing Code

**If you see this:**
```typescript
import { GROUP_STATUS } from './group.constant';
const status = GROUP_STATUS.ACTIVE;
```

**Change to:**
```typescript
import { GroupStatus } from './group.constant';
const status = GroupStatus.ACTIVE;
```

### For New Code

**Always use enums:**
```typescript
// ✅ Good
import { GroupStatus } from './group.constant';
status: GroupStatus.ACTIVE

// ❌ Avoid
import { GROUP_STATUS } from './group.constant';
status: GROUP_STATUS.ACTIVE
```

---

## Next Steps

1. **Complete GroupMember Module** - Convert to enums like group module
2. **Update Tests** - Ensure all tests use new enum syntax
3. **Add ESLint Rule** - Warn on deprecated constant usage
4. **Documentation** - Update API docs to show enum values
5. **Remove Legacy** - In next major version, remove deprecated constants

---

**Version:** 1.0.0  
**Date:** 10-03-26  
**Author:** Senior Backend Engineering Team
