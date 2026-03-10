//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { z } from 'zod';

export const sendInvitationToBeAdminValidationSchema = z.object({

  body: z.object({
    email : z.
      string({
        required_error: 'email is required.',
        invalid_type_error: 'email must be a string.',
      })
      .email('Invalid email address.'),
    password : z
      .string({
        required_error: 'password is required.',
        invalid_type_error: 'password must be a string.',
      }),

    name: z.string({
      required_error: 'name is required.',
      invalid_type_error: 'name must be a string.',
    }),

    role :  z.string({
        required_error: 'role is required.',
        invalid_type_error: 'role must be a string.',
      }),
    message :  z.string({
        required_error: 'message is required.',
        invalid_type_error: 'message must be a string.',
      })

    }),
});

// ────────────────────────────────────────────────────────────────────────
// Support Mode & Notification Preferences Validation
// ────────────────────────────────────────────────────────────────────────

/**
 * Support Mode Validation Schema
 * @see Figma: response-based-on-mode.png
 */
export const updateSupportModeValidationSchema = z.object({
  body: z.object({
    supportMode: z.enum(['calm', 'encouraging', 'logical'], {
      required_error: 'Support mode is required',
      invalid_type_error: 'Support mode must be one of: calm, encouraging, logical',
    }),
  }),
});

/**
 * Notification Style Validation Schema
 * @see Figma: profile-permission-account-interface.png (Notification Style section)
 */
export const updateNotificationStyleValidationSchema = z.object({
  body: z.object({
    notificationStyle: z.enum(['gentle', 'firm', 'xyz'], {
      required_error: 'Notification style is required',
      invalid_type_error: 'Notification style must be one of: gentle, firm, xyz',
    }),
  }),
});
