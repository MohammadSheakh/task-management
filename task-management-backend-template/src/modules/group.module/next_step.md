📊 Next Steps

    ✅ COMPLETED: Group/Team module for collaborative features
    
    When you're ready, I can also create:
     2. Notification module for task reminders
     3. Analytics module for productivity insights
     4. Integration with your existing auth & user modules

//=================================================================

Generate like top senior engineer ..

Instruction #1: Initial Request

    > "hello .. in this folder .. i have 3 folder .. one is flutter app and one is website .. go throw all file and folder of
    those flutter code and website .. understand everything .. flow and everything .. so that later when i tell you .. you can
    make backend for it in node js and mongodb .. i will give you backend template also .. so that you understand my coding
    style"

    What I did:
     - Explored your Flutter app (askfemi-flutter/) - understood models, screens, auth flow, task structure
     - Explored your Website (Task-Management-website/) - understood components, Redux API calls, pages
     - Reviewed your backend template (task-management-backend-template/) - understood your coding patterns

    ---

    Instruction #2: Code Generation Guidelines

    > "yes please .. while generating .. keep in mind is if module is already existed .. just modify that .. and when you create
     any module .. if 2 or more simillar module found .. group them under a parent module like like present backend codebase
    task.module .. because task and subTask is related .. also as you see in my task modules route above my create route i have
    unique documentation style /___/ like this .. keep maintain that .. so that i can get clear idea.. and each route comment
    should contain Role Name | Module name | what are we doing ... and may be you learn i use geneic controller and generic
    service thoughout my backend .. use that .. also in middleware folder .. i have lots of useful middleware .. if you look at
    serviceBooking.route.ts in modules folder .. you can understand how i write route with the help of those useful middlewares
    and those generic controller .. this is very important .. please review these code at first before you generate anything ..
    by that you will know my coding style"

    Additional refinement:
    > "you should generate that documentation under task.module folder create a doc folder and generate there .. as this
    documentation is task related"

    What I did:
     - ✅ Grouped task and subTask under task.module parent
     - ✅ Used your documentation style: /*-─────────────────────────────────... */
     - ✅ Route comments format: Role | Feature # | Description
     - ✅ Extended GenericController and GenericService
     - ✅ Used your middlewares: auth, setQueryOptions, validateFiltersForQuery, getLoggedInUserAndSetReferenceToUser, etc.
     - ✅ Created doc/ folder inside task.module for documentation

    ---

    Both instructions completed successfully! 🎯



    Instruction #3:  yes you will generate group/ team module .. but before that .. as you know my coding style .. follow that .. and with that .. always create doc folder in any module .. keep that module related schema design in mermaid format . also all documenation related that module .. i think you should do in two level .. one is parent level .. and one is child level .. previously you know i have task.module and all task module related module is under that .. so create doc that sub module level also .. and while code .. you should follow SOLID principle with proper documentation .. and dont code like junior .. 100 user, 1000 task .. develop and design each system for 100K users, 10M task this level .. i tell you this number for your understanding .. use redis caching, rate limiting, and all other senior level staff with proper documentation .. so that i can understand your code

    ---
    
    Instruction #4: now you can start working again where you left of .. but as you know i tell you generate schema design in mermaid .. for that in docs folder create let say group-schema.mermaid this kind of file .. and add mermaid schema there .. also i give you more instruction like if you need pagination .. you can see how i design pagination in serviceBooking.route.ts and generic controllers getAllWithPaginationV2 controller and getAllWithPagination genenic service .. also for a aggregation, how i can add pagination you can see if you check getAllWithAggregation function of user.service.ts , that actually pass Model, pipeline and option into PaginationService.aggregationPaginate function do check that out .. for architectural decision .. if you found any heavy or async operation must use background job s like bullmq .. in helpers folder you find the bullmq folder .. also documentation should include system flow diagram, module responsibilities, api examples .. Ensure code remains modular, reusable, and maintainable. Use Redis caching where beneficial.

    ---
    
    ✅ GROUP MODULE COMPLETED SUCCESSFULLY!
    
    What Was Implemented:
    
    ✅ Group Sub-Module (group/)
       - Group model with indexes for 100K+ users
       - Redis caching (cache-aside pattern)
       - Rate limiting (5 groups/min creation, 100 req/min general)
       - CRUD operations with soft delete
       - Search functionality with text indexes
       - Statistics endpoint
    
    ✅ GroupMember Sub-Module (groupMember/)
       - Membership management with unique constraints
       - Role hierarchy (owner > admin > member)
       - Permission matrix implementation
       - Member count tracking with cache sync
       - Promote/demote functionality
       - Leave group functionality
    
    ✅ GroupInvitation Sub-Module (groupInvitation/)
       - Token-based invitation system
       - Email and userId invitations
       - BullMQ async email processing
       - Bulk invitation support (max 20 per request)
       - Accept/decline/cancel workflows
       - Automatic expiry (7 days)
    
    ✅ Middlewares (group.middleware.ts)
       - isGroupMember
       - isGroupAdmin
       - isGroupOwner
       - isGroupActive
       - hasGroupPermission
       - isGroupFull
       - validateInvitationToken
    
    ✅ Documentation (doc/)
       - GROUP_MODULE_ARCHITECTURE.md (parent-level)
       - group-schema.mermaid (ER diagram)
       - group-flow.mermaid (sequence diagram)
       - group-member.md (Group sub-module docs)
       - groupMember-member.md (GroupMember sub-module docs)
       - groupInvitation-member.md (GroupInvitation sub-module docs)
    
    ✅ BullMQ Integration
       - group-invitations-queue
       - startGroupInvitationWorker()
       - Integrated in serverV2.ts
    
    ✅ Router Registration
       - /groups
       - /group-members
       - /group-invitations
    
    ✅ Scalability Features
       - Redis caching with automatic invalidation
       - Rate limiting per endpoint
       - Database indexes optimized for queries
       - Soft delete for audit trails
       - Pagination using your pattern
       - BullMQ for async operations
    
    File Structure Created:
    
    group.module/
    ├── doc/
    │   ├── GROUP_MODULE_ARCHITECTURE.md
    │   ├── group-schema.mermaid
    │   ├── group-flow.mermaid
    │   ├── group-member.md
    │   ├── groupMember-member.md
    │   └── groupInvitation-member.md
    ├── group/
    │   ├── group.interface.ts
    │   ├── group.constant.ts
    │   ├── group.model.ts
    │   ├── group.service.ts
    │   ├── group.controller.ts
    │   └── group.route.ts
    ├── groupMember/
    │   ├── groupMember.interface.ts
    │   ├── groupMember.constant.ts
    │   ├── groupMember.model.ts
    │   ├── groupMember.service.ts
    │   ├── groupMember.controller.ts
    │   └── groupMember.route.ts
    ├── groupInvitation/
    │   ├── groupInvitation.interface.ts
    │   ├── groupInvitation.constant.ts
    │   ├── groupInvitation.model.ts
    │   ├── groupInvitation.service.ts
    │   ├── groupInvitation.controller.ts
    │   └── groupInvitation.route.ts
    ├── group.middleware.ts
    └── COMPLETED.md
    
    See COMPLETED.md for full details, API examples, and next steps!
