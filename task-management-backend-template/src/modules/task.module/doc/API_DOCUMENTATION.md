# Task Management Module Documentation

## 📋 Overview

This backend serves the Task Management System with support for both **Individual** and **Group/Collaborative** task management. Built with Node.js, TypeScript, Express, and MongoDB following clean architecture patterns.

---

## 🏗️ Architecture

### Module Structure
```
src/modules/task.module/
├── task/                    # Parent Task Module
│   ├── task.constant.ts     # Enums and constants
│   ├── task.interface.ts    # TypeScript interfaces
│   ├── task.model.ts        # Mongoose schema & model
│   ├── task.validation.ts   # Zod validation schemas
│   ├── task.service.ts      # Business logic (extends GenericService)
│   ├── task.controller.ts   # HTTP handlers (extends GenericController)
│   ├── task.middleware.ts   # Custom middleware functions
│   └── task.route.ts        # API routes with documentation
│
├── subTask/                 # SubTask Module
│   ├── subTask.constant.ts
│   ├── subTask.interface.ts
│   ├── subTask.model.ts
│   ├── subTask.validation.ts
│   ├── subTask.service.ts
│   ├── subTask.controller.ts
│   └── subTask.route.ts
│
└── doc/                     # Documentation
    └── API_DOCUMENTATION.md
```

---

## 🔐 Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

User Roles:
- `commonUser` - Regular users (student, mentor)
- `admin` - Administrators

---

## 📚 API Endpoints

### **Task Endpoints** (`/api/v1/tasks`)

#### 1. Create Task
```http
POST /tasks
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Complete Math Homework",
  "description": "Solve algebra, geometry and calculus problems",
  "taskType": "personal",
  "startTime": "2026-01-05T10:30:00.000Z",
  "scheduledTime": "10:30 AM",
  "priority": "high",
  "dueDate": "2026-01-07T23:59:59.000Z"
}
```

**Task Types:**
- `personal` - For yourself
- `singleAssignment` - Assigned to one person
- `collaborative` - Assigned to multiple people

**Response:**
```json
{
  "code": 201,
  "message": "Task created successfully",
  "data": {
    "_taskId": "507f1f77bcf86cd799439011",
    "title": "Complete Math Homework",
    "status": "pending",
    "createdById": "507f1f77bcf86cd799439010"
  },
  "success": true
}
```

---

#### 2. Get All My Tasks
```http
GET /tasks?status=pending&taskType=personal&priority=high&from=2026-01-01&to=2026-01-31
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: `pending`, `inProgress`, `completed` |
| taskType | string | Filter by type: `personal`, `singleAssignment`, `collaborative` |
| priority | string | Filter by priority: `low`, `medium`, `high` |
| from | date | Start date for filtering |
| to | date | End date for filtering |

**Response:**
```json
{
  "code": 200,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "_taskId": "507f1f77bcf86cd799439011",
      "title": "Complete Math Homework",
      "description": "Solve algebra problems",
      "status": "pending",
      "priority": "high",
      "taskType": "personal",
      "startTime": "2026-01-05T10:30:00.000Z",
      "totalSubtasks": 3,
      "completedSubtasks": 0,
      "completionPercentage": 0,
      "createdById": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "success": true
}
```

---

#### 3. Get Tasks with Pagination
```http
GET /tasks/paginate?page=1&limit=10&sortBy=-startTime
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Tasks retrieved successfully with pagination",
  "data": {
    "tasks": [...],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  },
  "success": true
}
```

---

#### 4. Get Task Statistics
```http
GET /tasks/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Task statistics retrieved successfully",
  "data": {
    "total": 15,
    "pending": 5,
    "inProgress": 3,
    "completed": 7
  },
  "success": true
}
```

---

#### 5. Get Daily Progress
```http
GET /tasks/daily-progress?date=2026-01-05
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Daily progress retrieved successfully",
  "data": {
    "date": "2026-01-05T00:00:00.000Z",
    "totalTasks": 3,
    "completedTasks": 1,
    "remainingTasks": 2,
    "completionPercentage": 33
  },
  "success": true
}
```

---

#### 6. Get Task by ID
```http
GET /tasks/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Task retrieved successfully",
  "data": {
    "_taskId": "507f1f77bcf86cd799439011",
    "title": "Complete Math Homework",
    "status": "inProgress",
    "totalSubtasks": 6,
    "completedSubtasks": 2,
    "completionPercentage": 33,
    "isOverdue": false,
    "createdById": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedUserIds": [
      {
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ]
  },
  "success": true
}
```

---

#### 7. Update Task
```http
PUT /tasks/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "priority": "medium",
  "dueDate": "2026-01-10T23:59:59.000Z"
}
```

---

#### 8. Update Task Status
```http
PUT /tasks/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed",
  "completedTime": "2026-01-07T10:50:00.000Z"
}
```

**Valid Status Transitions:**
- `pending` → `inProgress` or `completed`
- `inProgress` → `completed` or `pending`
- `completed` → (no transitions allowed)

---

#### 9. Update Subtask Progress
```http
PUT /tasks/:id/subtasks/progress
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "subtasks": [
    { "title": "Call with team", "isCompleted": false },
    { "title": "Client meeting", "isCompleted": true, "duration": "10 min" },
    { "title": "Team discuss", "isCompleted": true, "duration": "20 min" }
  ]
}
```

**Note:** This automatically updates the parent task's `totalSubtasks`, `completedSubtasks`, and `completionPercentage`. If all subtasks are completed, the task status is automatically set to `completed`.

---

#### 10. Delete Task (Soft Delete)
```http
DELETE /tasks/:id
Authorization: Bearer <token>
```

---

#### 11. Permanently Delete Task (Admin Only)
```http
DELETE /tasks/:id/permanent
Authorization: Bearer <admin_token>
```

---

### **SubTask Endpoints** (`/api/v1/subtasks`)

#### 1. Create SubTask
```http
POST /subtasks
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "taskId": "507f1f77bcf86cd799439011",
  "title": "Call with team",
  "description": "Discuss project requirements",
  "duration": "30 min",
  "assignedToUserId": "507f1f77bcf86cd799439010"
}
```

---

#### 2. Get All SubTasks for a Task
```http
GET /subtasks/task/:taskId?isCompleted=false
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Subtasks retrieved successfully",
  "data": [
    {
      "_subTaskId": "507f1f77bcf86cd799439012",
      "taskId": "507f1f77bcf86cd799439011",
      "title": "Call with team",
      "duration": "30 min",
      "isCompleted": false,
      "order": 1,
      "createdById": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "success": true
}
```

---

#### 3. Get SubTasks with Pagination
```http
GET /subtasks/task/:taskId/paginate?page=1&limit=10
Authorization: Bearer <token>
```

---

#### 4. Get SubTask Statistics
```http
GET /subtasks/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "data": {
    "total": 10,
    "completed": 6,
    "pending": 4,
    "completionPercentage": 60
  },
  "success": true
}
```

---

#### 5. Get SubTask by ID
```http
GET /subtasks/:id
Authorization: Bearer <token>
```

---

#### 6. Update SubTask
```http
PUT /subtasks/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "duration": "45 min"
}
```

---

#### 7. Toggle SubTask Status
```http
PUT /subtasks/:id/toggle-status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isCompleted": true
}
```

**Note:** This automatically updates the parent task's completion statistics.

---

#### 8. Delete SubTask
```http
DELETE /subtasks/:id
Authorization: Bearer <token>
```

---

## 🎯 Key Features

### 1. **Daily Task Limit (3-5 Tasks Philosophy)**
- Personal tasks are limited to 5 per day per user
- Enforced at the API level with `checkDailyTaskLimit` middleware
- Returns error if limit exceeded

### 2. **Task Type Validation**
- `personal`: Cannot have assigned users
- `singleAssignment`: Must have exactly 1 assigned user
- `collaborative`: Must have 2+ assigned users

### 3. **Automatic Progress Tracking**
- Subtask completion automatically updates parent task
- `completionPercentage` virtual field
- Auto-completes task when all subtasks are done

### 4. **Access Control**
- Users can only access tasks they created, own, or are assigned to
- Verified via `verifyTaskAccess` middleware
- Only creators/owners can modify tasks

### 5. **Status Transition Validation**
- Prevents invalid status changes
- Completed tasks cannot be reverted

---

## 📊 Database Schema

### Task Collection
```javascript
{
  _id: ObjectId,
  createdById: ObjectId (ref: User),
  ownerUserId: ObjectId (ref: User),
  taskType: "personal" | "singleAssignment" | "collaborative",
  assignedUserIds: [ObjectId (ref: User)],
  groupId: ObjectId (ref: Group),
  title: String (max 200),
  description: String (max 2000),
  scheduledTime: String,
  priority: "low" | "medium" | "high",
  status: "pending" | "inProgress" | "completed",
  totalSubtasks: Number,
  completedSubtasks: Number,
  startTime: Date,
  completedTime: Date,
  dueDate: Date,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### SubTask Collection
```javascript
{
  _id: ObjectId,
  taskId: ObjectId (ref: Task),
  createdById: ObjectId (ref: User),
  assignedToUserId: ObjectId (ref: User),
  title: String (max 200),
  description: String (max 1000),
  duration: String,
  isCompleted: Boolean,
  completedAt: Date,
  order: Number,
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
  "message": "Daily task limit reached. You already have 5 tasks scheduled for this day (max: 5)",
  "success": false
}
```

### 403 Forbidden
```json
{
  "code": 403,
  "message": "You do not have permission to access this task",
  "success": false
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "Task not found",
  "success": false
}
```

---

## 🧪 Testing with cURL

### Create a Personal Task
```bash
curl -X POST http://localhost:6733/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Math Homework",
    "description": "Solve algebra problems",
    "taskType": "personal",
    "startTime": "2026-01-05T10:30:00.000Z",
    "priority": "high"
  }'
```

### Get All Pending Tasks
```bash
curl -X GET "http://localhost:6733/api/v1/tasks?status=pending" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a SubTask
```bash
curl -X POST http://localhost:6733/api/v1/subtasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "507f1f77bcf86cd799439011",
    "title": "Call with team",
    "duration": "30 min"
  }'
```

---

## 📝 Notes

1. **Timezone Handling**: All dates are stored in UTC. Frontend should handle timezone conversion.
2. **Soft Delete**: Tasks and subtasks use `isDeleted` flag instead of hard deletion.
3. **Pagination**: Default limit is 10, max is 100.
4. **Sorting**: Use `-` prefix for descending order (e.g., `-startTime`).
5. **Population**: Related user fields are automatically populated in list views.

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

## 👨‍💻 Author

Created following the coding patterns and architecture of the existing backend template.
