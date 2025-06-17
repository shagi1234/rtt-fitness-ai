import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { UserProfile } from "./api/types";
import api from "./api";
import { useAuth } from "./AuthContext";

type ProfileContextType = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, logout } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await api.user.getProfile();
      setProfile(profileData);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      if (err?.message === "Unauthorized") {
        await logout();
      }
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем профиль при изменении статуса аутентификации
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated]);

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await api.user.updateProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
