// src/components/navigation/NavigationItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@material-tailwind/react';

export const NavigationItem = ({ item, pathname, onNavigate }) => (
    <Link
        to={item.link}
        onClick={onNavigate}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-200
      ${pathname === item.link
                ? "bg-white/20 text-white shadow-md"
                : "text-white/90 hover:bg-white/10 hover:text-white hover:shadow-sm"
            }`}
    >
        {React.cloneElement(item.icon, { className: "h-5 w-5" })}
        <Typography variant="small" className="font-medium">
            {item.text}
        </Typography>
    </Link>
);

export const NavigationItems = ({ items, pathname, onNavigate }) => (
    <div className="flex gap-1">
        {items.map((item, index) => (
            <NavigationItem
                key={`${item.text}-${index}`} // Ensure a unique key
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
            />
        ))}
    </div>
);