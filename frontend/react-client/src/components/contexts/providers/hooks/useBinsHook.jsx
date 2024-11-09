// useBinsContext.jsx
import { useContext } from 'react';
import { BinsContext } from '../../BinsContext';

export function useBinsHook() {
    const context = useContext(BinsContext);
    if (!context) {
        throw new Error('useBinsContext must be used within a BinsProvider');
    }
    return context;
}
