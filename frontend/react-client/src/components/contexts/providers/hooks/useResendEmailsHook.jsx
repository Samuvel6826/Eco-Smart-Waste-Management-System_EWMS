// useResendEmail.jsx
import { useContext } from 'react';
import { ResendEmailsContext } from '../../ResendEmailsContext';

export function useResendEmailsHook() {
    const context = useContext(ResendEmailsContext);
    if (!context) {
        throw new Error('useResendEmail must be used within a ResendEmailProvider');
    }
    return context;
}