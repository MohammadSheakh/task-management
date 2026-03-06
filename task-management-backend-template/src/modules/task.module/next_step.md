📊 Next Steps

    When you're ready, I can also create:
     1. Group/Team module for collaborative features
     2. Notification module for task reminders
     3. Analytics module for productivity insights
     4. Integration with your existing auth & user modules

//=================================================================

Generate like top senior engineer ..

================>

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

================>
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

================>
Instruction #3:

     yes you will generate group/ team module .. but before that .. as you know my coding style .. follow that .. and with that .. always create doc folder in any module .. keep that module related schema design in mermaid format . also all documenation related that module .. i think you should do in two level .. one is parent level .. and one is child level .. previously you know i have task.module and all task module related module is under that .. so create doc that sub module level also .. and while code .. you should follow SOLID principle with proper documentation .. and dont code like junior .. 100 user, 1000 task .. develop and design each system for 100K users, 10M task this level .. i tell you this number for your understanding .. use redis caching, rate limiting, and all other senior level staff with proper documentation .. so that i can understand your code

================>
Instruction #4:

now you can start working again where you left of .. but as you know i tell you generate schema design in mermaid ..
for that in docs folder create let say group-schema.mermaid this kind of file .. and add mermaid schema there ..
also i give you more instruction like if you need pagination .. you can see how i design pagination in
serviceBooking.route.ts and generic controllers getAllWithPaginationV2 controller and getAllWithPagination genenic
service .. also for a aggregation, how i can add pagination you can see if you check getAllWithAggregation function
of user.service.ts , that actually pass Model, pipeline and option into PaginationService.aggregationPaginate
function do check that out .. for architectural decision .. if you found any heavy or async operation must use
background job s like bullmq .. in helpers folder you find the bullmq folder .. also documentation should include
system flow diagram, module responsibilities, api examples .. Ensure code remains modular, reusable, and
maintainable. Use Redis caching where beneficial.

✦ I need to review the existing pagination patterns, BullMQ setup, and serviceBooking implementation to understand
the user's coding style before continuing with the Group module implementation.

=
====================>
Instruction #5:

now generate Notification module for task reminders .. and add user journey map, user flow diagram, swimline
diagram, for module level, parent module level and project level in doc folder for task.modules and
group.modules also

====================>
Instruction #6:

hello qwen .. you actually work for me .. in my next_step.md in task.module folder .. there you find the history
of our conversation .. my total instruction to you .. based on my instruction so far you generate task.module and
group.module and last time you working on notifiction.module .. may be working for notification.module is not
complete .. and the thing is for diagram generation .. dont add all diagram in one markdown file .. please
generate different mermaid file for differnet diagram ..

✦ I need to read the next_step.md file to understand the project history and requirements before proceeding with
the modular diagram generation.

====================>
Instruction #7:

dear qwen .. what you should do .. when you start working for me .. i see .. you make a plan .. what are the
things you should generate .. so what you need to do .. is everytime make a file like agenda.md .. where you
write the intial plan .. that you give me in terminal before start any work .. then work

====================>
Instruction #8:

dear qwen as you know you have all the previous instruction in next_step.md file of
task.module .. and based on your plan so far you generate task.module, group.module and
notification.module .. now i think time has come to review all backend code use case and
make sure those are properly alligned with askfemi-flutter codes task management apps
flow and Task-management-website's flow .. because at the end of the day we want to make
backend for that app and website .. so please check what you generate is actually
correct and properly aligned with flutter project flow and website project flow

====================>
Instruction #9:

dear qwen do your group module maintain all senior level data structure and algorithm ? proper
time and space and memory efficiency complexity ? make a report in that group.modules doc folder ..
create another folder named perf under that doc folder .. and review

====================>
Instruction #11:

as you go throw flutter code and website code .. and you already know you generate task.module,
group.module and notification.module .. what are the other module you should generate ? just tell me
dont need to generate anything just tell .. what are the other module left to complete this backend
