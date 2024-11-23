import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthHook } from "../contexts/providers/hooks/useAuthHook";
import { usePushNotificationsHook } from "../contexts/providers/hooks/usePushNotificationsHook"; // New import
import {
    Navbar,
    Typography,
    Button,
    IconButton,
} from "@material-tailwind/react";

import { MdDashboard } from "react-icons/md";
import { IoTrashBinSharp } from "react-icons/io5";
import { MdSettingsRemote } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { RiMenuFill } from "react-icons/ri";
import { GrPower } from "react-icons/gr";
import { FaCircleUser } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";

import { NavigationItems } from './NavigationItems';
import { NotificationBadge } from './NotificationDialog/NotificationBadge';
import { ProfileMenu } from './ProfileMenu';
import { MobileDrawer } from './MobileDrawer';

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
    {
        text: "Contact",
        icon: <FaPhoneAlt className="h-4 w-4" />,
        link: "/contact",
        admin: true,
        manager: true,
    },
];

function TopBar() {
    const { user, logout } = useAuthHook();
    const { notifications } = usePushNotificationsHook(); // Use the new hook
    // console.log(notifications);

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

    const filteredMenuItems = menuItems.filter(
        (item) => (item.admin && isAdmin) || (item.manager && isManager)
    );

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
        <Navbar className="sticky top-0 z-[100] max-w-full rounded-none bg-gradient-to-r from-green-700 to-green-500 px-4 py-2 shadow-md">
            <div className="flex h-14 items-center justify-between">
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

                <div className="hidden items-center gap-3 lg:flex">
                    <NavigationItems
                        items={filteredMenuItems}
                        pathname={location.pathname}
                        onNavigate={() => { }}
                    />
                </div>

                {user && (
                    <div className="flex items-center gap-3">
                        <NotificationBadge notifications={notifications} />

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

                            {profileOpen && (
                                <ProfileMenu
                                    user={user}
                                    onClose={() => setProfileOpen(false)}
                                />
                            )}
                        </div>

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

            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                user={user}
                menuItems={filteredMenuItems}
                pathname={location.pathname}
                onLogout={handleLogout}
            />
        </Navbar>
    );
}

export default TopBar;