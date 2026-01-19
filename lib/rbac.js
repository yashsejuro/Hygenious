// Role definitions
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff'
};

export const PERMISSIONS = {
    admin: ['view_all_audits', 'create_audit', 'edit_audit', 'delete_audit', 'view_analytics', 'manage_users', 'view_feedback', 'export_data'],
    manager: ['view_all_audits', 'create_audit', 'edit_audit', 'view_analytics', 'view_feedback', 'export_data'],
    staff: ['view_own_audits', 'create_audit', 'view_feedback']
};

export function hasPermission(userRole, permission) {
    if (!userRole || !PERMISSIONS[userRole]) return false;
    return PERMISSIONS[userRole].includes(permission);
}