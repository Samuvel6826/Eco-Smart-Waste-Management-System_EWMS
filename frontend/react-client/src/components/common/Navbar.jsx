import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Navbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    Card,
    CardBody,
} from "@material-tailwind/react";

import { MdDashboard } from "react-icons/md";
import { IoTrashBinSharp } from "react-icons/io5";
import { MdSettingsRemote } from "react-icons/md";
import { RiMenuFill } from "react-icons/ri";
import { GrPower } from "react-icons/gr";
import { FaCircleUser } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { FaRegBell } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

// Enhanced Profile Menu with better positioning and animations
const ProfileMenu = ({ user, onClose }) => (
    <div className="fixed inset-0 z-[999] bg-transparent" onClick={onClose}>
        <Card className="absolute right-0 top-12 w-72 transform overflow-hidden shadow-xl transition-all duration-200 ease-in-out">
            <CardBody className="p-0">
                {/* Profile Header with enhanced styling */}
                <div className="border-b border-blue-gray-50 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full border-2 border-blue-500/20 bg-blue-500/10 p-1">
                            <FaCircleUser className="h-12 w-12 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <Typography variant="h6" color="blue-gray" className="font-bold">
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="small" color="gray" className="font-medium">
                                {user?.email}
                            </Typography>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${user?.role === 'Admin' ? 'bg-green-500' : 'bg-blue-500'} 
                                    animate-pulse`} />
                                <Typography variant="small" className="font-medium text-blue-gray-600">
                                    {user?.role}
                                </Typography>
                            </div>
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

// Enhanced Navigation Items with better hover effects
const NavigationItems = ({ items, pathname, onNavigate }) => (
    <>
        {items.map((item) => (
            <Link
                key={item.text}
                to={item.link}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200
                    ${pathname === item.link
                        ? "bg-white/20 text-white shadow-md"
                        : "text-white/90 hover:bg-white/10 hover:text-white hover:shadow-sm"
                    }`}
            >
                {React.cloneElement(item.icon, { className: "h-5 w-5" })}
                <span className="font-medium">{item.text}</span>
            </Link>
        ))}
    </>
);

function NavbarComponent() {
    const { user, logout } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (user) {
            setIsAdmin(user.role === "Admin");
            setIsManager(user.role === "Manager");
        }
    }, [user]);

    const menuItems = [
        {
            text: "Dashboard",
            icon: <MdDashboard className="h-4 w-4" />,
            link: "/dashboard",
            admin: true,
            manager: true,
        },
        {
            text: "Bins",
            icon: <IoTrashBinSharp className="h-4 w-4" />,
            link: "/users/bins",
            admin: true,
            manager: true,
        },
        {
            text: "IoT Remote",
            icon: <MdSettingsRemote className="h-4 w-4" />,
            link: "/iot-remote",
            admin: true,
            manager: true,
        },
    ];

    const filteredMenuItems = menuItems.filter(
        (item) => (item.admin && isAdmin) || (item.manager && isManager)
    );

    // Enhanced click outside handler
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileOpen && !e.target.closest('.profile-menu')) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileOpen]);

    const handleLogout = () => {
        logout();
        setDrawerOpen(false);
        setProfileOpen(false);
    };

    return (
        <Navbar className="sticky top-0 z-[100] max-w-full rounded-none bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 shadow-md">
            <div className="flex h-14 items-center justify-between">
                {/* Enhanced Logo Section */}
                <div className="flex items-center gap-4">
                    <IconButton
                        variant="text"
                        color="white"
                        className="transition-colors hover:bg-white/10 lg:hidden"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <RiMenuFill className="h-5 w-5" />
                    </IconButton>

                    <div className="flex items-center gap-3">
                        <Typography variant="h5" color="white" className="font-bold tracking-wider">
                            EWMS
                        </Typography>
                        <Typography
                            variant="small"
                            color="white"
                            className="hidden border-l-2 border-white/30 pl-3 font-medium opacity-90 sm:block"
                        >
                            Eco-Smart Waste Management System
                        </Typography>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-3 lg:flex">
                    <NavigationItems
                        items={filteredMenuItems}
                        pathname={location.pathname}
                        onNavigate={() => { }}
                    />
                </div>

                {/* Enhanced Right Section */}
                {user && (
                    <div className="flex items-center gap-3">
                        {/* Notifications with badge */}
                        <div className="relative">
                            <IconButton
                                variant="text"
                                color="white"
                                className="h-9 w-9 transition-colors hover:bg-white/10"
                            >
                                <FaRegBell className="h-5 w-5" />
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                                    <span className="text-[10px] font-bold text-white">3</span>
                                </span>
                            </IconButton>
                        </div>

                        {/* Enhanced Profile Menu Trigger */}
                        <div className="profile-menu relative">
                            <Button
                                variant="text"
                                color="white"
                                className="flex h-9 items-center gap-2 rounded-lg px-2 normal-case transition-colors hover:bg-white/10"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 transition-all duration-200 hover:bg-white/30">
                                    <FaCircleUser className="h-5 w-5 text-white" />
                                </div>
                                <IoIosArrowDown
                                    className={`h-4 w-4 text-white transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </Button>

                            {/* Profile Dropdown */}
                            {profileOpen && (
                                <ProfileMenu
                                    user={user}
                                    onClose={() => setProfileOpen(false)}
                                />
                            )}
                        </div>

                        {/* Enhanced Logout Button */}
                        <IconButton
                            variant="text"
                            color="white"
                            className="h-9 w-9 transition-colors hover:bg-red-500/20"
                            onClick={handleLogout}
                        >
                            <GrPower className="h-5 w-5" />
                        </IconButton>
                    </div>
                )}
            </div>

            {/* Enhanced Mobile Drawer */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                className="p-4"
                size={300}
            >
                <div className="mb-6 flex items-center justify-between">
                    <Typography variant="h5" color="blue-gray" className="font-bold">
                        EWMS
                    </Typography>
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <AiOutlineClose className="h-5 w-5" />
                    </IconButton>
                </div>

                {user && (
                    <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full border-2 border-blue-500/20 bg-blue-500/10 p-1">
                                <FaCircleUser className="h-12 w-12 text-blue-600" />
                            </div>
                            <div>
                                <Typography variant="h6" color="blue-gray" className="font-bold">
                                    {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="small" color="gray" className="font-medium">
                                    {user.email}
                                </Typography>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${isAdmin ? 'bg-green-500' : 'bg-blue-500'
                                        } animate-pulse`} />
                                    <Typography variant="small" className="font-medium text-blue-gray-600">
                                        {user.role}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <List className="gap-2">
                    <NavigationItems
                        items={filteredMenuItems}
                        pathname={location.pathname}
                        onNavigate={() => setDrawerOpen(false)}
                    />

                    <hr className="my-4 border-blue-gray-50" />

                    {/* Enhanced Profile and Settings */}
                    <Link to="/profile" onClick={() => setDrawerOpen(false)}>
                        <ListItem className="transition-colors duration-200 hover:bg-blue-50">
                            <FaCircleUser className="h-5 w-5 text-blue-600" />
                            <span className="ml-3 text-sm font-medium text-blue-gray-700">My Profile</span>
                        </ListItem>
                    </Link>
                    <Link to="/settings" onClick={() => setDrawerOpen(false)}>
                        <ListItem className="transition-colors duration-200 hover:bg-blue-50">
                            <IoSettings className="h-5 w-5 text-blue-600" />
                            <span className="ml-3 text-sm font-medium text-blue-gray-700">Settings</span>
                        </ListItem>
                    </Link>

                    {/* Enhanced Logout */}
                    <ListItem
                        className="text-red-500 transition-colors duration-200 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <GrPower className="h-5 w-5" />
                        <span className="ml-3 text-sm font-medium">Sign Out</span>
                    </ListItem>
                </List>
            </Drawer>
        </Navbar>
    );
}

export default NavbarComponent;