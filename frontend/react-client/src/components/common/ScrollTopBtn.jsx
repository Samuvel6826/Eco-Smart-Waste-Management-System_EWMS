import React, { useEffect, useState } from 'react';
import { SpeedDial, SpeedDialHandler, SpeedDialContent, SpeedDialAction, IconButton } from "@material-tailwind/react";
import { MdDashboard } from "react-icons/md";
import { BsArrowUpCircleFill } from "react-icons/bs";
import { IoTrashBinSharp } from "react-icons/io5";
import { MdSettingsRemote } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { Link, Events, scrollSpy } from 'react-scroll';

const ScrollToTopButton = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const scrollFunction = () => {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', scrollFunction);
        return () => {
            window.removeEventListener('scroll', scrollFunction);
        };
    }, []);

    useEffect(() => {
        Events.scrollEvent.register('end', (to) => {
            setActiveMenu(to);
        });
        scrollSpy.update();

        return () => {
            Events.scrollEvent.remove('end');
        };
    }, []);

    const topFunction = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const menuItems = [
        {
            id: 'dashboard',
            text: "Dashboard",
            icon: <MdDashboard className="h-4 w-4" />,
            link: "/dashboard",
            admin: true,
            manager: true,
        },
        {
            id: 'bins',
            text: "Bins",
            icon: <IoTrashBinSharp className="h-4 w-4" />,
            link: "/users/bins",
            admin: true,
            manager: true,
        },
        {
            id: 'iot',
            text: "IoT Remote",
            icon: <MdSettingsRemote className="h-4 w-4" />,
            link: "/iot-remote",
            admin: true,
            manager: true,
        },
        {
            id: 'contact',
            text: "Contact",
            icon: <FaPhoneAlt className="h-4 w-4" />,
            link: "/contact",
            admin: true,
            manager: true,
        },
    ];

    return (
        <div
            id="scroll-to-top-btn-container"
            className={`fixed bottom-8 right-4 z-[100] ${isVisible ? 'block' : 'hidden'}`}
        >
            <SpeedDial placement="top">
                <SpeedDialHandler>
                    <IconButton
                        size="lg"
                        className="rounded-full bg-green-500 shadow-lg hover:bg-green-600"
                        onClick={topFunction}
                    >
                        <BsArrowUpCircleFill className="h-5 w-5" />
                    </IconButton>
                </SpeedDialHandler>

                <SpeedDialContent className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                        <SpeedDialAction
                            key={item.id}
                            className="relative h-16 w-16 bg-white hover:bg-blue-50"
                        >
                            <Link
                                to={item.link}
                                spy={true}
                                smooth={true}
                                offset={-70}  // Added default offset
                                duration={500}
                                className={`flex flex-col items-center gap-1 ${activeMenu === item.id ? 'text-blue-500' : 'text-gray-700'
                                    }`}
                                onClick={() => setActiveMenu(item.id)}
                            >
                                <div className="rounded-full p-2 hover:bg-blue-100">
                                    {item.icon}
                                </div>
                                <span className="text-xs">{item.text}</span>
                            </Link>
                        </SpeedDialAction>
                    ))}

                    <SpeedDialAction
                        key="scroll-top"
                        className="relative h-16 w-16 bg-white hover:bg-blue-50"
                    >
                        <div
                            className="flex flex-col items-center gap-1 text-gray-700"
                            onClick={topFunction}
                        >
                            <div className="rounded-full p-2 hover:bg-blue-100">
                                <BsArrowUpCircleFill className="h-5 w-5" />
                            </div>
                            <span className="text-xs">Top</span>
                        </div>
                    </SpeedDialAction>
                </SpeedDialContent>
            </SpeedDial>
        </div>
    );
};

export default ScrollToTopButton;