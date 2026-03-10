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

/**
 * Create Member Account Validation Schema
 * Validates member creation by Primary user
 * @see Figma: team-members/create-child-flow.png
 */
export const createMemberAccountValidationSchema = z.object({
  body: z.object({
    username: z.string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string',
    })
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters'),

    email: z.string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
      .email('Please provide a valid email address')
      .transform((val) => val.toLowerCase()),

    phoneNumber: z.string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    })
      .optional(),

    address: z.string({
      invalid_type_error: 'Address must be a string',
    })
      .optional(),

    gender: z.enum(['male', 'female', 'other'], {
      required_error: 'Gender is required',
      invalid_type_error: 'Gender must be male, female, or other',
    }),

    dateOfBirth: z.string({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Date of birth must be a string',
    })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),

    age: z.number({
      required_error: 'Age is required',
      invalid_type_error: 'Age must be a number',
    })
      .min(1, 'Age must be at least 1')
      .max(150, 'Age cannot exceed 150'),

    supportMode: z.enum(['calm', 'encouraging', 'logical'], {
      required_error: 'Support mode is required',
      invalid_type_error: 'Support mode must be calm, encouraging, or logical',
    }),

    notificationStyle: z.enum(['gentle', 'firm', 'xyz'], {
      invalid_type_error: 'Notification style must be gentle, firm, or xyz',
    })
      .default('gentle'),

    password: z.string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

/**
 * Update Member Profile Validation Schema
 * Validates member profile updates by Primary user
 * @see Figma: team-members/edit-child-flow.png
 */
export const updateMemberProfileValidationSchema = z.object({
  body: z.object({
    username: z.string({
      invalid_type_error: 'Username must be a string',
    })
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters')
      .optional(),

    email: z.string({
      invalid_type_error: 'Email must be a string',
    })
      .email('Please provide a valid email address')
      .transform((val) => val.toLowerCase())
      .optional(),

    phoneNumber: z.string({
      invalid_type_error: 'Phone number must be a string',
    })
      .optional(),

    address: z.string({
      invalid_type_error: 'Address must be a string',
    })
      .optional(),

    gender: z.enum(['male', 'female', 'other'], {
      invalid_type_error: 'Gender must be male, female, or other',
    })
      .optional(),

    dateOfBirth: z.string({
      invalid_type_error: 'Date of birth must be a string',
    })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
      .optional(),

    age: z.number({
      invalid_type_error: 'Age must be a number',
    })
      .min(1, 'Age must be at least 1')
      .max(150, 'Age cannot exceed 150')
      .optional(),

    supportMode: z.enum(['calm', 'encouraging', 'logical'], {
      invalid_type_error: 'Support mode must be calm, encouraging, or logical',
    })
      .optional(),

    notificationStyle: z.enum(['gentle', 'firm', 'xyz'], {
      invalid_type_error: 'Notification style must be gentle, firm, or xyz',
    })
      .optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided for update',
    }
  ),
});
