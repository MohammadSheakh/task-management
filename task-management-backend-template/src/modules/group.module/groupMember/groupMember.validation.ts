//@ts-ignore
import { z } from 'zod';

/**
 * Update Group Permissions Validation Schema
 * Validates bulk permission updates for group members
 * @see Figma: permission-flow.png
 */
export const updateGroupPermissionsValidationSchema = z.object({
  body: z.object({
    memberPermissions: z.array(
      z.object({
        userId: z.string({
          required_error: 'User ID is required',
          invalid_type_error: 'User ID must be a string',
        }).min(1, 'User ID cannot be empty'),
        
        canCreateTasks: z.boolean({
          invalid_type_error: 'canCreateTasks must be a boolean',
        }).optional(),
        
        canInviteMembers: z.boolean({
          invalid_type_error: 'canInviteMembers must be a boolean',
        }).optional(),
        
        canRemoveMembers: z.boolean({
          invalid_type_error: 'canRemoveMembers must be a boolean',
        }).optional(),
      }).refine(
        (data) => data.canCreateTasks !== undefined || 
                  data.canInviteMembers !== undefined || 
                  data.canRemoveMembers !== undefined,
        {
          message: 'At least one permission field must be provided',
        }
      )
    ).min(1, 'At least one member permission update is required'),
  }),
});

/**
 * Toggle Task Creation Permission Validation Schema
 * Validates single permission toggle
 * @see Figma: permission-flow.png
 */
export const toggleTaskCreationPermissionValidationSchema = z.object({
  body: z.object({
    memberId: z.string({
      required_error: 'Member ID is required',
      invalid_type_error: 'Member ID must be a string',
    }).min(1, 'Member ID cannot be empty'),
    
    canCreateTasks: z.boolean({
      required_error: 'canCreateTasks is required',
      invalid_type_error: 'canCreateTasks must be a boolean',
    }),
  }),
});
