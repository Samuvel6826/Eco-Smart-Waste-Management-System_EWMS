import React from 'react';
import {
    Typography,
    Chip,
    IconButton,
    Tooltip
} from "@material-tailwind/react";

import { RiLockPasswordFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { ImProfile } from "react-icons/im";

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
    const [isHovered, setIsHovered] = React.useState(false);

    const classes = `
        p-4
        ${isLast ? "" : "border-b"}
        border-x
        border-blue-gray-100
        transition-colors duration-300
        ${isHovered ? "bg-blue-gray-50/50" : ""}
        text-center
        relative
        first:border-l-0
        last:border-r-0
    `;

    return (
        <tr
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group transition-shadow duration-300 hover:shadow-md"
            role="row"
        >
            <td className={`${classes} font-medium`}>
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal transition-colors group-hover:text-blue-gray-900"
                >
                    {index + 1 + page * rowsPerPage}
                </Typography>
            </td>

            <td className={classes}>
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal transition-colors group-hover:text-blue-gray-900"
                >
                    {user.employeeId}
                </Typography>
            </td>

            <td className={`${classes} min-w-[180px]`}>
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal transition-colors group-hover:text-blue-gray-900"
                >
                    {`${user.firstName} ${user.lastName}`}
                </Typography>
            </td>

            <td className={`${classes} min-w-[220px]`}>
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal transition-colors group-hover:text-blue-gray-900"
                >
                    {user.email}
                </Typography>
            </td>

            <td className={`${classes} min-w-[120px]`}>
                <div className="flex flex-wrap justify-center gap-2">
                    {user.role && (
                        <Chip
                            value={user.role}
                            color={getRoleColor(user.role)}
                            size="sm"
                            variant="gradient"
                            className="rounded-full shadow-sm transition-transform hover:scale-105"
                        />
                    )}
                </div>
            </td>

            <td className={`${classes} min-w-[200px]`}>
                <div className="flex flex-wrap justify-center gap-2">
                    {user.assignedBinLocations?.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1">
                            {user.assignedBinLocations.slice(0, 2).map((location) => (
                                <Chip
                                    key={location}
                                    value={location}
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full transition-all hover:bg-blue-gray-50"
                                />
                            ))}
                            {user.assignedBinLocations.length > 2 && (
                                <Tooltip content={user.assignedBinLocations.slice(2).join(', ')}>
                                    <Chip
                                        value={`+${user.assignedBinLocations.length - 2}`}
                                        variant="ghost"
                                        size="sm"
                                        className="cursor-pointer rounded-full transition-all hover:bg-blue-gray-50"
                                    />
                                </Tooltip>
                            )}
                        </div>
                    ) : (
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal italic opacity-60"
                        >
                            Not Assigned
                        </Typography>
                    )}
                </div>
            </td>

            <td className={`${classes} min-w-[150px]`}>
                <div className="flex items-center justify-center gap-2">
                    <Tooltip content="Change Password">
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={() => handleChangePassword(user.employeeId)}
                            className="transition-transform hover:scale-110"
                        >
                            <RiLockPasswordFill className="h-6 w-6" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Delete User">
                        <IconButton
                            variant="text"
                            color="red"
                            onClick={() => handleDeleteUser(user.employeeId)}
                            className="transition-transform hover:scale-110"
                        >
                            <MdDelete className="h-6 w-6" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="View Profile">
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={() => navigate(`/user-profile/${user.employeeId}`)}
                            className="transition-transform hover:scale-110"
                        >
                            <ImProfile className="h-6 w-6" />
                        </IconButton>
                    </Tooltip>
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;