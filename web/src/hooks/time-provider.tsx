// time-provider.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';

type TimerContextType = {
    remainingSeconds: number;
    duration: number;
    isBlocked: boolean;
    setCooldown: (minutes: number) => void;
    resetTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
    // Initializers that read from localStorage
    const [duration, setDuration] = useState(() => {
        const saved = localStorage.getItem('timer-duration');
        const parsed = saved ? parseInt(saved, 10) : 0;
        return (parsed && !isNaN(parsed)) ? parsed : 9 * 60;
    });

    const [remainingSeconds, setRemainingSeconds] = useState(() => {
        const saved = localStorage.getItem('timer-remaining');
        const parsed = saved ? parseInt(saved, 10) : 0;
        return (parsed && !isNaN(parsed)) ? parsed : 9 * 60;
    });

    const [isBlocked, setIsBlocked] = useState(() => {
        const saved = localStorage.getItem('timer-blocked');
        return saved === 'true';
    });

    const location = useLocation();
    // Path check for persistence logic
    // _protected is likely a pathless layout, so it doesn't appear in the URL
    const isPostsRoute = location.pathname.startsWith('/posts/home');

    // Persistence effects
    useEffect(() => {
        localStorage.setItem('timer-duration', duration.toString());
    }, [duration]);

    useEffect(() => {
        localStorage.setItem('timer-remaining', remainingSeconds.toString());
    }, [remainingSeconds]);

    useEffect(() => {
        localStorage.setItem('timer-blocked', isBlocked.toString());
    }, [isBlocked]);

    useEffect(() => {
        // Only tick if on the right route, not blocked
        // We moved remainingSeconds check inside the setter to avoid dependency cycle
        const shouldTick = !isBlocked && isPostsRoute;

        console.log(`[TimerDebug] Check: blocked=${isBlocked}, route=${isPostsRoute} (${location.pathname}), tick=${shouldTick}`);

        if (!shouldTick) return;

        const interval = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 0) {
                    // Should have been blocked already, but just in case
                    return 0;
                }
                if (prev <= 1) {
                    setIsBlocked(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [isBlocked, isPostsRoute, location.pathname]); // location.pathname added for debug clarity, though isPostsRoute depends on it


    const setCooldown = (minutes: number) => {
        const seconds = minutes * 60;
        setDuration(seconds);
        setRemainingSeconds(seconds);
        setIsBlocked(false);
    };

    const resetTimer = () => {
        setRemainingSeconds(duration);
        setIsBlocked(false);
    };

    return (
        <TimerContext.Provider value={{ remainingSeconds, duration, isBlocked, setCooldown, resetTimer }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useGlobalTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error("useGlobalTimer must be used within TimerProvider");
    return context;
};
