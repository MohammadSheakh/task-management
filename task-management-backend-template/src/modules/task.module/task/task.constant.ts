/**
 * Task Status Enum
 * Represents the current state of a task in its lifecycle
 */
export enum TTaskStatus {
  pending = 'pending',
  inProgress = 'inProgress',
  completed = 'completed',
}

/**
 * Task Type Enum
 * Defines who can work on the task
 */
export enum TTaskType {
  personal = 'personal', // Task for oneself
  singleAssignment = 'singleAssignment', // Assigned to one person
  collaborative = 'collaborative', // Assigned to multiple people
}

/**
 * Task Priority Levels
 */
export enum TTaskPriority {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

/**
 * Daily Task Limit Configuration
 * Based on the "Less is More" philosophy - 3 to 5 meaningful tasks per day
 */
export const DAILY_TASK_LIMIT = {
  min: 3,
  max: 5,
};
