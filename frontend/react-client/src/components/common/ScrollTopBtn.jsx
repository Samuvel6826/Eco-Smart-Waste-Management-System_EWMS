import React, { useEffect, useState } from 'react';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Link, Events, scrollSpy } from 'react-scroll';

// Styled SpeedDial component for positioning and alignment with navbar's theme
const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(8),
    right: theme.spacing(4),
    zIndex: 100,
    '& .MuiSpeedDial-fab': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
}));

const ScrollToTopButton = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // Show/Hide scroll-to-top button based on scroll position
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

    // Scroll to the top of the page
    const topFunction = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Handle active menu based on scroll event
    useEffect(() => {
        Events.scrollEvent.register('end', (to) => {
            setActiveMenu(to);
        });
        scrollSpy.update();

        return () => {
            Events.scrollEvent.remove('end');
        };
    }, []);

    // Define the menu items with Material UI icons and navigation links
    const menuItems = [
        { id: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard', link: '/dashboard' },
        { id: 'bins', icon: <ListAltIcon />, label: 'Bins', link: '/users/bins' },
        { id: 'iot-remote', icon: <ListAltIcon />, label: 'IoT Remote', link: '/iot-remote' },
    ];

    return (
        <Box id="scroll-to-top-btn-container" sx={{ display: isVisible ? 'block' : 'none' }}>
            {/* SpeedDial Component */}
            <StyledSpeedDial
                ariaLabel="Navigation SpeedDial"
                icon={<SpeedDialIcon />}
                direction="up"
                onClick={topFunction}
            >
                {/* Map through the menu items */}
                {menuItems.map((item) => (
                    item.link ? (
                        // Link-based navigation for Dashboard, Bins, and IoT Remote
                        <SpeedDialAction
                            key={item.id}
                            icon={
                                <Link
                                    to={item.link}
                                    spy={true}
                                    smooth={true}
                                    offset={item.offset}
                                    duration={500}
                                    className={`${activeMenu === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveMenu(item.id)}
                                >
                                    {item.icon}
                                </Link>
                            }
                            tooltipTitle={<Typography variant="body2">{item.label}</Typography>}
                        />
                    ) : (
                        // Scroll-based navigation for other sections
                        <SpeedDialAction
                            key={item.id}
                            icon={
                                <Link
                                    to={item.id}
                                    spy={true}
                                    smooth={true}
                                    offset={item.offset}
                                    duration={500}
                                    className={`${activeMenu === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveMenu(item.id)}
                                >
                                    {item.icon}
                                </Link>
                            }
                            tooltipTitle={<Typography variant="body2">{item.label}</Typography>}
                        />
                    )
                ))}

                {/* Scroll to Top Action */}
                <SpeedDialAction
                    icon={<ArrowUpwardIcon />}
                    tooltipTitle={<Typography variant="body2">Go to Top</Typography>}
                    onClick={topFunction}
                />
            </StyledSpeedDial>
        </Box>
    );
};

export default ScrollToTopButton;