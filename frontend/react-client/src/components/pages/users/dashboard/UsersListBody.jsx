// UsersListBody.jsx
import React from 'react';
import {
    Typography,
    Button,
    Spinner
} from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import UserTableRow from './UserTableRow'

const TABLE_HEAD = ["#", "Employee ID", "Name", "Email", "Role", "Bin Location", "Actions"];

export const UsersListBody = ({
    userLoading,
    paginatedUsers,
    page,
    rowsPerPage,
    getRoleColor,
    handleChangePassword,
    handleDeleteUser,
    navigate,
    setSearchTerm,
    setSelectedRole
}) => (
    <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full min-w-max table-auto">
            <thead>
                <tr className="bg-gray-50">
                    {TABLE_HEAD.map((head) => (
                        <th key={head} className="border-b border-blue-gray-100 p-4">
                            <Typography variant="small" className="font-semibold text-gray-700">
                                {head}
                            </Typography>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {userLoading ? (
                    <tr>
                        <td colSpan={7} className="p-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Spinner className="h-8 w-8 text-blue-500" />
                                <Typography className="text-gray-600">
                                    Loading users...
                                </Typography>
                            </div>
                        </td>
                    </tr>
                ) : paginatedUsers.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="p-8">
                            <div className="flex flex-col items-center gap-3">
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
                                        setSearchTerm('');
                                        setSelectedRole('All');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </td>
                    </tr>
                ) : (
                    paginatedUsers.map((user, index) => (
                        <UserTableRow
                            key={user.employeeId}
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
                    ))
                )}
            </tbody>
        </table>
    </div>
);