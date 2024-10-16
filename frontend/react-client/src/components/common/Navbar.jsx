import React, { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    useMediaQuery,
    useTheme,
    Box,
    Button,
    Avatar
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
    const { user, logout } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();

    useEffect(() => {
        if (user) {
            setIsAdmin(user.role === "Admin");
            setIsManager(user.role === "Manager");
        }
    }, [user]);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = () => {
        logout();
        setDrawerOpen(false);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, link: '/dashboard', admin: true, manager: true },
        { text: 'Bins', icon: <ListAltIcon />, link: '/users/bins', admin: true, manager: true },
        { text: 'IoT Remote', icon: <ListAltIcon />, link: '/iot-remote', admin: true, manager: true },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        (item.admin && isAdmin) || (item.manager && isManager)
    );

    const drawer = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={handleDrawerToggle}
            onKeyDown={handleDrawerToggle}
        >
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar>{user?.firstName.charAt(0)}</Avatar>
                <Box>
                    <Typography variant="h6">EWMS</Typography>
                    {user && (
                        <Typography variant="body2">{`${user.role}: ${user.firstName}`}</Typography>
                    )}
                </Box>
            </Box>
            <Divider />
            <List>
                {filteredMenuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        component={Link}
                        to={item.link}
                        selected={location.pathname === item.link}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        EWMS ( Eco-Smart Waste Management System with Automation ) PKC
                    </Typography>
                    {!isMobile && user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.contrastText', color: 'primary.main', mr: 1 }}>
                                {user.firstName.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" color="inherit">{`${user.role}: ${user.firstName}`}</Typography>
                        </Box>
                    )}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {filteredMenuItems.map((item) => (
                                <Button
                                    key={item.text}
                                    color="inherit"
                                    component={Link}
                                    to={item.link}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        ml: 1,
                                        bgcolor: location.pathname === item.link ? 'primary.dark' : 'transparent',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                    }}
                                >
                                    {item.icon}
                                    <Typography sx={{ ml: 1 }}>{item.text}</Typography>
                                </Button>
                            ))}
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                sx={{ ml: 2, display: 'flex', alignItems: 'center' }}
                            >
                                <LogoutIcon />
                                <Typography sx={{ ml: 1 }}>Logout</Typography>
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}

export default Navbar;