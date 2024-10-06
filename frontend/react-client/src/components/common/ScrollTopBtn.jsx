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
import { Link, Events, scrollSpy } from 'react-scroll';

// Styled SpeedDial component for positioning
const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(8),
    right: theme.spacing(4),
    zIndex: 100,
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

    // Define the menu items with Material UI icons
    const menuItems = [
        { id: 'home', icon: <HomeIcon />, label: 'Home', offset: -68 },
        { id: 'about', icon: <PersonIcon />, label: 'About', offset: -63 },
        { id: 'education', icon: <SchoolIcon />, label: 'Education', offset: -63 },
        { id: 'skills', icon: <WorkspacePremiumIcon />, label: 'Skills', offset: -63 },
        { id: 'projects', icon: <BusinessCenterIcon />, label: 'Projects', offset: -63 },
        { id: 'contact', icon: <PhoneIcon />, label: 'Contact', offset: -63 },
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