export type Role = 'student' | 'mentor' | 'admin' ;	

export enum TRole {
  student = 'student',
  mentor = 'mentor',
  admin = 'admin',
  common = 'common', // its not a role but a common access level
  commonUser = 'commonUser', // its not a role but a common access level
}

const allRoles: Record<Role, string[]> = {
  student: ['student', 'common', 'commonUser' ], 
  mentor: ['mentor', 'common' , 'commonUser'],
  admin: ['admin', 'common'],
};

// const Roles = Object.keys(allRoles) as Array<keyof typeof allRoles>;

const Roles = ["student", "mentor", "admin"] as const;

// Map the roles to their corresponding rights
const roleRights = new Map<Role, string[]>(
  Object.entries(allRoles) as [Role, string[]][],
);

export { Roles, roleRights };
