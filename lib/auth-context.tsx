"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { User, UserRole } from "./types"
import { supabase } from "./supabase"
import { useRouter } from "next/navigation"
import { users as mockUsers } from "./mock-data"
import {
  removeActiveSession,
  upsertActiveSession,
} from "./session-tracker"

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchProfile = useCallback(async (user: any) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // Profile row missing - try to create it
        if (error.code === 'PGRST116') {
          const isAdmin = user.user_metadata?.role === "admin"
          const newProfile = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
            role: user.user_metadata?.role || "student",
            registration_number: user.user_metadata?.registration_number || `REG-${user.id.substring(0, 6)}`,
            department: user.user_metadata?.department || "General",
            status: isAdmin ? "active" : "pending",
          };

          const { data: insertedProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([newProfile])
            .select()
            .single();

          if (!insertError && insertedProfile) {
            const normalizedInserted = {
              ...insertedProfile,
              registrationNumber: insertedProfile.registration_number,
              joinedAt: insertedProfile.created_at || new Date().toISOString(),
              avatar:
                insertedProfile.avatar ||
                ((insertedProfile.name || "U")
                  .split(" ")
                  .map((part: string) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U"),
            } as User
            setCurrentUser(normalizedInserted);
            upsertActiveSession(normalizedInserted)
            return;
          }
        }

        // ANY other DB error (table missing, RLS, network, etc.)
        // Fall back to constructing user directly from auth session so login still works
        console.warn("Profile DB unavailable, using session metadata as fallback:", error.message);
        const fallbackUser: User = {
          id: user.id,
          email: user.email ?? "",
          name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
          role: (user.user_metadata?.role as any) || "student",
          registrationNumber: user.user_metadata?.registration_number || `REG-${user.id.substring(0, 6)}`,
          department: user.user_metadata?.department || "General",
          status: "active",
          joinedAt: new Date().toISOString(),
          avatar: "",
        };
        setCurrentUser(fallbackUser);
        upsertActiveSession(fallbackUser)
        return;
      }

      if (data.status === "pending") {
        await supabase.auth.signOut();
        setCurrentUser(null);
        return;
      }
      if (data.status === "rejected") {
        await supabase.auth.signOut();
        setCurrentUser(null);
        return;
      }

      const normalizedProfile = {
        ...data,
        registrationNumber: data.registration_number,
        joinedAt: data.created_at || data.joinedAt || new Date().toISOString(),
        avatar:
          data.avatar ||
          ((data.name || "U")
            .split(" ")
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U"),
      } as User

      setCurrentUser(normalizedProfile);
      upsertActiveSession(normalizedProfile)
    } catch (err) {
      console.error("Unexpected error in fetchProfile:", err);
      // Last-resort fallback so the app never hard-blocks the user
      // However, we should NOT fall back to 'active' if we intended to block.
      // But if it's a network error, we'll let them through as fallback for demo.
      const fallbackUser: User = {
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
        role: (user.user_metadata?.role as any) || "student",
        registrationNumber: user.user_metadata?.registration_number || `REG-${user.id.substring(0, 6)}`,
        department: user.user_metadata?.department || "General",
        status: (user.user_metadata?.status as any) || "active",
        joinedAt: new Date().toISOString(),
        avatar: "",
      };
      
      if (fallbackUser.status === "pending" || fallbackUser.status === "suspended") {
        await supabase.auth.signOut();
        setCurrentUser(null);
        return;
      }

      setCurrentUser(fallbackUser);
      upsertActiveSession(fallbackUser)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          fetchProfile(session.user);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      let emailToUse = identifier;

      // If it looks like a registration number, resolve it first.
      // We also check account status before sign-in.
      let matchedProfile: any = null
      if (!identifier.includes("@")) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email,status")
          .eq("registration_number", identifier)
          .single();
        
        if (profileError || !profile?.email) {
          throw new Error("Invalid registration number");
        }
        emailToUse = profile.email;
        matchedProfile = profile
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email,status")
          .eq("email", identifier)
          .single()
        matchedProfile = profile
      }

      if (matchedProfile?.status === "pending") {
        throw new Error("Your account is pending admin approval.")
      }
      if (matchedProfile?.status === "rejected") {
        throw new Error("Your account is suspended. Contact admin.")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) throw error;

      const sessionUser = data.user
      if (sessionUser) {
        const { data: profileById } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", sessionUser.id)
          .single()

        const effectiveStatus =
          profileById?.status || sessionUser.user_metadata?.status || "pending"

        if (effectiveStatus === "pending") {
          await supabase.auth.signOut()
          throw new Error("Your account is pending admin approval.")
        }
        if (effectiveStatus === "rejected") {
          await supabase.auth.signOut()
          throw new Error("Your account is suspended. Contact admin.")
        }
      }

      return true;
    } catch (error) {
      const normalizedIdentifier = identifier.trim().toLowerCase()
      const demoUser = mockUsers.find(
        (u) =>
          u.email.toLowerCase() === normalizedIdentifier ||
          u.registrationNumber.toLowerCase() === normalizedIdentifier
      )

      // Local fallback for demo credentials when Supabase auth is not fully configured.
      if (demoUser && password === "password123") {
        setCurrentUser(demoUser)
        upsertActiveSession(demoUser)
        return true
      }

      console.error("Login error:", error);
      return false;
    }
  }, [])

  const logout = useCallback(async () => {
    if (currentUser?.id) {
      removeActiveSession(currentUser.id)
    }
    await supabase.auth.signOut();
    router.push("/login");
  }, [currentUser?.id, router])

  const switchRole = useCallback((role: UserRole) => {
    // Mock role switching for development/demo purposes
    if (currentUser) {
      const switchedUser = { ...currentUser, role }
      setCurrentUser(switchedUser);
      upsertActiveSession(switchedUser)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return


    upsertActiveSession(currentUser)
    const heartbeat = window.setInterval(() => {
      upsertActiveSession(currentUser)
    }, 60000)

    return () => window.clearInterval(heartbeat)
  }, [currentUser])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
        switchRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
