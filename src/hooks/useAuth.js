/**
 * Simple useAuth hook that uses AuthContext
 * This replaces the old Redux-based useAuth hook
 */

export { useAuth } from '../contexts/AuthContext';

// Re-export for backward compatibility
import { useAuth as useAuthContext } from '../contexts/AuthContext';
export default useAuthContext;
