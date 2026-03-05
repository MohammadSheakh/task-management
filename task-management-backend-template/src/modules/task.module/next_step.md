📊 Next Steps

    When you're ready, I can also create:
     1. Group/Team module for collaborative features
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