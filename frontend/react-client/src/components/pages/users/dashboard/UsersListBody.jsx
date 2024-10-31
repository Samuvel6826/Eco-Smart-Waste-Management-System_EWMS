import React from 'react';
import {
    Typography,
    Button,
    Spinner,
    Card
} from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import UserTableRow from './UserTableRow';

const TABLE_HEAD = ["#", "Employee ID", "Name", "Email", "Role", "Bin Location", "Actions"];

const LoadingState = () => (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-blue-gray-100 p-8">
        <Spinner className="h-8 w-8 text-blue-500" />
        <Typography className="text-gray-600">
            Loading users...
        </Typography>
    </div>
);

const EmptyState = ({ setSearchTerm, setSelectedRole }) => (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-blue-gray-100 p-8">
        <div className="rounded-full bg-gray-100 p-3">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
        </div>
        <Typography variant="h6" className="text-gray-700">
            No users found
        </Typography>
        <Typography className="max-w-sm text-center text-gray-500">
            Try adjusting your search or filter criteria
        </Typography>
        <Button
            variant="outlined"
            color="blue"
            className="mt-2"
            onClick={() => {
                setSearchTerm?.('');
                setSelectedRole?.('All');
            }}
        >
            Clear Filters
        </Button>
    </div>
);

const MobileUserCard = ({ user, index, page, rowsPerPage, getRoleColor, handleChangePassword, handleDeleteUser, navigate }) => (
    <Card className="mb-4 border border-blue-gray-100 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between border-b border-blue-gray-100 pb-2">
            <Typography variant="small" color="gray" className="font-semibold">
                #{(page * rowsPerPage) + index + 1}
            </Typography>
            <Typography
                variant="small"
                color={getRoleColor(user.role)}
                className="font-medium"
            >
                {user.role}
            </Typography>
        </div>

        <div className="space-y-2 divide-y divide-blue-gray-100">
            <div className="py-2">
                <Typography variant="small" color="gray" className="font-semibold">
                    Employee ID
                </Typography>
                <Typography>{user.employeeId}</Typography>
            </div>

            <div className="py-2">
                <Typography variant="small" color="gray" className="font-semibold">
                    Name
                </Typography>
                <Typography>{`${user.firstName} ${user.lastName}`}</Typography>
            </div>

            <div className="py-2">
                <Typography variant="small" color="gray" className="font-semibold">
                    Email
                </Typography>
                <Typography className="break-all">{user.email}</Typography>
            </div>

            <div className="py-2">
                <Typography variant="small" color="gray" className="font-semibold">
                    Bin Location
                </Typography>
                <Typography>{user.binLocation || 'Not assigned'}</Typography>
            </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-blue-gray-100 pt-2">
            <Button
                size="sm"
                variant="outlined"
                onClick={() => handleChangePassword(user._id)}
            >
                Change Password
            </Button>
            <Button
                size="sm"
                variant="outlined"
                color="red"
                onClick={() => handleDeleteUser(user._id)}
            >
                Delete
            </Button>
        </div>
    </Card>
);

export const UsersListBody = ({
    userLoading = false,
    paginatedUsers = [],
    page = 0,
    rowsPerPage = 10,
    getRoleColor,
    handleChangePassword,
    handleDeleteUser,
    navigate,
    setSearchTerm,
    setSelectedRole
}) => {
    if (userLoading) {
        return <LoadingState />;
    }

    if (!Array.isArray(paginatedUsers) || paginatedUsers.length === 0) {
        return <EmptyState setSearchTerm={setSearchTerm} setSelectedRole={setSelectedRole} />;
    }

    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden">
                {paginatedUsers.map((user, index) => (
                    <MobileUserCard
                        key={user?.employeeId || index}
                        user={user}
                        index={index}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        getRoleColor={getRoleColor}
                        handleChangePassword={handleChangePassword}
                        handleDeleteUser={handleDeleteUser}
                        navigate={navigate}
                    />
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="overflow-x-auto rounded-lg border border-blue-gray-100">
                    <table className="w-full min-w-max table-auto border-collapse">
                        <thead>
                            <tr>
                                {TABLE_HEAD.map((head, index) => (
                                    <th
                                        key={head}
                                        className={`
                                            border-b border-blue-gray-100 bg-blue-gray-50/50 p-4
                                            ${index !== TABLE_HEAD.length - 1 ? 'border-r' : ''}
                                        `}
                                    >
                                        <Typography
                                            variant="small"
                                            className="text-center font-semibold text-gray-700"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-gray-100">
                            {paginatedUsers.map((user, index) => (
                                <UserTableRow
                                    key={user?.employeeId || index}
                                    user={user}
                                    index={index}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    isLast={index === paginatedUsers.length - 1}
                                    getRoleColor={getRoleColor}
                                    handleChangePassword={handleChangePassword}
                                    handleDeleteUser={handleDeleteUser}
                                    navigate={navigate}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};