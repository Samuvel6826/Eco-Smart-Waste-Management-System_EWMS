// src/components/navigation/ProfileMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, List, ListItem, Typography } from '@material-tailwind/react';
import { IoSettings } from 'react-icons/io5';
import { FaCircleUser } from 'react-icons/fa6';
import { UserAvatar } from './UserAvatar';
import { UserBadge } from './UserBadge';

export const ProfileMenu = ({ user, onClose }) => (
    <div className="fixed inset-0 z-[999] bg-transparent" onClick={onClose}>
        <Card className="absolute right-0 top-12 w-72 transform overflow-hidden shadow-xl transition-all duration-200 ease-in-out">
            <CardBody className="p-0">
                <div className="border-b border-blue-gray-50 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                    <div className="flex items-center gap-4">
                        <UserAvatar />
                        <div className="flex-1">
                            <Typography variant="h6" color="blue-gray" className="font-bold">
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="small" color="gray" className="font-medium">
                                {user?.email}
                            </Typography>
                            <UserBadge role={user?.role} />
                        </div>
                    </div>
                </div>

                <List className="p-0">
                    <Link to="/profile" onClick={onClose}>
                        <ListItem className="rounded-none transition-colors duration-200 hover:bg-blue-50">
                            <FaCircleUser className="h-5 w-5 text-blue-600" />
                            <Typography variant="small" className="ml-3 font-medium">
                                My Profile
                            </Typography>
                        </ListItem>
                    </Link>
                    <Link to="/settings" onClick={onClose}>
                        <ListItem className="rounded-none transition-colors duration-200 hover:bg-blue-50">
                            <IoSettings className="h-5 w-5 text-blue-600" />
                            <Typography variant="small" className="ml-3 font-medium">
                                Settings
                            </Typography>
                        </ListItem>
                    </Link>
                </List>
            </CardBody>
        </Card>
    </div>
);