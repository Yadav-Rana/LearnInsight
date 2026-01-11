"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  login,
  register,
  logout,
  updateProfile,
  changePassword,
  clearError,
} from "@/store/slices/authSlice";
import type { LoginCredentials, RegisterCredentials, User } from "@/types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await dispatch(login(credentials));
    return result;
  };

  const handleRegister = async (credentials: RegisterCredentials) => {
    const result = await dispatch(register(credentials));
    return result;
  };

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    const result = await dispatch(updateProfile(data));
    return result;
  };

  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const result = await dispatch(changePassword(data));
    return result;
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    clearError: handleClearError,
  };
}
