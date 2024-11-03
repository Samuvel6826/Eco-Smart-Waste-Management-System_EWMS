import React from 'react';
import {
    Typography,
    Button,
    Input,
    IconButton,
    Select,
    Option,
    Chip,
    Tooltip,
    Card,
    CardHeader,
    CardBody,
} from "@material-tailwind/react";
import {
    FiUserPlus,
    FiLayers,
    FiSearch,
    FiXCircle,
    FiUsers,
    FiUser,
    FiShield,
    FiBookmark,
    FiClipboard,
    FiHome
} from 'react-icons/fi';

const RoleIcon = ({ role }) => {
    switch (role) {
        case 'Admin':
            return <FiShield className="h-4 w-4" />;
        case 'Manager':
            return <FiHome className="h-4 w-4" />;
        case 'Supervisor':
            return <FiClipboard className="h-4 w-4" />;
        default:
            return <FiUsers className="h-4 w-4" />;
    }
};

const ActionButtons = ({ navigate, setOpenAssignDialog }) => (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
        <Tooltip content="Add New User">
            <Button
                size="sm"
                className="relative z-10 flex items-center justify-center gap-2"
                color="blue"
                onClick={() => navigate('/create-user')}
                fullWidth
            >
                <FiUserPlus className="h-4 w-4" />
                <span className="sm:inline">New User</span>
            </Button>
        </Tooltip>
        <Tooltip content="Assign Bin Locations">
            <Button
                size="sm"
                className="relative z-10 flex items-center justify-center gap-2"
                color="green"
                onClick={() => setOpenAssignDialog(true)}
                fullWidth
            >
                <FiLayers className="h-4 w-4" />
                <span className="sm:inline">Assign Bins</span>
            </Button>
        </Tooltip>
    </div>
);

export const UsersListHeader = ({
    filteredUsers,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
    navigate,
    rolesOrder,
    setOpenAssignDialog
}) => {
    return (
        <Card className="relative z-10 bg-transparent shadow-none">
            <CardHeader
                floated={false}
                shadow={false}
                className="rounded-none bg-transparent px-0 pt-0"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <Typography variant="h4" color="blue-gray" className="text-center sm:text-left">
                            Users Management
                        </Typography>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <Chip
                                size="sm"
                                variant="ghost"
                                value={`${filteredUsers.length} total users`}
                                color="blue"
                            />
                            {selectedRole !== 'All' && (
                                <Chip
                                    size="sm"
                                    variant="ghost"
                                    value={selectedRole}
                                    onClose={() => setSelectedRole('All')}
                                    color="indigo"
                                />
                            )}
                        </div>
                    </div>

                    <ActionButtons
                        navigate={navigate}
                        setOpenAssignDialog={setOpenAssignDialog}
                    />
                </div>
            </CardHeader>

            <CardBody className="px-0 pb-0 pt-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            label="Search users..."
                            className="!border-gray-300 focus:!border-blue-500"
                            containerProps={{
                                className: "min-w-[240px]",
                            }}
                            icon={
                                searchTerm ? (
                                    <IconButton
                                        variant="text"
                                        className="!absolute right-1 top-1 rounded-full hover:bg-gray-50"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        <FiXCircle className="h-5 w-5 text-gray-500 transition-colors hover:text-red-500" />
                                    </IconButton>
                                ) : (
                                    <FiSearch className="h-5 w-5 text-gray-500" />
                                )
                            }
                        />
                    </div>

                    <div className="w-full sm:w-1/2">
                        <Select
                            value={selectedRole}
                            onChange={setSelectedRole}
                            label="Filter by Role"
                            className="z-20"
                            menuProps={{ className: "z-20" }}
                            selected={(element) => (
                                <div className="flex items-center gap-2">
                                    <RoleIcon role={selectedRole} />
                                    <span>{selectedRole}</span>
                                </div>
                            )}
                        >
                            <Option value="All" className="flex items-center gap-2">
                                <RoleIcon role="All" />
                                <span>All Roles</span>
                            </Option>

                            {Object.keys(rolesOrder).map((role) => (
                                <Option
                                    key={role}
                                    value={role}
                                    className="flex items-center gap-2"
                                >
                                    <RoleIcon role={role} />
                                    <span>{role}</span>
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default UsersListHeader;