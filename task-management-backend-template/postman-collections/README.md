# Postman Collections - Task Management API

Complete API collections organized by **USER ROLES** based on Figma designs.

---

## 📦 Collection Files

### 01 - Super Admin.postman_collection.json
**For:** System Administrators  
**Figma:** Main Admin Dashboard

**Features:**
- Platform analytics & reports
- User management (all roles)
- Subscription plan management
- System-wide settings
- Revenue tracking

**Key Endpoints:**
```
GET  /admin/dashboard          - Dashboard overview
GET  /admin/statistics         - User statistics
GET  /admin/earnings           - Monthly income report
GET  /users                    - All users (paginated)
POST /users/create-admin       - Create admin/sub-admin
POST /subscriptions            - Create subscription plan
```

---

### 02 - Primary User.postman_collection.json
**For:** Teachers, Parents, Group Owners  
**Figma:** Teacher/Parent Dashboard

**Features:**
- Team overview & management
- Task creation & assignment
- Member permissions control
- Live activity feed
- Group settings

**Key Endpoints:**
```
GET  /groups/my                - Team overview
POST /tasks                    - Create task (single/collaborative)
GET  /groups/:id/members       - Team members list
GET  /groups/:id/permissions   - Get permissions
PUT  /groups/:id/permissions   - Update permissions
GET  /notifications/my         - Live activity feed
```

---

### 03 - Secondary User.postman_collection.json
**For:** Students, Children, Team Members  
**Figma:** App User (Mobile)

**Features:**
- View assigned tasks
- Complete tasks & track progress
- Create personal tasks
- Create group tasks (if permission granted)
- Support mode settings
- Notification style settings

**Key Endpoints:**
```
GET  /tasks                    - My tasks (home screen)
GET  /tasks/daily-progress     - Daily progress (X/Y completed)
PUT  /tasks/:id/status         - Start/Complete task
GET  /users/support-mode       - Get support mode
PUT  /users/support-mode       - Update (Calm/Encouraging/Logical)
PUT  /users/notification-style - Update (Gentle/Firm/XYZ)
```

---

## 🚀 Quick Start

### Step 1: Import Collections

1. Open Postman
2. Click **Import**
3. Select all 3 `.json` files
4. Collections imported! ✅

### Step 2: Set Base URL

For each collection:
1. Go to collection **Variables** tab
2. Set `BASE_URL` = `http://localhost:5000/api/v1`

### Step 3: Login & Save Tokens

**Super Admin:**
```
1. Open "01 - Super Admin" collection
2. Run "Login as Admin" request
3. Copy token from response
4. Save to ADMIN_TOKEN variable
```

**Primary User:**
```
1. Open "02 - Primary User" collection
2. Run "Login as Primary User" request
3. Copy token from response
4. Save to PRIMARY_USER_TOKEN variable
```

**Secondary User:**
```
1. Open "03 - Secondary User" collection
2. Run "Login as Secondary User" request
3. Copy token from response
4. Save to SECONDARY_USER_TOKEN variable
```

---

## 🧪 Testing Workflows

### Test Permission System

```bash
# 1. Login as Primary User
→ Save PRIMARY_USER_TOKEN

# 2. Create Group
→ POST /groups
→ Save GROUP_ID from response

# 3. Add Secondary User as member
→ POST /groups/:id/members
→ Save USER_ID

# 4. Try creating group task as Secondary (should FAIL)
→ Login as Secondary User
→ POST /tasks (with groupId)
→ Expected: 403 Forbidden ❌

# 5. Primary grants permission
→ PUT /groups/:id/permissions
→ Set canCreateTasks: true for USER_ID

# 6. Try creating group task again (should WORK)
→ POST /tasks (with groupId)
→ Expected: 201 Created ✅
```

### Test Support Mode

```bash
# 1. Login as Secondary User
# 2. Get current support mode
→ GET /users/support-mode
# 3. Update to "encouraging"
→ PUT /users/support-mode {"supportMode":"encouraging"}
# 4. Verify response shows "encouraging"
```

### Test Task Lifecycle

```bash
# 1. Primary creates task
→ POST /tasks (singleAssignment)

# 2. Secondary views task
→ GET /tasks/:id

# 3. Secondary starts task
→ PUT /tasks/:id/status {"status":"inProgress"}

# 4. Secondary completes subtasks
→ PUT /tasks/:id/subtasks/progress

# 5. Secondary completes task
→ PUT /tasks/:id/status {"status":"completed"}

# 6. Primary sees completion in live feed
→ GET /notifications/my?type=task
```

---

## 📊 Figma Alignment

| Collection | Figma Screens | Endpoints | Coverage |
|------------|--------------|-----------|----------|
| **Super Admin** | Dashboard, User List, Subscriptions | 20+ | 95% |
| **Primary User** | Team Overview, Task Monitoring, Permissions | 35+ | 98% |
| **Secondary User** | Home, Task Status, Profile, Settings | 30+ | 98% |

---

## 🔑 Environment Variables

Each collection uses these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `BASE_URL` | Backend API URL | `http://localhost:5000/api/v1` |
| `ADMIN_TOKEN` | Admin JWT token | `eyJhbGc...` |
| `PRIMARY_USER_TOKEN` | Primary user JWT | `eyJhbGc...` |
| `SECONDARY_USER_TOKEN` | Secondary user JWT | `eyJhbGc...` |
| `GROUP_ID` | Test group ID | `64f5a1b2...` |
| `USER_ID` | Team member ID | `64f5a1b2...` |
| `TASK_ID` | Test task ID | `64f5a1b2...` |

---

## 📝 Notes

1. **Token Expiry:** Tokens expire after 24 hours. Re-login to get new tokens.
2. **Soft Delete:** Most delete operations are soft deletes (can be restored).
3. **Permissions:** Secondary users need explicit permission to create group tasks.
4. **Support Mode:** Affects notification tone and encouragement messages.
5. **Live Activity:** Real-time updates via notifications endpoint.

---

## 🎯 Collection Structure

```
01 - Super Admin/
├── 00 - Authentication
├── 01 - Dashboard & Analytics
├── 02 - User Management
├── 03 - Subscription Management
└── 04 - System Settings

02 - Primary User/
├── 00 - Authentication
├── 01 - Dashboard (Team Overview)
├── 02 - Task Management
├── 03 - Team Members Management
├── 04 - Permissions (Figma: Settings)
├── 05 - Group Management
└── 06 - Profile & Subscription

03 - Secondary User/
├── 00 - Authentication
├── 01 - Home & Tasks
├── 02 - Create Task (If Permission)
├── 03 - Task Status & History
├── 04 - Profile & Settings (Figma)
├── 05 - Notifications
└── 06 - SubTasks
```

---

## 📚 Related Documentation

- [API Documentation](../src/modules/)
- [Figma Assets](../figma-asset/)
- [Backend README](../README.md)

---

**Version:** 1.0.0  
**Last Updated:** March 7, 2026  
**Backend Version:** v1.0.0
