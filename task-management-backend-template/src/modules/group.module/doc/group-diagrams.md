# 📊 Group Module - Comprehensive Diagrams

## Module Level Diagrams

---

## 1. User Journey Map: Group Creation to Collaboration

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  USER JOURNEY: GROUP LIFECYCLE                                         │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│   PHASE      │   AWARENESS  │   CREATION   │  INVITATION  │  COLLABORATE │  MANAGEMENT  │   GROWTH    │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│              │              │              │              │              │              │             │
│  User        │  Identifies  │  Creates     │  Invites     │  Assigns     │  Monitors    │  Scales     │
│  Actions     │  need for    │  group with  │  team        │  tasks to    │  progress    │  team or    │
│              │  team        │  details     │  members     │  group       │  manages     │  archives   │
│              │              │              │              │              │  members     │             │
│              │              │              │              │              │              │             │
│  Touchpoints │  Dashboard   │  Group       │  Invitation  │  Task        │  Member      │  Analytics  │
│              │  Search      │  Creation    │  Interface   │  Assignment  │  Management  │  Dashboard  │
│              │              │  Form        │              │  Page        │  Panel       │              │
│              │              │              │              │              │              │             │
│  Emotions    │  🤔          │  😊          │  🤞          │  🤝          │  😌          │  😁         │
│              │  Thinking    │  Excited     │  Hopeful     │  Collaborative│  Satisfied  │  Proud      │
│              │              │              │              │              │              │              │
│  Pain Points │  Can't find  │  Complex     │  Members     │  Confusion   │  Too many    │  Losing     │
│  & Solutions │  right people│  setup       │  don't join  │  over roles  │  requests    │  history    │
│              │  Search      │  Templates   │  Auto-       │  Clear       │  Bulk        │  Export     │
│              │  & Discover  │  & Guides    │  reminders   │  permissions │  operations  │  & Archive  │
│              │              │              │              │              │              │              │
│  System      │  Group       │  Validation  │  Email       │  Role-based  │  Analytics   │  Data       │
│  Support     │  Discovery   │  & Limits    │  Invites     │  Access      │  Dashboard   │  Retention  │
│              │              │              │  BullMQ      │  Control     │  Reports     │  Policies   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

---

## 2. User Flow Diagram: Group Management

```mermaid
flowchart TD
    Start([User Logs In]) --> Dashboard[View Dashboard]
    Dashboard --> Decision{What to do?}
    
    Decision -->|Create Group| CreateGroup[Click Create Group]
    CreateGroup --> FillForm[Fill Group Details]
    FillForm --> SetVisibility[Set Visibility]
    SetVisibility --> PublicOrPrivate{Public or Private?}
    PublicOrPrivate -->|Public| AllowJoinRequests[Allow Join Requests]
    PublicOrPrivate -->|Private| InviteOnly[Invite Only]
    AllowJoinRequests --> SubmitGroup
    InviteOnly --> SubmitGroup[Submit Group]
    SubmitGroup --> GroupCreated[Group Created ✓]
    
    Decision -->|View My Groups| ViewGroups[View Group List]
    ViewGroups --> SelectGroup[Select Group]
    SelectGroup --> GroupDetail[View Group Details]
    
    GroupDetail --> ManageGroup{Manage Group?}
    ManageGroup -->|Edit Details| EditGroup[Edit Group Info]
    EditGroup --> SaveGroup[Save Changes]
    SaveGroup --> GroupDetail
    
    ManageGroup -->|Invite Members| InviteMembers[Send Invitations]
    InviteMembers --> BulkOrSingle{Bulk or Single?}
    BulkOrSingle -->|Bulk| BulkInvite[Upload Email List]
    BulkOrSingle -->|Single| SingleInvite[Enter Email/User]
    BulkInvite --> SendInvites
    SingleInvite --> SendInvites[Send Invitations]
    SendInvites --> QueueEmails[Queue Emails via BullMQ]
    QueueEmails --> GroupDetail
    
    ManageGroup -->|Manage Members| ManageMembers[View Members]
    ManageMembers --> MemberActions{Action?}
    MemberActions -->|Promote| PromoteMember[Promote to Admin]
    MemberActions -->|Remove| RemoveMember[Remove Member]
    MemberActions -->|View Profile| ViewMemberProfile[View Profile]
    PromoteMember --> ConfirmPromote{Confirm?}
    ConfirmPromote -->|Yes| MemberPromoted[Member Promoted ✓]
    RemoveMember --> ConfirmRemove{Confirm?}
    ConfirmRemove -->|Yes| MemberRemoved[Member Removed ✓]
    MemberPromoted --> ManageMembers
    MemberRemoved --> ManageMembers
    
    ManageGroup -->|Delete Group| DeleteGroup[Delete Group]
    DeleteGroup --> ConfirmDelete{Owner Only - Confirm?}
    ConfirmDelete -->|Yes| GroupDeleted[Group Deleted ✓]
    ConfirmDelete -->|No| GroupDetail
    
    Decision -->|Join Group| JoinGroup[Browse Public Groups]
    JoinGroup --> SearchGroup[Search Groups]
    SearchGroup --> RequestJoin[Request to Join]
    RequestJoin --> WaitForApproval[Wait for Approval]
    WaitForApproval --> Approved{Approved?}
    Approved -->|Yes| JoinedGroup[Joined Group ✓]
    Approved -->|No| JoinGroup
    
    GroupCreated --> Dashboard
    JoinedGroup --> Dashboard
    GroupDeleted --> Dashboard
```

---

## 3. Swimlane Diagram: Group Invitation & Membership Flow

```mermaid
flowchart TD
    subgraph GroupOwner["👤 Group Owner/Admin"]
        CreateGroup[Create Group] --> SetVisibility[Set Visibility & Limits]
        InviteMembers[Send Invitations] --> BulkOrSingle[Bulk or Single Invite]
        BulkOrSingle --> SendInvites[Send Invites]
        ReviewRequests[Review Join Requests] --> ApproveRequest[Approve/Decline]
        ManageMembers[Manage Members] --> PromoteDemote[Promote/Demote/Remove]
    end
    
    subgraph System["⚙️ System"]
        SetVisibility --> ValidateGroup[Validate Group Data]
        ValidateGroup --> SaveGroup[Save to Database]
        SaveGroup --> CacheGroup[Cache in Redis]
        SendInvites --> CreateInvitation[Create Invitation Record]
        CreateInvitation --> QueueEmail[Queue Email via BullMQ]
        QueueEmail --> SendEmail[Send Email Notification]
        SendEmail --> TrackStatus[Track Invitation Status]
        ApproveRequest --> AddMember[Add Member to Group]
        AddMember --> UpdateCount[Update Member Count]
        UpdateCount --> InvalidateCache[Invalidate Redis Cache]
        PromoteDemote --> UpdateRole[Update Member Role]
        UpdateRole --> InvalidateCache
    end
    
    subgraph Invitee["📧 Invited User"]
        ReceiveEmail[Receive Email] --> ClickLink[Click Invitation Link]
        ClickLink --> ViewGroup[View Group Details]
        ViewGroup --> Decide{Accept or Decline?}
        Decide -->|Accept| AcceptInvite[Accept Invitation]
        Decide -->|Decline| DeclineInvite[Decline Invitation]
        AcceptInvite --> BecomeMember[Become Member ✓]
        DeclineInvite --> InviteDeclined[Invitation Declined]
    end
    
    subgraph Requester["🙋 Prospective Member"]
        BrowseGroups[Browse Public Groups] --> FindGroup[Find Group]
        FindGroup --> RequestJoin[Request to Join]
        RequestJoin --> WaitForApproval[Wait for Approval]
        WaitForApproval --> Notification{Notification}
        Notification -->|Approved| JoinGroup[Join Group ✓]
        Notification -->|Declined| StayOut[Not Accepted]
    end
    
    SendInvites --> ReceiveEmail
    RequestJoin --> ReviewRequests
    ApproveRequest --> Notification
```

---

## 4. Sequence Diagram: Group Creation with Member Invitation

```mermaid
sequenceDiagram
    participant Owner as Group Owner
    participant API as Group API
    participant DB as MongoDB
    participant Redis as Redis Cache
    participant BullMQ as BullMQ Queue
    participant Email as Email Service
    participant Member as New Member

    Owner->>API: POST /groups (create group)
    API->>DB: Validate group limits
    DB-->>API: User has capacity
    API->>DB: Create group
    DB-->>API: Group created
    API->>DB: Create owner membership
    DB-->>API: Membership created
    API->>Redis: Cache group data
    Redis-->>API: Cached
    API-->>Owner: Group created response
    
    Owner->>API: POST /group-invitations/:id/send-bulk
    API->>DB: Validate invitation limits
    DB-->>API: Within limits
    loop For each invitee
        API->>DB: Create invitation record
        DB-->>API: Invitation created
        API->>BullMQ: Queue email job
        BullMQ-->>API: Job queued
    end
    API-->>Owner: Invitations sent
    
    Note over BullMQ: Async processing
    BullMQ->>Email: Process email job
    Email->>Member: Send invitation email
    Member->>API: POST /group-invitations/accept
    API->>DB: Validate token
    DB-->>API: Valid invitation
    API->>DB: Create group membership
    DB-->>API: Member added
    API->>DB: Increment member count
    API->>Redis: Invalidate caches
    API-->>Member: Successfully joined
```

---

## 5. State Machine: Group Invitation Flow

```mermaid
stateDiagram-v2
    [*] --> Draft: Owner creates invitation
    Draft --> Pending: Sent to invitee
    Pending --> Accepted: Invitee accepts
    Pending --> Declined: Invitee declines
    Pending --> Expired: Token expires (7 days)
    Pending --> Cancelled: Owner cancels
    Accepted --> Member: Added to group
    Declined --> [*]
    Expired --> [*]
    Cancelled --> [*]
    Member --> [*]
    
    note right of Pending
        Awaiting response
        Email sent via BullMQ
    end note
    
    note right of Accepted
        User becomes member
        Count incremented
    end note
    
    note right of Expired
        Auto-expired after 7 days
        Can be resent
    end note
```

---

## Parent Module Level (group.module)

---

## 6. Component Architecture: Group Module

```mermaid
graph TB
    subgraph group_module["📦 group.module"]
        subgraph group["Group Sub-Module"]
            GroupModel[Group Model]
            GroupService[Group Service]
            GroupController[Group Controller]
            GroupRoutes[Group Routes]
        end
        
        subgraph groupMember["GroupMember Sub-Module"]
            MemberModel[Member Model]
            MemberService[Member Service]
            MemberController[Member Controller]
            MemberRoutes[Member Routes]
        end
        
        subgraph groupInvitation["GroupInvitation Sub-Module"]
            InvitationModel[Invitation Model]
            InvitationService[Invitation Service]
            InvitationController[Invitation Controller]
            InvitationRoutes[Invitation Routes]
        end
        
        subgraph middlewares["Middlewares"]
            IsGroupMember[isGroupMember]
            IsGroupAdmin[isGroupAdmin]
            IsGroupOwner[isGroupOwner]
            HasPermission[hasPermission]
        end
        
        subgraph doc["Documentation"]
            GroupDocs[Group Docs]
            GroupDiagrams[Group Diagrams]
        end
    end
    
    subgraph external["External Dependencies"]
        Auth[Auth Module]
        User[User Module]
        Notification[Notification Module]
        Task[Task Module]
    end
    
    GroupController --> GroupService
    GroupService --> GroupModel
    MemberController --> MemberService
    MemberService --> MemberModel
    InvitationController --> InvitationService
    InvitationService --> InvitationModel
    
    GroupService --> Auth
    GroupService --> User
    GroupService --> Notification
    
    InvitationService --> Notification
    InvitationService --> BullMQ[BullMQ Queue]
    
    GroupRoutes --> IsGroupMember
    GroupRoutes --> IsGroupAdmin
    GroupRoutes --> IsGroupOwner
    GroupRoutes --> HasPermission
    
    MemberService --> Task
```

---

## Project Level Diagrams

---

## 7. System Architecture: Group & Task Management Integration

```mermaid
graph TB
    subgraph users["👥 Users"]
        Owner[Group Owner]
        Admin[Group Admin]
        Member[Group Member]
        Invitee[Invitee]
    end
    
    subgraph frontend["🖥️ Frontend"]
        FlutterApp[Flutter App]
        WebApp[Web Dashboard]
    end
    
    subgraph api["⚙️ API Layer"]
        LB[Load Balancer]
        Auth[Auth Middleware]
        RateLimit[Rate Limiter]
    end
    
    subgraph modules["📦 Modules"]
        GroupModule[Group Module]
        TaskModule[Task Module]
        NotificationModule[Notification Module]
        UserModule[User Module]
    end
    
    subgraph async["🔄 Async Processing"]
        BullMQ[BullMQ Queues]
        EmailWorker[Email Worker]
        ReminderWorker[Reminder Worker]
    end
    
    subgraph data["💾 Data Layer"]
        MongoDB[(MongoDB)]
        Redis[(Redis Cache)]
    end
    
    Owner --> FlutterApp
    Admin --> FlutterApp
    Member --> FlutterApp
    Invitee --> FlutterApp
    
    FlutterApp --> LB
    WebApp --> LB
    
    LB --> RateLimit
    RateLimit --> Auth
    Auth --> GroupModule
    Auth --> TaskModule
    Auth --> NotificationModule
    
    GroupModule --> MongoDB
    GroupModule --> Redis
    TaskModule --> MongoDB
    TaskModule --> Redis
    
    GroupModule --> BullMQ
    TaskModule --> BullMQ
    NotificationModule --> BullMQ
    
    BullMQ --> EmailWorker
    BullMQ --> ReminderWorker
    
    EmailWorker --> UserModule
    ReminderWorker --> NotificationModule
```

---

## 8. Data Flow: Group Collaboration Workflow

```mermaid
flowchart LR
    subgraph Creation["🎯 Group Creation"]
        CreateGroup[Create Group]
        SetPermissions[Set Permissions]
        ConfigureSettings[Configure Settings]
    end
    
    subgraph Membership["👥 Membership Management"]
        SendInvites[Send Invitations]
        JoinRequests[Join Requests]
        ManageMembers[Manage Members]
    end
    
    subgraph Collaboration["🤝 Collaboration"]
        AssignTasks[Assign Tasks]
        ShareUpdates[Share Updates]
        TrackProgress[Track Progress]
    end
    
    subgraph Notifications["📬 Notifications"]
        InviteNotifs[Invitation Emails]
        TaskNotifs[Task Assignments]
        ReminderNotifs[Reminders]
    end
    
    subgraph Analytics["📊 Analytics"]
        MemberStats[Member Statistics]
        TaskStats[Task Completion]
        EngagementStats[Engagement Metrics]
    end
    
    CreateGroup --> SetPermissions
    SetPermissions --> ConfigureSettings
    ConfigureSettings --> SendInvites
    
    SendInvites --> JoinRequests
    JoinRequests --> ManageMembers
    ManageMembers --> AssignTasks
    
    AssignTasks --> ShareUpdates
    ShareUpdates --> TrackProgress
    
    SendInvites --> InviteNotifs
    AssignTasks --> TaskNotifs
    TrackProgress --> ReminderNotifs
    
    TrackProgress --> MemberStats
    TrackProgress --> TaskStats
    ManageMembers --> EngagementStats
```

---

## 9. Permission Matrix: Group Roles & Capabilities

```mermaid
graph TB
    subgraph Owner["👑 Owner Permissions"]
        O1[Create/Delete Group]
        O2[Manage All Members]
        O3[Promote/Demote]
        O4[Edit Group Settings]
        O5[Send Invitations]
        O6[Assign Tasks]
        O7[View Analytics]
        O8[Transfer Ownership]
    end
    
    subgraph Admin["⚡ Admin Permissions"]
        A1[Manage Members]
        A2[Send Invitations]
        A3[Edit Group Info]
        A4[Assign Tasks]
        A5[View Analytics]
        A6[Remove Members]
    end
    
    subgraph Member["👤 Member Permissions"]
        M1[View Group]
        M2[View Tasks]
        M3[Update Own Tasks]
        M4[View Members]
        M5[Leave Group]
    end
    
    Owner --> Admin
    Admin --> Member
    
    style Owner fill:#f9f,stroke:#333,stroke-width:4px
    style Admin fill:#bbf,stroke:#333,stroke-width:2px
    style Member fill:#bfb,stroke:#333,stroke-width:1px
```

---

## 10. Scalability Architecture: 100K Users Design

```mermaid
graph TB
    subgraph Caching["🏎️ Caching Strategy"]
        L1[L1: Application Cache<br/>TTL: 30s-5min]
        L2[L2: Redis Cluster<br/>TTL: 1-10min]
        L3[L3: Database Indexes<br/>Compound Queries]
    end
    
    subgraph RateLimiting["🚦 Rate Limiting"]
        UserLimit[Per User: 100 req/min]
        IPLimit[Per IP: 1000 req/min]
        EndpointLimit[Per Endpoint: Custom]
    end
    
    subgraph Async["⚡ Async Processing"]
        Queue1[Invitation Emails]
        Queue2[Task Reminders]
        Queue3[Notifications]
        Queue4[Analytics Updates]
    end
    
    subgraph Database["💾 Database Optimization"]
        Sharding[Sharding by Group ID]
        Indexing[Strategic Indexes]
        Aggregation[Pipeline Optimization]
        ReadPreference[Read Preferences]
    end
    
    L1 --> L2
    L2 --> L3
    
    UserLimit --> Queue1
    IPLimit --> Queue2
    EndpointLimit --> Queue3
    
    Queue1 --> Database
    Queue2 --> Database
    Queue3 --> Database
    Queue4 --> Database
    
    Sharding --> Indexing
    Indexing --> Aggregation
    Aggregation --> ReadPreference
```

---

**Last Updated**: 2026-03-06  
**Version**: 1.0.0
