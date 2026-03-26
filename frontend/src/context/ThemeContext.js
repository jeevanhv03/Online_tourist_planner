import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [themePref, setThemePref] = useState(localStorage.getItem('themePref') || 'auto');

    useEffect(() => {
        localStorage.setItem('themePref', themePref);
        if (themePref === 'auto') {
            const hour = new Date().getHours();
            const isDay = hour >= 6 && hour < 18;
            document.documentElement.setAttribute('data-theme', isDay ? 'light' : 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', themePref);
        }
    }, [themePref]);

    const toggleTheme = () => {
        if (themePref === 'auto') setThemePref('light');
        else if (themePref === 'light') setThemePref('dark');
        else setThemePref('auto');
    };

    return (
        <ThemeContext.Provider value={{ themePref, setThemePref, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
