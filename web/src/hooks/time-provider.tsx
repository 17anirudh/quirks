// time-provider.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';

type TimerContextType = {
    remainingSeconds: number;
    duration: number;
    isBlocked: boolean;
    unlockRemaining: number;
    setCooldown: (minutes: number) => void;
    resetTimer: () => void;
    startUnlockCooldown: (minutes: number) => void;
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

    const [unlockRemaining, setUnlockRemaining] = useState(() => {
        const saved = localStorage.getItem('timer-unlock-remaining');
        const parsed = saved ? parseInt(saved, 10) : 0;
        return (parsed && !isNaN(parsed)) ? parsed : 0;
    });

    const location = useLocation();
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
        localStorage.setItem('timer-unlock-remaining', unlockRemaining.toString());
    }, [unlockRemaining]);

    useEffect(() => {
        // Only tick if on the right route, not blocked
        const shouldTick = !isBlocked && isPostsRoute;

        if (!shouldTick) return;

        const interval = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    setIsBlocked(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [isBlocked, isPostsRoute]);

    useEffect(() => {
        if (unlockRemaining <= 0) return;

        const interval = window.setInterval(() => {
            setUnlockRemaining((prev) => {
                if (prev <= 1) {
                    setIsBlocked(false);
                    setRemainingSeconds(duration); // Reset usage timer after unlock
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [unlockRemaining, duration]);


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

    const startUnlockCooldown = (minutes: number) => {
        setUnlockRemaining(minutes * 60);
        setIsBlocked(true); // Ensure it's blocked during the countdown
    };

    return (
        <TimerContext.Provider value={{ remainingSeconds, duration, isBlocked, unlockRemaining, setCooldown, resetTimer, startUnlockCooldown }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useGlobalTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error("useGlobalTimer must be used within TimerProvider");
    return context;
};
