# 📊 Task Module - Comprehensive Diagrams

## Module Level Diagrams

---

## 1. User Journey Map: Task Creation to Completion

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER JOURNEY: TASK LIFECYCLE                                        │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│   PHASE      │   AWARENESS  │   CREATION   │  ASSIGNMENT  │   PROGRESS   │  COMPLETION  │   REVIEW    │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│              │              │              │              │              │              │             │
│  User        │  Realizes    │  Opens app   │  Assigns     │  Works on    │  Marks as    │  Views      │
│  Actions     │  need for    │  creates     │  task to     │  task        │  done        │  completion │
│              │  task        │  task        │  team member │  updates     │  uploads     │  stats      │
│              │              │              │              │  progress    │  attachments │             │
│              │              │              │              │              │              │             │
│  Touchpoints │  Dashboard   │  Task        │  Assignment  │  Task        │  Completion │  Analytics  │
│              │  Notification│  Creation    │  Modal       │  Detail      │  Modal       │  Dashboard  │
│              │              │  Form        │              │  Page        │              │              │
│              │              │              │              │              │              │             │
│  Emotions    │  😐          │  😊          │  🤔          │  😅          │  😃          │  😁         │
│              │  Neutral     │  Satisfied   │  Thinking    │  Effort      │  Relief      │  Happy      │
│              │              │              │              │              │              │              │
│  Pain Points │  Forgets     │  Complex     │  Wrong       │  Loses       │  Forgets to  │  No         │
│              │  tasks       │  form        │  assignee    │  track       │  complete    │  insights   │
│              │              │              │              │              │              │              │
│  System      │  Reminder    │  Auto-save   │  Validation  │  Progress    │  Auto-       │  Stats      │
│  Support     │  Setup       │  Drafts      │  & Confirm   │  Tracking    │  notify      │  Generation │
│              │              │              │              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

---

## 2. User Flow Diagram: Task Management

```mermaid
flowchart TD
    Start([User Logs In]) --> Dashboard[View Dashboard]
    Dashboard --> Decision{What to do?}
    
    Decision -->|Create Task| CreateTask[Click Create Task]
    CreateTask --> FillForm[Fill Task Form]
    FillForm --> SetReminder[Set Reminder?]
    SetReminder -->|Yes| ScheduleReminder[Schedule Reminder]
    SetReminder -->|No| SubmitTask[Submit Task]
    ScheduleReminder --> SubmitTask
    SubmitTask --> TaskCreated[Task Created ✓]
    
    Decision -->|View Tasks| ViewTasks[View Task List]
    ViewTasks --> FilterTasks[Filter/Search]
    FilterTasks --> SelectTask[Select Task]
    SelectTask --> TaskDetail[View Task Details]
    
    TaskDetail --> UpdateTask{Update Task?}
    UpdateTask -->|Edit| EditTask[Edit Task Details]
    EditTask --> SaveTask[Save Changes]
    SaveTask --> TaskDetail
    
    UpdateTask -->|Update Status| UpdateStatus[Update Status]
    UpdateStatus --> StatusOptions[Pending/InProgress/Done]
    StatusOptions --> TaskDetail
    
    UpdateTask -->|Add Subtask| AddSubtask[Add Subtask]
    AddSubtask --> SubtaskAdded[Subtask Added ✓]
    SubtaskAdded --> TaskDetail
    
    UpdateTask -->|Complete| CompleteTask[Mark as Complete]
    CompleteTask --> UploadProof[Upload Proof?]
    UploadProof -->|Yes| UploadFiles[Upload Attachments]
    UploadFiles --> TaskComplete[Task Completed ✓]
    UploadProof -->|No| TaskComplete
    
    Decision -->|Delete Task| DeleteTask[Delete Task]
    DeleteTask --> ConfirmDelete{Confirm?}
    ConfirmDelete -->|Yes| TaskDeleted[Task Deleted ✓]
    ConfirmDelete -->|No| Dashboard
    
    TaskCreated --> Dashboard
    TaskComplete --> Dashboard
    TaskDeleted --> Dashboard
```

---

## 3. Swimlane Diagram: Task Assignment & Collaboration

```mermaid
flowchart TD
    subgraph TaskCreator["👤 Task Creator"]
        Start([Identify Need]) --> CreateTask[Create Task]
        AssignTask[Assign to Team Member] --> Notify[Send Notification]
        ReviewWork[Review Completed Work] --> CloseTask[Close Task]
    end
    
    subgraph System["⚙️ System"]
        CreateTask --> ValidateTask[Validate Task Data]
        ValidateTask --> SaveTask[Save to Database]
        SaveTask --> TriggerNotification[Trigger Notification]
        Notify --> QueueReminder[Queue Reminder Job]
        QueueReminder --> TrackProgress[Track Progress]
        TrackProgress --> SendReminder[Send Reminder if Due]
        SendReminder --> CheckCompletion{Task Complete?}
    end
    
    subgraph Assignee["👥 Assignee"]
        ReceiveNotification[Receive Notification] --> ViewTask[View Task Details]
        ViewTask --> AcceptTask[Accept Task]
        AcceptTask --> WorkOnTask[Work on Task]
        WorkOnTask --> UpdateProgress[Update Progress]
        UpdateProgress --> AddSubtasks[Add Subtasks]
        AddSubtasks --> CompleteSubtasks[Complete Subtasks]
        CompleteSubtasks --> MarkComplete[Mark as Complete]
        MarkComplete --> UploadProof[Upload Proof/Attachments]
        UploadProof --> SubmitForReview[Submit for Review]
    end
    
    CheckCompletion -->|No| SendReminder
    CheckCompletion -->|Yes| NotifyCreator[Notify Creator]
    NotifyCreator --> ReviewWork
    SubmitForReview --> NotifyCreator
```

---

## 4. Sequence Diagram: Task Creation with Reminder

```mermaid
sequenceDiagram
    participant U as User
    participant API as Task API
    participant DB as MongoDB
    participant Redis as Redis Cache
    participant BullMQ as BullMQ Queue
    participant Notif as Notification Service

    U->>API: POST /tasks (create task)
    API->>DB: Validate & create task
    DB-->>API: Task created
    API->>DB: Create subtasks (if any)
    DB-->>API: Subtasks created
    
    alt Has Reminder
        U->>API: POST /task-reminders
        API->>DB: Create reminder record
        DB-->>API: Reminder created
        API->>BullMQ: Schedule reminder job
        BullMQ-->>API: Job scheduled
    end
    
    API->>Redis: Invalidate user task cache
    Redis-->>API: Cache invalidated
    API-->>U: Task created with reminder
    
    Note over BullMQ: At scheduled time
    BullMQ->>Notif: Process reminder job
    Notif->>DB: Get task & user details
    DB-->>Notif: Data retrieved
    Notif->>Notif: Create notification
    Notif->>U: Send notification (email/push)
```

---

## 5. State Machine: Task Status Flow

```mermaid
stateDiagram-v2
    [*] --> Draft: Task created
    Draft --> Pending: Submitted
    Pending --> InProgress: Assigned/Started
    InProgress --> Pending: Returned for changes
    InProgress --> UnderReview: Submitted for review
    UnderReview --> InProgress: Changes requested
    UnderReview --> Completed: Approved
    Completed --> [*]
    
    Pending --> Cancelled: Cancelled
    InProgress --> Cancelled: Cancelled
    UnderReview --> Cancelled: Cancelled
    Cancelled --> [*]
    
    note right of Draft
        Initial state
        Can be edited freely
    end note
    
    note right of InProgress
        Active work
        Progress tracked
    end note
    
    note right of Completed
        Final state
        Read-only
    end note
```

---

## Parent Module Level (task.module)

---

## 6. Component Architecture: Task Module

```mermaid
graph TB
    subgraph task_module["📦 task.module"]
        subgraph task["Task Sub-Module"]
            TaskModel[Task Model]
            TaskService[Task Service]
            TaskController[Task Controller]
            TaskRoutes[Task Routes]
        end
        
        subgraph subtask["SubTask Sub-Module"]
            SubTaskModel[SubTask Model]
            SubTaskService[SubTask Service]
            SubTaskController[SubTask Controller]
            SubTaskRoutes[SubTask Routes]
        end
        
        subgraph doc["Documentation"]
            TaskDocs[Task Docs]
            TaskDiagrams[Task Diagrams]
        end
    end
    
    subgraph external["External Dependencies"]
        Auth[Auth Module]
        User[User Module]
        Group[Group Module]
        Notification[Notification Module]
        Attachment[Attachment Module]
    end
    
    TaskController --> TaskService
    TaskService --> TaskModel
    SubTaskController --> SubTaskService
    SubTaskService --> SubTaskModel
    
    TaskService --> Auth
    TaskService --> User
    TaskService --> Group
    TaskService --> Notification
    TaskService --> Attachment
    
    SubTaskService --> TaskService
```

---

## Project Level Diagrams

---

## 7. System Architecture: Task Management Ecosystem

```mermaid
graph TB
    subgraph frontend["🖥️ Frontend"]
        FlutterApp[Flutter Mobile App]
        WebApp[React Website]
    end
    
    subgraph api_gateway["🔌 API Gateway"]
        LoadBalancer[Load Balancer]
        RateLimiter[Rate Limiter]
        AuthMiddleware[Auth Middleware]
    end
    
    subgraph backend["⚙️ Backend Services"]
        TaskModule[Task Module]
        GroupModule[Group Module]
        NotificationModule[Notification Module]
        UserModule[User Module]
        AttachmentModule[Attachment Module]
    end
    
    subgraph async["🔄 Async Processing"]
        BullMQ[BullMQ Queues]
        Workers[Background Workers]
    end
    
    subgraph data["💾 Data Layer"]
        MongoDB[MongoDB Database]
        Redis[Redis Cache]
        FileStorage[File Storage]
    end
    
    FlutterApp --> LoadBalancer
    WebApp --> LoadBalancer
    
    LoadBalancer --> RateLimiter
    RateLimiter --> AuthMiddleware
    AuthMiddleware --> TaskModule
    AuthMiddleware --> GroupModule
    AuthMiddleware --> NotificationModule
    AuthMiddleware --> UserModule
    AuthMiddleware --> AttachmentModule
    
    TaskModule --> BullMQ
    GroupModule --> BullMQ
    NotificationModule --> BullMQ
    
    BullMQ --> Workers
    
    TaskModule --> MongoDB
    TaskModule --> Redis
    GroupModule --> MongoDB
    GroupModule --> Redis
    NotificationModule --> MongoDB
    NotificationModule --> Redis
    
    AttachmentModule --> FileStorage
```

---

## 8. Data Flow: End-to-End Task Notification

```mermaid
flowchart LR
    subgraph Trigger["🎯 Trigger Events"]
        TaskCreated[Task Created]
        TaskAssigned[Task Assigned]
        DeadlineApproaching[Deadline Near]
        TaskCompleted[Task Completed]
    end
    
    subgraph Processing["⚙️ Processing"]
        EventPublisher[Event Publisher]
        RuleEngine[Notification Rules]
        TemplateEngine[Template Engine]
        ChannelRouter[Channel Router]
    end
    
    subgraph Delivery["📬 Delivery"]
        InApp[In-App Notification]
        Email[Email]
        Push[Push Notification]
        SMS[SMS]
    end
    
    subgraph Tracking["📊 Tracking"]
        DeliveryStatus[Delivery Status]
        ReadStatus[Read Status]
        Analytics[Analytics]
    end
    
    TaskCreated --> EventPublisher
    TaskAssigned --> EventPublisher
    DeadlineApproaching --> EventPublisher
    TaskCompleted --> EventPublisher
    
    EventPublisher --> RuleEngine
    RuleEngine --> TemplateEngine
    TemplateEngine --> ChannelRouter
    
    ChannelRouter --> InApp
    ChannelRouter --> Email
    ChannelRouter --> Push
    ChannelRouter --> SMS
    
    InApp --> DeliveryStatus
    Email --> DeliveryStatus
    Push --> DeliveryStatus
    SMS --> DeliveryStatus
    
    DeliveryStatus --> ReadStatus
    ReadStatus --> Analytics
```

---

## 9. Deployment Architecture

```mermaid
graph TB
    subgraph cloud["☁️ Cloud Infrastructure"]
        subgraph k8s["Kubernetes Cluster"]
            subgraph pod1["Pod 1"]
                App1[Node.js App]
                Worker1[BullMQ Worker]
            end
            subgraph pod2["Pod 2"]
                App2[Node.js App]
                Worker2[BullMQ Worker]
            end
            subgraph pod3["Pod 3"]
                App3[Node.js App]
                Worker3[BullMQ Worker]
            end
        end
        
        subgraph managed["Managed Services"]
            MongoDB[(MongoDB Atlas)]
            Redis[(Redis Cloud)]
            Storage[Cloud Storage]
        end
    end
    
    subgraph external["External Services"]
        EmailProvider[Email Service]
        PushProvider[Push Service]
        SMSService[SMS Gateway]
    end
    
    LB[Load Balancer] --> App1
    LB --> App2
    LB --> App3
    
    App1 --> MongoDB
    App2 --> MongoDB
    App3 --> MongoDB
    
    App1 --> Redis
    App2 --> Redis
    App3 --> Redis
    
    Worker1 --> MongoDB
    Worker2 --> MongoDB
    Worker3 --> MongoDB
    
    Worker1 --> EmailProvider
    Worker2 --> EmailProvider
    Worker3 --> EmailProvider
    
    Worker1 --> PushProvider
    Worker2 --> PushProvider
    Worker3 --> PushProvider
```

---

**Last Updated**: 2026-03-06  
**Version**: 1.0.0
