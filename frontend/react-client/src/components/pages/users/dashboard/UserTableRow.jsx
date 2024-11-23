import React from 'react';
import {
    Typography,
    Chip,
    IconButton,
    Tooltip
} from "@material-tailwind/react";
import {
    FiKey,
    FiTrash2,
    FiUser
} from "react-icons/fi";

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

    // Format full name with proper capitalization
    const fullName = `${user.firstName} ${user.lastName}`
        .split(' ') // Split the name into words
        .map((word, index, arr) => {
            if (index < arr.length - 1) { // For first name(s)
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            } else { // For last name
                return word.toUpperCase();
            }
        })
        .join(' '); // Join the words back into a single string

    const ActionButton = ({ icon: Icon, label, color, onClick }) => (
        <Tooltip content={label}>
            <IconButton
                variant="text"
                color={color}
                onClick={onClick}
                className="transition-transform hover:scale-110 focus:scale-105"
            >
                <Icon className="h-5 w-5" />
            </IconButton>
        </Tooltip>
    );

    return (
        <tr
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group transition-all duration-300 hover:bg-blue-gray-50/30 hover:shadow-md"
            role="row"
        >
            {/* Index Column */}
            <td className={`${classes} font-medium w-16`}>
                <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal transition-colors group-hover:text-blue-gray-900"
                >
                    {index + 1 + page * rowsPerPage}
                </Typography>
            </td>

            {/* Employee ID Column */}
            <td className={classes}>
                <div className="flex items-center justify-center gap-2">
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-medium transition-colors group-hover:text-blue-gray-900"
                    >
                        {user.employeeId}
                    </Typography>
                </div>
            </td>

            {/* Name Column */}
            <td className={`${classes} min-w-[180px]`}>
                <div className="flex items-center justify-center gap-2">
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal transition-colors group-hover:text-blue-gray-900"
                    >
                        {fullName}
                    </Typography>
                </div>
            </td>

            {/* Email Column */}
            <td className={`${classes} min-w-[220px]`}>
                <div className="flex items-center justify-center gap-2">
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal transition-colors group-hover:text-blue-gray-900"
                    >
                        {user.email.toLowerCase()}
                    </Typography>
                </div>
            </td>

            {/* Role Column */}
            <td className={`${classes} min-w-[120px]`}>
                <div className="flex justify-center">
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

            {/* Bin Locations Column */}
            <td className={`${classes} min-w-[200px]`}>
                <div className="flex items-center justify-center gap-2">
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
                                <Tooltip
                                    content={
                                        <div className="p-2">
                                            <Typography variant="small" color="white">
                                                {user.assignedBinLocations.slice(2).join(', ')}
                                            </Typography>
                                        </div>
                                    }
                                >
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

            {/* Actions Column */}
            <td className={`${classes} min-w-[150px]`}>
                <div className="flex items-center justify-center gap-2">
                    <ActionButton
                        icon={FiKey}
                        label="Change Password"
                        color="blue-gray"
                        onClick={() => handleChangePassword(user.employeeId)}
                    />

                    <ActionButton
                        icon={FiTrash2}
                        label="Delete User"
                        color="red"
                        onClick={() => handleDeleteUser(user.employeeId)}
                    />

                    <ActionButton
                        icon={FiUser}
                        label="View Profile"
                        color="blue-gray"
                        onClick={() => navigate(`/user-profile/${user.employeeId}`)}
                    />
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;