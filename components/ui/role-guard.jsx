'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Role Guard Component - Conditional rendering based on user role
 * 
 * @param {Array<string>} allowedRoles - Array of roles that can view the content
 * @param {ReactNode} children - Content to render if user has allowed role
 * @param {ReactNode} fallback - Optional fallback content to render if user doesn't have access
 * 
 * Supported roles: 'owner', 'staff', 'auditor', 'customer'
 * Note: 'staff' and 'auditor' are treated as equivalent
 * Default role (when no role is present): 'customer'
 */
export function RoleGuard({ allowedRoles = [], children, fallback = null }) {
  const { user } = useAuth();

  // Get user's role, default to 'customer' if not present
  const userRole = user?.role || 'customer';

  // Normalize roles: treat 'staff' and 'auditor' as equivalent
  const normalizeRole = (role) => {
    if (role === 'staff' || role === 'auditor') {
      return 'staff-auditor';
    }
    return role;
  };

  const normalizedUserRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  // Check if user has access
  const hasAccess = normalizedAllowedRoles.includes(normalizedUserRole);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}
