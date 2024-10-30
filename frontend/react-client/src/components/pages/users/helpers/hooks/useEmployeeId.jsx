// src/components/users/create/hooks/useEmployeeId.js
import { useCallback } from 'react';

export const useEmployeeId = (users) => {
    return useCallback(() => {
        if (!users?.length) return 'EMP001';
        const maxId = users
            .filter(user => user?.employeeId)
            .map(user => parseInt(user.employeeId.replace(/\D/g, ''), 10))
            .reduce((max, current) => Math.max(max, current), 0);
        return `EMP${String(maxId + 1).padStart(3, '0')}`;
    }, [users]);
};