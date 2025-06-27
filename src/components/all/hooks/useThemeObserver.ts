import { useEffect, useState } from 'react';

export function useThemeObserver() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Initial theme
        const htmlElement = document.documentElement;
        setTheme(htmlElement.getAttribute('data-theme') as 'light' | 'dark' || 'light');

        // Create observer for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = htmlElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
                    setTheme(newTheme);
                }
            });
        });

        // Start observing
        observer.observe(htmlElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return theme;
} 