'use client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * RoleGuard selectively renders children based on the user's user_type.
 * @param {string[]} allowedRoles Array of standard roles (e.g., ['student', 'teacher'])
 * @param {string[]} excludedRoles Array of standard roles to block
 * @param {boolean} currentSubscription (Optional) Future premium verification
 */
export default function RoleGuard({ children, allowedRoles = [], excludedRoles = [], fallback = null }) {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Avoid UI flash
  if (!user || !user.user_type) return fallback;

  // Convert strictly to lowercase for safety
  const currentRole = user.user_type.toLowerCase();

  if (excludedRoles.length > 0 && excludedRoles.includes(currentRole)) {
    return fallback;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return fallback;
  }

  return children;
}
