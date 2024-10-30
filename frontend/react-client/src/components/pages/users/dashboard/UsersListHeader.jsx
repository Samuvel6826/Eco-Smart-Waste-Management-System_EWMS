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
    UserPlusIcon,
    Square3Stack3DIcon,
    MagnifyingGlassIcon,
    XCircleIcon,
    UsersIcon,
    UserIcon,
    ShieldCheckIcon,
    BuildingOffice2Icon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";

const RoleIcon = ({ role }) => {
    switch (role) {
        case 'Admin':
            return <ShieldCheckIcon className="h-4 w-4" />;
        case 'Manager':
            return <BuildingOffice2Icon className="h-4 w-4" />;
        case 'Supervisor':
            return <ClipboardDocumentCheckIcon className="h-4 w-4" />;
        default:
            return <UsersIcon className="h-4 w-4" />;
    }
};

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
                <div className="flex items-center justify-between">
                    <div>
                        <Typography variant="h4" color="blue-gray">
                            Users Management
                        </Typography>
                        <div className="mt-2 flex items-center gap-2">
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

                    <div className="flex gap-3">
                        <Tooltip content="Add New User">
                            <Button
                                size="sm"
                                className="relative z-10 flex items-center gap-2"
                                color="blue"
                                onClick={() => navigate('/create-user')}
                            >
                                <UserPlusIcon className="h-4 w-4" />
                                New User
                            </Button>
                        </Tooltip>
                        <Tooltip content="Assign Bin Locations">
                            <Button
                                size="sm"
                                className="relative z-10 flex items-center gap-2"
                                color="green"
                                onClick={() => setOpenAssignDialog(true)}
                            >
                                <Square3Stack3DIcon className="h-4 w-4" />
                                Assign Bins
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </CardHeader>

            <CardBody className="px-0 pb-0 pt-4">
                <div className="flex items-center gap-4">
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
                                        <XCircleIcon className="h-5 w-5 text-gray-500 transition-colors hover:text-red-500" />
                                    </IconButton>
                                ) : (
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                                )
                            }
                        />
                    </div>

                    <div className="w-1/2">
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