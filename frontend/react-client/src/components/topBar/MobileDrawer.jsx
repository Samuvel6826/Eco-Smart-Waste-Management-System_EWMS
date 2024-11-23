import React from 'react';
import { Link } from 'react-router-dom';
import {
    Drawer,
    IconButton,
    Typography,
    List,
    ListItem,
} from '@material-tailwind/react';
import { AiOutlineClose, AiOutlineUser, AiOutlineRight } from 'react-icons/ai';
import { IoSettingsOutline } from 'react-icons/io5';
import { FiPower } from 'react-icons/fi';

export const MobileDrawer = ({ open, onClose, user, menuItems, pathname, onLogout }) => {
    return (
        <Drawer
            open={open}
            onClose={onClose}
            className="p-0"
            placement="left"
        >
            <div className="flex h-screen flex-col bg-primary">
                {/* Header */}
                <div className="flex items-center justify-between border-border bg-gradient-to-r from-green-700 to-green-500 p-4">
                    <Typography variant="h5" className="font-bold text-primary">
                        EWMS
                    </Typography>
                    <IconButton
                        variant="text"
                        className="h-8 w-8 text-primary hover:bg-accent-dark/20"
                        onClick={onClose}
                    >
                        <AiOutlineClose className="h-5 w-5" />
                    </IconButton>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* User Profile Section */}
                    {user && (
                        <div className="border-b border-border bg-secondary p-4">
                            <div className="mb-3 flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-dark">
                                    <AiOutlineUser className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <Typography variant="h6" className="font-medium text-text-primary">
                                        {user.firstName} {user.lastName}
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="text-text-secondary"
                                    >
                                        {user.email}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Menu */}
                    <List className="bg-secondary">
                        {menuItems?.map((item) => (
                            <Link
                                key={item.link}
                                to={item.link}
                            >
                                <ListItem
                                    className={`mb-1 flex items-center ${pathname === item.link
                                        ? 'bg-highlight/10 text-highlight'
                                        : 'text-text-primary hover:bg-background-muted'
                                        }`}
                                >
                                    {item.icon && (
                                        <span className="mr-3">
                                            {item.icon}
                                        </span>
                                    )}
                                    <Typography className="flex-grow">
                                        {item.text}
                                    </Typography>
                                    <AiOutlineRight className="h-4 w-4" />
                                </ListItem>
                            </Link>
                        ))}
                    </List>

                    {/* Divider */}
                    <div className="my-2 border-t border-border" />

                    {/* Bottom Actions */}
                    <List className="bg-secondary">
                        <Link to="/profile">
                            <ListItem className="flex items-center text-text-primary hover:bg-background-muted">
                                <AiOutlineUser className="mr-3 h-4 w-4" />
                                <Typography>My Profile</Typography>
                            </ListItem>
                        </Link>

                        <Link to="/settings">
                            <ListItem className="flex items-center text-text-primary hover:bg-background-muted">
                                <IoSettingsOutline className="mr-3 h-4 w-4" />
                                <Typography>Settings</Typography>
                            </ListItem>
                        </Link>

                        <ListItem
                            className="flex cursor-pointer items-center text-error hover:bg-error/10"
                            onClick={onLogout}
                        >
                            <FiPower className="mr-3 h-4 w-4" />
                            <Typography>Sign Out</Typography>
                        </ListItem>
                    </List>
                </div>
            </div>
        </Drawer>
    );
};

export default MobileDrawer;