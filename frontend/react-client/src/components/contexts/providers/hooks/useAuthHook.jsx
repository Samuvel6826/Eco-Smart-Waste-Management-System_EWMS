// useAuthHook.jsx (for the hook)
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';

export function useAuthHook() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}