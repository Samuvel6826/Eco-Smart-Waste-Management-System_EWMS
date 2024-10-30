import React from 'react';
import {
    Typography,
    Chip,
    Badge,
    IconButton,
    Tooltip
} from "@material-tailwind/react";
import {
    Cog6ToothIcon,
    ExclamationTriangleIcon,
    UserCircleIcon
} from "@heroicons/react/24/solid";

const UserTableRow = ({
    user,
    index,
    page,
    rowsPerPage,
    isLast,
    getRoleColor,
    handleChangePassword,
    handleDeleteUser,
    navigate
}) => {
    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

    return (
        <tr>
            <td className={classes}>
                <Typography variant="small" color="blue-gray" className="font-normal">
                    {index + 1 + page * rowsPerPage}
                </Typography>
            </td>
            <td className={classes}>
                <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.employeeId}
                </Typography>
            </td>
            <td className={classes}>
                <Typography variant="small" color="blue-gray" className="font-normal">
                    {`${user.firstName} ${user.lastName}`}
                </Typography>
            </td>
            <td className={classes}>
                <Typography variant="small" color="blue-gray" className="font-normal">
                    {user.email}
                </Typography>
            </td>
            <td className={classes}>
                <div className="flex flex-wrap gap-2">
                    {user.role && (
                        <Chip
                            value={user.role}
                            color={getRoleColor(user.role)}
                            size="sm"
                            variant="gradient"
                            className="rounded-full"
                        />
                    )}
                </div>
            </td>
            <td className={classes}>
                <div className="flex flex-wrap gap-2">
                    {user.assignedBinLocations?.length > 0 ? (
                        user.assignedBinLocations.map((location) => (
                            <Chip
                                key={location}
                                value={location}
                                variant="ghost"
                                size="sm"
                                className="rounded-full"
                            />
                        ))
                    ) : (
                        <Typography variant="small" color="blue-gray" className="font-normal">
                            Not Assigned
                        </Typography>
                    )}
                </div>
            </td>
            <td className={classes}>
                <div className="flex gap-2">
                    <Tooltip content="Change Password">
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={() => handleChangePassword(user.employeeId)}
                        >
                            <Cog6ToothIcon className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content="Delete User">
                        <IconButton
                            variant="text"
                            color="red"
                            onClick={() => handleDeleteUser(user.employeeId)}
                        >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content="View Profile">
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={() => navigate(`/user-profile/${user.employeeId}`)}
                        >
                            <UserCircleIcon className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;