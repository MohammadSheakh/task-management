# 📋 Task Module - Diagrams Index (v2.0)

**Last Updated**: 12-03-26  
**Version**: 2.0 - Complete  

---

## 📁 Folder Structure

```
dia/
├── 01-current-v2/          # Current v2.0 diagrams (ACTIVE)
├── 02-legacy-v1/           # Legacy v1.0 diagrams (REFERENCE)
└── README.md               # This index
```

---

## 📋 Current Diagrams (v2.0) ⭐

**Folder**: `01-current-v2/`

**Contains**: 9 comprehensive diagrams updated with:
- ✅ Socket.IO real-time integration
- ✅ Family activity broadcasting
- ✅ Real-time parent notifications
- ✅ TaskProgress integration
- ✅ Enhanced caching

### Diagram List (9 of 9)

| # | Diagram | File | Description |
|---|---------|------|-------------|
| 1 | **Schema** | `task-schema-v2.mermaid` | Task, SubTask, TaskProgress schemas |
| 2 | **System Architecture** | `task-system-architecture-v2.mermaid` | Complete system architecture |
| 3 | **Sequence** | `task-sequence-v2.mermaid` | 8 sequence scenarios |
| 4 | **User Flow** | `task-user-flow-v2.mermaid` | Parent/Child flows |
| 5 | **Swimlane** | `task-swimlane-v2.mermaid` | Responsibility swimlanes |
| 6 | **State Machine** | `task-state-machine-v2.mermaid` | All state machines |
| 7 | **Component Architecture** | `task-component-architecture-v2.mermaid` | Component architecture |
| 8 | **Data Flow** | `task-data-flow-v2.mermaid` | Data flow diagram |
| 9 | **Deployment** | `task-deployment-v2.mermaid` | Deployment architecture |

---

## 📚 Legacy Diagrams (v1.0)

**Folder**: `02-legacy-v1/`

**Contains**: Original v1.0 diagrams (kept for historical reference)

**Note**: These diagrams are **outdated** and should only be used for:
- Historical reference
- Understanding migration path
- Comparing v1.0 vs v2.0 changes

---

## 🆕 What's New in v2.0 Diagrams

### New Components
- ✅ **Socket.IO Real-Time layer** - Instant task updates
- ✅ **TaskProgress collection** - Per-child progress tracking
- ✅ **Socket.IO State Cache** - 1 min TTL
- ✅ **Family Rooms** - Activity broadcasting
- ✅ **Task Rooms** - Task-specific updates

### Updated Components
- ✅ **Task Service** - Integrated Socket.IO
- ✅ **Cache Structure** - Added Socket.IO state
- ✅ **Service Layer** - Real-time with fallback

### New Data Sources
- ✅ **Socket.IO State** - Task subscribers, family rooms
- ✅ **TaskProgress collection** - Per-child progress

---

## 🎨 Diagram Conventions (v2.0)

### Color Coding

| Color | Meaning | Component |
|-------|---------|-----------|
| 🔵 Blue | User/Frontend | Flutter, Web, Admin |
| 🟢 Green | Business Logic | task.service, subtask.service |
| 🟠 Orange | API Gateway | Routes, Middleware |
| 🟣 Purple | Related Modules | User, CBU, Notification |
| 🔴 Red | Data Layer | MongoDB, Redis |
| 🟡 Yellow | Real-Time | Socket.IO, Events |
| ⚪ Gray | Cache | Task, Statistics, Socket.IO state |
| 🟢 Light Green | TaskProgress | taskProgress.service |

---

## 📝 Usage Guide

### Find Current Diagrams
```bash
cd src/modules/task.module/doc/dia/01-current-v2/
ls -1
# All 9 current v2.0 diagrams
```

### Find Legacy Diagrams
```bash
cd src/modules/task.module/doc/dia/02-legacy-v1/
ls -1
# All legacy v1.0 diagrams
```

---

## 🔗 Related Documentation

### Module Documentation
- [Architecture Guide (v2.0)](../TASK_MODULE_ARCHITECTURE-v2.md)
- [System Guide (v2.0)](../TASK_MODULE_SYSTEM_GUIDE-v2.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Update Summary](../COMPLETE_TASK_MODULE_V2_UPDATE_SUMMARY-12-03-26.md)

### Related Modules
- [TaskProgress Module](../../taskProgress.module/doc/)
- [childrenBusinessUser Module](../../childrenBusinessUser.module/doc/)
- [Notification Module](../../notification.module/doc/)
- [Analytics Module](../../analytics.module/doc/)
- [Socket.IO Guide](../../../../helpers/socket/SOCKET_IO_INTEGRATION.md)

### Global Documentation
- [Flow Documentation](../../../../flow/)
- [Postman Collections](../../../../postman-collections/)

---

## ✅ Status

**Diagrams**: ✅ **100% COMPLETE (9/9)**  
**Version**: ✅ **v2.0 Current**  
**Organization**: ✅ **v1.0 vs v2.0 separated**  
**Production Ready**: ✅ **YES**  

---

**Last Updated**: 12-03-26  
**Maintained By**: Backend Engineering Team  
**Status**: ✅ **ALL TASK MODULE DIAGRAMS UPDATED TO v2.0**
