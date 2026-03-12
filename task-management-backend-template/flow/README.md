# 🔄 API Flow Documentation Index

**Project:** Task Management Backend  
**Purpose:** Map Figma screens to actual API endpoints  
**Last Updated:** 12-03-26  
**Version:** 2.0 - Organized Structure  

---

## 📁 Folder Structure

```
flow/
├── 01-child-home/                      # Child Home Screen flows
├── 02-parent-dashboard/                # Parent Dashboard flows
├── 03-child-task-creation/             # Child Task Creation flows
├── 04-parent-realtime-monitoring/      # Parent Real-Time Monitoring
├── 05-child-task-progress/             # Child Task Progress
├── 06-child-home-v2/                   # Child Home v2.0 (Socket.IO)
├── 07-parent-dashboard-v2/             # Parent Dashboard v2.0 (Socket.IO)
├── 08-child-task-creation-v2/          # Child Task Creation v2.0 (Socket.IO)
└── _docs/                              # Documentation & summaries
```

---

## 📋 Flow Documents by Feature

### Child Home Screen
| Version | File | Description | Status |
|---------|------|-------------|--------|
| v1.0 | `01-child-home/01-child-student-home-flow.md` | HTTP only (legacy) | ⚠️ Outdated |
| v1.5 | `01-child-home/01-child-student-home-flow-v1.5.md` | HTTP only (updated) | ✅ Current |
| v2.0 | `06-child-home-v2/06-child-home-realtime-v2.md` | HTTP + Socket.IO | ✅ Recommended |

---

### Parent Dashboard
| Version | File | Description | Status |
|---------|------|-------------|--------|
| v1.0 | `02-parent-dashboard/02-business-parent-dashboard-flow.md` | HTTP only (legacy) | ⚠️ Outdated |
| v1.5 | `02-parent-dashboard/02-business-parent-dashboard-flow-v1.5.md` | HTTP only (updated) | ✅ Current |
| v2.0 | `07-parent-dashboard-v2/07-parent-dashboard-realtime-v2.md` | HTTP + Socket.IO | ✅ Recommended |

---

### Child Task Creation
| Version | File | Description | Status |
|---------|------|-------------|--------|
| v1.0 | `03-child-task-creation/03-child-task-creation-flow.md` | HTTP only (legacy) | ⚠️ Outdated |
| v1.5 | `03-child-task-creation/03-child-task-creation-flow-v1.5.md` | HTTP only (updated) | ✅ Current |
| v2.0 | `08-child-task-creation-v2/08-child-task-creation-realtime-v2.md` | HTTP + Socket.IO | ✅ Recommended |

---

### Parent Real-Time Monitoring
| Version | File | Description | Status |
|---------|------|-------------|--------|
| v2.0 | `04-parent-realtime-monitoring/04-parent-dashboard-realtime-monitoring-flow.md` | HTTP + Socket.IO | ✅ Complete |

---

### Child Task Progress
| Version | File | Description | Status |
|---------|------|-------------|--------|
| v2.0 | `05-child-task-progress/05-child-task-progress-realtime-flow.md` | HTTP + Socket.IO | ✅ Complete |

---

## 📚 Documentation (_docs/)

### Summary Documents
| File | Description |
|------|-------------|
| `README.md` | Original index (legacy reference) |
| `README-UPDATED-v2.md` | Complete v2.0 index |
| `COMPLETE_LEGACY_FLOW_UPDATE_SUMMARY-12-03-26.md` | v1.5 update summary |
| `COMPLETE_FLOW_DOCUMENTATION_V2_SUMMARY-12-03-26.md` | v2.0 complete summary |
| `FLOW_DOCUMENTATION_UPDATE_COMPLETE-12-03-26.md` | Chunk 2 summary |
| `LEGACY_FLOW_UPDATES_REQUIRED-12-03-26.md` | Issues list (historical) |

---

## 🎯 Quick Start Guide

### For Frontend Developers

**Start Here**:
1. **Child Home Screen** → `06-child-home-v2/` (v2.0 with Socket.IO)
2. **Parent Dashboard** → `07-parent-dashboard-v2/` (v2.0 with Socket.IO)
3. **Task Creation** → `08-child-task-creation-v2/` (v2.0 with Socket.IO)

**Then**:
- Import Postman collections from `postman-collections/`
- Set up Socket.IO client
- Implement chart endpoints
- Build real-time UI components

---

### For Backend Developers

**Reference**:
- Flow 01-03 (v1.5) for HTTP endpoint structure
- Flow 04-08 (v2.0) for Socket.IO integration
- Socket.IO guide: `src/helpers/socket/SOCKET_IO_INTEGRATION.md`

**Ensure**:
- All endpoints match documentation
- Socket.IO events fire correctly
- Redis caching configured
- Rate limiting applied

---

### For QA Engineers

**Testing**:
- Use v1.5 flows for HTTP endpoint testing
- Use v2.0 flows for Socket.IO testing
- Test error scenarios
- Test reconnection logic

---

### For Project Managers

**Track Progress**:
- Flow documentation: ✅ 100% complete
- Backend implementation: ✅ 100% complete
- Frontend integration: ⏳ Ready to start
- Production deployment: ⏳ After frontend testing

---

## 🔧 Version Guide

### v1.0 (Legacy)
- ❌ **DO NOT USE** - Contains outdated references
- Kept for historical reference only
- Uses old `/api/v1/` paths
- Uses old `/groups/` endpoints
- Missing TaskProgress & Chart endpoints

### v1.5 (Updated HTTP)
- ✅ **USE FOR** - Quick HTTP reference
- Fixed all v1.0 issues
- Updated to `/v1/` paths
- Updated to `/children-business-user/` endpoints
- Added TaskProgress & Chart endpoints reference
- No Socket.IO

### v2.0 (HTTP + Socket.IO) ⭐ RECOMMENDED
- ✅ **USE FOR** - Production implementation
- All v1.5 features
- Socket.IO real-time integration
- Complete real-time event documentation
- Chart.js integration examples
- Recommended for production

---

## 📊 Flow Coverage Matrix

| Flow | Role | HTTP | Socket.IO | Charts | TaskProgress | Status |
|------|------|------|-----------|--------|--------------|--------|
| 01 (v1.0) | child | ✅ | ❌ | ❌ | ❌ | ⚠️ Outdated |
| 01 (v1.5) | child | ✅ | ❌ | ✅ | ✅ | ✅ Current |
| 01 (v2.0) | child | ✅ | ✅ | ✅ | ✅ | ✅ Recommended |
| 02 (v1.0) | business | ✅ | ❌ | ❌ | ❌ | ⚠️ Outdated |
| 02 (v1.5) | business | ✅ | ❌ | ✅ | ✅ | ✅ Current |
| 02 (v2.0) | business | ✅ | ✅ | ✅ | ✅ | ✅ Recommended |
| 03 (v1.0) | child | ✅ | ❌ | ❌ | ❌ | ⚠️ Outdated |
| 03 (v1.5) | child | ✅ | ❌ | ✅ | ✅ | ✅ Current |
| 03 (v2.0) | child | ✅ | ✅ | ✅ | ✅ | ✅ Recommended |
| 04 (v2.0) | business | ✅ | ✅ | ✅ | ✅ | ✅ Complete |
| 05 (v2.0) | child | ✅ | ✅ | ✅ | ✅ | ✅ Complete |

---

## 🎯 Common API Patterns

### Pattern 1: List + Detail
```
GET /v1/tasks              → List all tasks
GET /v1/tasks/:id          → Get single task
```

### Pattern 2: Create + Read + Update + Delete
```
POST   /v1/tasks          → Create task
GET    /v1/tasks/:id      → Read task
PUT    /v1/tasks/:id      → Update task
DELETE /v1/tasks/:id      → Delete task
```

### Pattern 3: Status Update (Real-Time in v2.0)
```
PUT /v1/tasks/:id/status          → HTTP update
PUT /v1/task-progress/:id/status  → Real-time parent notification
```

### Pattern 4: Progress Tracking
```
PUT /v1/tasks/:id/subtasks/progress           → Update all subtasks
PUT /v1/task-progress/:id/subtasks/:index/complete  → Single subtask + real-time
```

### Pattern 5: Analytics & Charts
```
GET /v1/analytics/charts/*  → 10 chart endpoints
```

### Pattern 6: Socket.IO Events (v2.0)
```javascript
// Connect
socket = io({ auth: { token } })

// Join room
socket.emit('join-task', { taskId })

// Listen for events
socket.on('task-progress:started', callback)
socket.on('group:activity', callback)
```

---

## 📝 Figma Reference Guide

### App User (Child/Student)
```
figma-asset/app-user/group-children-user/
├── home-flow.png                    → Flow 01, 06
├── task-details-with-subTasks.png   → Flow 01, 05, 06
├── edit-update-task-flow.png        → Flow 01, 03, 08
├── add-task-flow-for-permission-account-interface.png → Flow 03, 08
├── profile-permission-account-interface.png → Flow 03, 08
└── response-based-on-mode.png       → Flow 06
```

### Teacher/Parent Dashboard
```
figma-asset/teacher-parent-dashboard/
├── dashboard/
│   └── dashboard-flow-01.png        → Flow 02, 04, 07
├── task-monitoring/                 → Flow 02, 04, 05, 07
├── team-members/                    → Flow 02, 07
├── settings-permission-section/     → Flow 03, 08
└── subscription/                    → Subscription module
```

### Main Admin Dashboard
```
figma-asset/main-admin-dashboard/
├── dashboard-section-flow.png       → Admin analytics
├── get-user-details-flow.png        → User management
├── user-list-flow.png               → User list
└── subscription-flow.png            → Subscription plans
```

---

## 🔐 Authentication Flow

### Login + Token Management + Socket.IO (v2.0)
```
1. POST /v1/auth/login → Get tokens
2. Connect Socket.IO with accessToken
3. Auto-join personal room
4. Auto-join family room
5. Listen for real-time events
```

---

## 📞 Support & Resources

### Documentation Locations
- **Flow Documents**: `flow/` (organized by feature)
- **Socket.IO Guide**: `src/helpers/socket/SOCKET_IO_INTEGRATION.md`
- **Postman Collections**: `postman-collections/`
- **Chart Endpoints**: `src/modules/analytics.module/chartAggregation/`
- **TaskProgress Module**: `src/modules/taskProgress.module/`
- **childrenBusinessUser**: `src/modules/childrenBusinessUser.module/`

### Key Contacts
- **Backend Lead**: [Your Name]
- **Flow Documentation**: Complete (v2.0)
- **Socket.IO Integration**: Complete
- **Chart Endpoints**: Complete (10 endpoints)

---

## ✅ Status

**Flow Documentation**: ✅ **100% COMPLETE**  
**Organization**: ✅ **Folder-based structure**  
**Version Control**: ✅ **v1.0, v1.5, v2.0 clearly marked**  
**Figma Alignment**: ✅ **100% ALIGNED**  
**Production Ready**: ✅ **YES**  

---

**Last Updated**: 12-03-26  
**Version**: 2.0 - Organized Structure  
**Maintained By**: Backend Engineering Team  
**Status**: ✅ **READY FOR FRONTEND INTEGRATION**
