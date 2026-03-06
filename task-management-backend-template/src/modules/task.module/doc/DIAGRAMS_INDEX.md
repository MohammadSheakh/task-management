# 📊 Task Module - Diagrams Index

This file serves as an index for all Task Module diagrams. Each diagram is stored in a separate `.mermaid` file for better organization and maintainability.

---

## Module Level Diagrams

### 1. ER Diagram - Task Schema
**File:** [`task-schema.mermaid`](./task-schema.mermaid)

Shows the Task collection structure with relationships to User, Group, SubTask, TaskReminder, Notification, and Attachment.

**Key Entities:**
- Task (main collection)
- SubTask (child tasks)
- User (creator, assignee)
- Group (task grouping)
- TaskReminder (scheduled reminders)
- Notification (event triggers)
- Attachment (file uploads)

---

### 2. User Flow Diagram - Task Management
**File:** [`task-user-flow.mermaid`](./task-user-flow.mermaid)

Complete user flow for task operations including creation, viewing, updating, completing, and deleting tasks.

**Flow Phases:**
- Task Creation (with reminder setup)
- Viewing Tasks (filter/search)
- Updating Tasks (edit, status, subtasks)
- Task Completion (with proof upload)
- Task Deletion (with confirmation)

---

### 3. Swimlane Diagram - Task Assignment & Collaboration
**File:** [`task-swimlane.mermaid`](./task-swimlane.mermaid)

Shows collaboration between Task Creator, System, and Assignee with clear responsibility separation.

**Swimlanes:**
- 👤 Task Creator (identify, assign, review, close)
- ⚙️ System (validate, save, notify, track, remind)
- 👥 Assignee (receive, accept, work, complete, submit)

---

### 4. Sequence Diagram - Task Creation with Reminder
**File:** [`task-sequence.mermaid`](./task-sequence.mermaid)

Sequence of interactions for creating a task with optional reminder scheduling.

**Participants:**
- User
- Task API
- MongoDB
- Redis Cache
- BullMQ Queue
- Notification Service

---

### 5. State Machine - Task Status Flow
**File:** [`task-state-machine.mermaid`](./task-state-machine.mermaid)

Task lifecycle from creation to completion with all valid state transitions.

**States:**
- Draft → Pending → InProgress → UnderReview → Completed
- Cancelled (from Pending, InProgress, or UnderReview)

---

### 6. Component Architecture - Task Module
**File:** [`task-component-architecture.mermaid`](./task-component-architecture.mermaid)

Internal structure of task.module showing sub-modules and external dependencies.

**Components:**
- Task Sub-Module (Task, SubTask)
- Documentation (doc/)
- External Dependencies (Auth, User, Group, Notification, Attachment)

---

## Project Level Diagrams

### 7. System Architecture - Task Management Ecosystem
**File:** [`task-system-architecture.mermaid`](./task-system-architecture.mermaid)

High-level system architecture showing frontend, API gateway, backend services, async processing, and data layer.

**Layers:**
- 🖥️ Frontend (Flutter App, Web App)
- 🔌 API Gateway (Load Balancer, Rate Limiter, Auth)
- ⚙️ Backend Services (Task, Group, Notification, User, Attachment)
- 🔄 Async Processing (BullMQ, Workers)
- 💾 Data Layer (MongoDB, Redis, File Storage)

---

### 8. Data Flow - End-to-End Task Notification
**File:** [`task-data-flow.mermaid`](./task-data-flow.mermaid)

Data flow from trigger events through processing, delivery, and tracking.

**Stages:**
- 🎯 Trigger Events (Task Created, Assigned, Deadline, Completed)
- ⚙️ Processing (Event Publisher, Rules, Template, Channel Router)
- 📬 Delivery (In-App, Email, Push, SMS)
- 📊 Tracking (Delivery Status, Read Status, Analytics)

---

### 9. Deployment Architecture
**File:** [`task-deployment.mermaid`](./task-deployment.mermaid)

Production deployment architecture with Kubernetes, managed services, and external providers.

**Infrastructure:**
- ☁️ Cloud Infrastructure (Kubernetes Cluster with multiple pods)
- 🗄️ Managed Services (MongoDB Atlas, Redis Cloud, Cloud Storage)
- 🔌 External Services (Email, Push, SMS providers)

---

## Additional Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[task-diagrams.md](./task-diagrams.md)** - Legacy combined diagrams file (for reference)

---

## Diagram Quick Reference

| Diagram | Type | File | Use Case |
|---------|------|------|----------|
| ER Diagram | Database | `task-schema.mermaid` | Database design, relationships |
| User Flow | Flowchart | `task-user-flow.mermaid` | UX design, feature planning |
| Swimlane | Flowchart | `task-swimlane.mermaid` | Team collaboration, responsibilities |
| Sequence | Sequence | `task-sequence.mermaid` | API design, system interactions |
| State Machine | State Diagram | `task-state-machine.mermaid` | Status transitions, validation |
| Component | Architecture | `task-component-architecture.mermaid` | Module structure, dependencies |
| System Arch | Architecture | `task-system-architecture.mermaid` | System design, infrastructure |
| Data Flow | Flowchart | `task-data-flow.mermaid` | Data pipeline, event flow |
| Deployment | Architecture | `task-deployment.mermaid` | Production setup, scaling |

---

**Last Updated**: 2026-03-06
**Version**: 1.0.0
