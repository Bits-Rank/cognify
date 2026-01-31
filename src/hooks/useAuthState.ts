import { useAppSelector } from '../redux/hooks';

/**
 * Custom hook to get user auth state from Redux.
 * Use this hook in components that need to check if a user is logged in or access user data.
 * The AuthProvider automatically syncs Firebase auth state to Redux on load.
 */
export function useAuthState() {
    const user = useAppSelector((state) => state.auth.user);
    const isLoading = useAppSelector((state) => state.auth.isLoading);

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
    };
}
