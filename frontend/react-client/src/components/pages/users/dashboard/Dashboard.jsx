import React, { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useUsersContext } from '../../../contexts/UsersContext';
import {
    Typography,
    Alert,
    Card,
    Spinner,
    Button
} from "@material-tailwind/react";
import {
    ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

// Import components directly instead of lazy loading for now
import { UserStatsCard } from './UserStatsCard';
import { UsersListHeader } from './UsersListHeader';
import { UsersListBody } from './UsersListBody';
import { UsersListFooter } from './UsersListFooter';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { AssignBinsDialog } from './AssignBinsDialog';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
        <Spinner className="h-8 w-8" />
    </div>
);

function Dashboard() {
    const { user, logout } = useAuth();
    const {
        users,
        loading: userLoading,
        error: userError,
        fetchUsers,
        deleteUser: deleteUserFromContext,
        changePassword
    } = useUsersContext();

    const [state, setState] = useState({
        deleteUserId: null,
        showConfirmation: false,
        selectedRole: 'All',
        openAssignDialog: false,
        changePasswordDialog: false,
        passwordData: { newPassword: '', confirmPassword: '' },
        changePasswordUserId: null,
        isChangingPassword: false,
        searchTerm: '',
        page: 0,
        rowsPerPage: 7,
        isRefreshing: false
    });

    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, isRefreshing: true }));
        try {
            await fetchUsers();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Error fetching data. Please try again.';
            toast.error(errorMessage);
            if (error?.response?.status === 401) {
                logout();
            }
        } finally {
            setState(prev => ({ ...prev, isRefreshing: false }));
        }
    }, [fetchUsers, logout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (userError) {
            toast.error(`User Error: ${userError}`, {
                duration: 5000,
                position: 'top-right',
            });
        }
    }, [userError]);

    const rolesOrder = {
        Admin: 1,
        Manager: 2,
        Technician: 3,
        Supervisor: 4,
    };

    const getRoleColor = (role) => ({
        Admin: "blue",
        Manager: "green",
        Technician: "amber",
        Supervisor: "purple"
    }[role] || "gray");

    const filteredUsers = useMemo(() => {
        return (users || [])
            .filter((user) => {
                if (!user) return false;
                const matchesRole = state.selectedRole === 'All' || user.role === state.selectedRole;
                const searchTermLower = state.searchTerm.toLowerCase();
                const matchesSearch = [
                    user.employeeId,
                    user.firstName,
                    user.lastName,
                    user.email
                ].some(field => field?.toLowerCase().includes(searchTermLower));
                return matchesRole && matchesSearch;
            })
            .sort((a, b) => (rolesOrder[a.role] || 0) - (rolesOrder[b.role] || 0));
    }, [users, state.selectedRole, state.searchTerm]);

    const paginatedUsers = useMemo(() => (
        filteredUsers.slice(
            state.page * state.rowsPerPage,
            state.page * state.rowsPerPage + state.rowsPerPage
        )
    ), [filteredUsers, state.page, state.rowsPerPage]);

    const totalPages = useMemo(() => (
        Math.ceil(filteredUsers.length / state.rowsPerPage)
    ), [filteredUsers.length, state.rowsPerPage]);

    const handleAction = useCallback((actionType, payload = {}) => {
        setState(prev => ({ ...prev, ...payload }));
    }, []);

    const submitChangePassword = async () => {
        const { newPassword, confirmPassword } = state.passwordData;

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        handleAction('setIsChangingPassword', { isChangingPassword: true });
        try {
            await changePassword(state.changePasswordUserId, newPassword);
            handleAction('closeChangePasswordDialog', {
                changePasswordDialog: false,
                passwordData: { newPassword: '', confirmPassword: '' }
            });
            toast.success('Password changed successfully');
        } catch (error) {
            toast.error('Failed to change password: ' + (error.message || 'Unknown error'));
        } finally {
            handleAction('setIsChangingPassword', { isChangingPassword: false });
        }
    };

    if (userLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-blue-gray-50/50">
            <div className="border-b border-gray-200 bg-white px-20 py-4 shadow-sm">
                <div className="mb-8">
                    <Typography variant="h5" color="blue-gray" className="mb-4">
                        Users Statistics
                    </Typography>


                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {Object.entries(rolesOrder).map(([role]) => (
                            <UserStatsCard
                                key={role}
                                role={role}
                                count={users?.filter(user => user.role === role).length || 0}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Card className="w-full overflow-hidden rounded-xl bg-white shadow-lg">
                    <div className="px-6">
                        <UsersListHeader
                            filteredUsers={filteredUsers}
                            searchTerm={state.searchTerm}
                            setSearchTerm={(term) => handleAction('setSearchTerm', { searchTerm: term })}
                            selectedRole={state.selectedRole}
                            setSelectedRole={(role) => handleAction('setSelectedRole', { selectedRole: role })}
                            navigate={navigate}
                            rolesOrder={rolesOrder}
                            setOpenAssignDialog={(open) => handleAction('setOpenAssignDialog', { openAssignDialog: open })}
                        />
                    </div>

                    <div className="p-6">
                        <UsersListBody
                            userLoading={userLoading}
                            paginatedUsers={paginatedUsers}
                            page={state.page}
                            rowsPerPage={state.rowsPerPage}
                            getRoleColor={getRoleColor}
                            handleChangePassword={(userId) => handleAction('handleChangePassword', {
                                changePasswordUserId: userId,
                                changePasswordDialog: true
                            })}
                            handleDeleteUser={(userId) => handleAction('handleDeleteUser', {
                                deleteUserId: userId,
                                showConfirmation: true
                            })}
                            navigate={navigate}
                            setSearchTerm={(term) => handleAction('setSearchTerm', { searchTerm: term })}
                            setSelectedRole={(role) => handleAction('setSelectedRole', { selectedRole: role })}
                        />
                    </div>

                    <div className="border-t border-gray-200">
                        <UsersListFooter
                            page={state.page}
                            totalPages={totalPages}
                            rowsPerPage={state.rowsPerPage}
                            handleChangeRowsPerPage={(value) => handleAction('handleChangeRowsPerPage', {
                                rowsPerPage: parseInt(value, 10),
                                page: 0
                            })}
                            handleChangePage={(newPage) => handleAction('handleChangePage', { page: newPage })}
                            filteredUsers={filteredUsers}
                        />
                    </div>
                </Card>
            </div>

            <ChangePasswordDialog
                open={state.changePasswordDialog}
                onClose={() => handleAction('closeChangePasswordDialog', {
                    changePasswordDialog: false,
                    passwordData: { newPassword: '', confirmPassword: '' }
                })}
                passwordData={state.passwordData}
                setPasswordData={(data) => handleAction('setPasswordData', { passwordData: data })}
                onSubmit={submitChangePassword}
                isChangingPassword={state.isChangingPassword}
            />

            <DeleteConfirmationDialog
                open={state.showConfirmation}
                onClose={() => handleAction('closeConfirmation', { showConfirmation: false })}
                onConfirm={async () => {
                    try {
                        await deleteUserFromContext(state.deleteUserId);
                        toast.success('User deleted successfully.');
                        handleAction('closeConfirmation', {
                            showConfirmation: false,
                            deleteUserId: null
                        });
                        fetchUsers();
                    } catch (error) {
                        toast.error('Failed to delete user: ' + (error.message || 'Unknown error'));
                    }
                }}
            />

            <AssignBinsDialog
                open={state.openAssignDialog}
                onClose={() => handleAction('closeAssignDialog', { openAssignDialog: false })}
                onAssignSuccess={fetchData}
            />
        </div>
    );
}

export default React.memo(Dashboard);