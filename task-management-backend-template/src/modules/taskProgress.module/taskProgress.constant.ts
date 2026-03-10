/**
 * Task Progress Status Enum
 */
export const TASK_PROGRESS_STATUS = {
  NOT_STARTED: 'notStarted',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
} as const;

export type TTaskProgressStatus = typeof TASK_PROGRESS_STATUS[keyof typeof TASK_PROGRESS_STATUS];

/**
 * Default values for task progress
 */
export const TASK_PROGRESS_DEFAULTS = {
  STATUS: TASK_PROGRESS_STATUS.NOT_STARTED,
  PROGRESS_PERCENTAGE: 0,
  COMPLETED_SUBTASK_INDEXES: [] as number[],
  IS_DELETED: false,
} as const;

/**
 * Cache configuration for task progress operations
 */
export const TASK_PROGRESS_CACHE_CONFIG = {
  PREFIX: 'taskProgress',
  PROGRESS_DETAIL_TTL: 300,        // 5 minutes
  CHILDREN_PROGRESS_TTL: 180,      // 3 minutes
  TASKS_PROGRESS_TTL: 180,         // 3 minutes
  SUMMARY_TTL: 120,                // 2 minutes
} as const;

/**
 * Rate limits for task progress operations
 */
export const TASK_PROGRESS_RATE_LIMITS = {
  UPDATE_PROGRESS: {
    windowMs: 60000,               // 1 minute
    max: 30,                       // 30 updates per minute
    message: 'Too many progress updates, please slow down',
  },
  GENERAL: {
    windowMs: 60000,               // 1 minute
    max: 100,                      // 100 requests per minute
    message: 'Too many requests, please try again later',
  },
} as const;

/**
 * Progress update events for activity feed
 */
export const TASK_PROGRESS_EVENTS = {
  STARTED: 'task_started',
  SUBTASK_COMPLETED: 'subtask_completed',
  TASK_COMPLETED: 'task_completed',
} as const;
