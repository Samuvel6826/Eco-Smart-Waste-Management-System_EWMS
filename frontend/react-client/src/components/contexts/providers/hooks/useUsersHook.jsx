// useUsersContext.jsx
import { useContext } from 'react';
import { UsersContext } from '../../UsersContext';

export function useUsersHook() {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error('useUsersContext must be used within a UsersProvider');
    }
    return context;
}