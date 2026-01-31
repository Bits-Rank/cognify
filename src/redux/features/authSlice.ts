import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define User interface inline or import it if shared.
// Based on auth-context usage, replicating the shape here to avoid circular deps or complex imports if User is defined in context file.
// Ideally, types should be in a separate file. For now, I'll match the auth-context shape.

export type SubscriptionTier = 'free' | 'pro' | 'creator';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    subscription: SubscriptionTier;
    promptsUnlocked: string[];
    generationsUsed: number;
    generationsReset: string;
    createdAt: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    isLoading: true,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isLoading = false;
        },
        clearUser: (state) => {
            state.user = null;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;

export default authSlice.reducer;
