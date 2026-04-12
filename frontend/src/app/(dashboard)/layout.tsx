"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Preloader } from "@/components/ui";
import { Avatar, AvatarPicker } from "@/components/dashboard";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ("student" | "teacher" | "admin")[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Subjects",
    href: "/subjects",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Quizzes",
    href: "/quizzes",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Progress",
    href: "/progress",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    roles: ["student"],
  },
  {
    label: "Insights",
    href: "/insights",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    roles: ["student"],
  },
  {
    label: "Students",
    href: "/students",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    roles: ["teacher", "admin"],
  },
  {
    label: "Users",
    href: "/users",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    roles: ["admin"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("dashboardRevealed")) {
      sessionStorage.setItem("dashboardRevealed", "1");
      setShowReveal(true);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleAvatarSelect = async (avatarValue: string) => {
    await updateProfile({ avatar: avatarValue });
    setShowAvatarPicker(false);
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const sidebarWidth = collapsed ? "w-20" : "w-72";
  const mainPadding = collapsed ? "lg:pl-20" : "lg:pl-72";

  return (
    <ProtectedRoute>
      {showReveal && <Preloader duration={2500} onComplete={() => setShowReveal(false)} />}
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        }}
      >
        {/* Mobile sidebar backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-30 h-full ${sidebarWidth} transition-all duration-300 ease-out lg:translate-x-0 ${
            mobileOpen ? "translate-x-0 !w-72" : "-translate-x-full"
          }`}
          style={{
            background: "rgba(15, 15, 20, 0.95)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex flex-col h-full">
            {/* Logo + toggle */}
            <div className={`flex items-center h-16 ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
              <Link
                href="/dashboard"
                className="font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.02em",
                  fontSize: collapsed ? "1.1rem" : "1.25rem",
                }}
              >
                {collapsed ? (
                  <>
                    <span style={{ color: "#F97316" }}>L</span>
                    <span style={{ color: "#3B82F6" }}>I</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: "#F97316" }}>Learn</span>
                    <span style={{ color: "#3B82F6" }}>Insight</span>
                  </>
                )}
              </Link>
              {/* Desktop: single toggle — collapse when expanded, expand when collapsed */}
              {!collapsed && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Collapse sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {/* Mobile close */}
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Expand button when collapsed — shown below logo */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="hidden lg:flex items-center justify-center mx-auto mb-2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Expand sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Navigation */}
            <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${collapsed ? "px-2" : "px-4"}`}>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center ${collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"} rounded-xl transition-all duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                    style={isActive ? {
                      background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.1) 100%)",
                      border: "1px solid rgba(249, 115, 22, 0.3)",
                    } : {}}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={isActive ? "text-orange-400" : ""}>{item.icon}</span>
                    {!collapsed && (
                      <span
                        className="font-medium"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className={`${collapsed ? "px-2" : "px-4"} mb-4 space-y-3`}>
              {/* Avatar picker (expanded only) */}
              {showAvatarPicker && !collapsed && (
                <AvatarPicker
                  onSelect={handleAvatarSelect}
                  currentAvatar={user?.avatar}
                />
              )}

              {/* Avatar + name */}
              <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
                <button
                  onClick={() => {
                    if (collapsed) { setCollapsed(false); setShowAvatarPicker(true); }
                    else setShowAvatarPicker(!showAvatarPicker);
                  }}
                  className="cursor-pointer rounded-full transition-all duration-200 hover:ring-2 hover:ring-orange-500/40"
                  title="Change avatar"
                >
                  <Avatar name={user?.name || "User"} avatar={user?.avatar} size={collapsed ? "sm" : "md"} />
                </button>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-white truncate"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {user?.name}
                    </p>
                    <p
                      className="text-xs capitalize"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      {user?.role}
                    </p>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`flex items-center ${collapsed ? "justify-center w-full py-2" : "gap-2 w-full px-4 py-2.5"} rounded-lg text-gray-400 hover:text-white transition-colors`}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
                title={collapsed ? "Logout" : undefined}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!collapsed && (
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>
                    Logout
                  </span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className={`${mainPadding} transition-all duration-300`}>
          {/* Mobile top bar */}
          <div
            className="sticky top-0 z-10 flex items-center h-14 px-4 lg:hidden"
            style={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1" />
            <Avatar name={user?.name || "User"} avatar={user?.avatar} size="sm" />
          </div>

          {/* Page content */}
          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
