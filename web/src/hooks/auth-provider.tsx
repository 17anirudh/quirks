import { useState, useEffect, createContext, type ReactNode, useContext } from "react"
import { type User, type Session } from "@supabase/supabase-js"
import { SUPABASE_CLIENT } from "./variables";

export const AuthContext = createContext<{
    user: User | null;
    isLoading: boolean;
    session: Session | null
}>({ user: null, isLoading: true, session: null });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Check initial session
        SUPABASE_CLIENT.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
            setIsLoading(false);
            setSession(data.session ?? null)
        });

        // 2. Listen for changes (login, logout, token refresh)
        const { data: { subscription } } = SUPABASE_CLIENT.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
            setSession(session ?? null)
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, session }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};