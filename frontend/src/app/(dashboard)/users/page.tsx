"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui";
import { Avatar, ConfirmModal, EmptyState, GlassCard } from "@/components/dashboard";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

type Role = "student" | "teacher" | "admin";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  isActive: boolean;
  inviteCode?: string | null;
  teacher?: string | { _id: string; name: string } | null;
  enrolledSubjects?: Array<string | { _id: string; name: string }>;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const ROLE_COLORS: Record<Role, { bg: string; border: string; text: string }> = {
  admin: { bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.35)", text: "#F97316" },
  teacher: { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.35)", text: "#3B82F6" },
  student: { bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.35)", text: "#22C55E" },
};

export default function UsersPage() {
  const router = useRouter();
  const { user: me, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!authLoading && me && me.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [authLoading, me, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (roleFilter) params.set("role", roleFilter);
      if (activeFilter) params.set("isActive", activeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.users || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, activeFilter, searchQuery]);

  useEffect(() => {
    if (me?.role === "admin") {
      const t = setTimeout(fetchUsers, 250);
      return () => clearTimeout(t);
    }
  }, [fetchUsers, me]);

  const updateUser = async (id: string, patch: Partial<Pick<AdminUser, "role" | "isActive">>) => {
    try {
      setPendingId(id);
      await api.put(`/users/${id}`, patch);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...patch } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPendingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setPendingId(id);
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setPendingId(null);
    }
  };

  if (authLoading || (me && me.role !== "admin")) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  const counts = {
    admin: users.filter((u) => u.role === "admin").length,
    teacher: users.filter((u) => u.role === "teacher").length,
    student: users.filter((u) => u.role === "student").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Users
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            Manage roles, status, and accounts across all tenants
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-body)" }}>
          <RoleChip role="admin" count={counts.admin} />
          <RoleChip role="teacher" count={counts.teacher} />
          <RoleChip role="student" count={counts.student} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,180px,180px] gap-3">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "rgba(255, 255, 255, 0.4)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>
        <FilterSelect
          value={roleFilter}
          onChange={(v) => {
            setPage(1);
            setRoleFilter(v as "" | Role);
          }}
          options={[
            { value: "", label: "All roles" },
            { value: "admin", label: "Admins" },
            { value: "teacher", label: "Teachers" },
            { value: "student", label: "Students" },
          ]}
        />
        <FilterSelect
          value={activeFilter}
          onChange={(v) => {
            setPage(1);
            setActiveFilter(v as "" | "true" | "false");
          }}
          options={[
            { value: "", label: "Any status" },
            { value: "true", label: "Active only" },
            { value: "false", label: "Inactive only" },
          ]}
        />
      </div>

      {error && (
        <div
          className="p-4 rounded-xl flex items-center justify-between"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#EF4444",
          }}
        >
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs underline opacity-80">
            dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="md" variant="wave" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="No users found"
          description={searchQuery || roleFilter || activeFilter ? "Try clearing filters." : "No users have signed up yet."}
        />
      ) : (
        <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
          {users.map((u) => (
            <motion.div key={u._id} variants={itemVariants}>
              <UserRow
                user={u}
                isSelf={u._id === me?._id}
                isPending={pendingId === u._id}
                onChangeRole={(role) => updateUser(u._id, { role })}
                onToggleActive={() => updateUser(u._id, { isActive: !u.isActive })}
                onDelete={() => setConfirmDelete(u)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && users.length > 0 && (
        <div
          className="flex items-center justify-between pt-2 text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
        >
          <span>
            Page {page} of {pages} — {total} total
          </span>
          <div className="flex gap-2">
            <PagerButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </PagerButton>
            <PagerButton disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              Next
            </PagerButton>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete this user?"
        description={
          confirmDelete && (
            <>
              <span style={{ color: "var(--text-primary)" }}>{confirmDelete.name}</span>{" "}
              ({confirmDelete.email}) will be permanently removed. This cannot be undone.
            </>
          )
        }
        confirmLabel="Delete"
        pending={!!confirmDelete && pendingId === confirmDelete._id}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteUser(confirmDelete._id)}
      />
    </div>
  );
}

function RoleChip({ role, count }: { role: Role; count: number }) {
  const c = ROLE_COLORS[role];
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {role}: {count}
    </span>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "#0a0a0a" }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function UserRow({
  user,
  isSelf,
  isPending,
  onChangeRole,
  onToggleActive,
  onDelete,
}: {
  user: AdminUser;
  isSelf: boolean;
  isPending: boolean;
  onChangeRole: (r: Role) => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const c = ROLE_COLORS[user.role];
  return (
    <GlassCard padding="p-0">
      <div className="p-5 flex items-center gap-4 flex-wrap">
        <Avatar name={user.name} avatar={user.avatar} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-base font-semibold truncate"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              {user.name}
            </h3>
            {isSelf && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
                style={{
                  background: "rgba(249, 115, 22, 0.15)",
                  color: "#F97316",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                }}
              >
                you
              </span>
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
              style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
            >
              {user.role}
            </span>
            {!user.isActive && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
                style={{
                  background: "rgba(148, 163, 184, 0.15)",
                  color: "#94A3B8",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                }}
              >
                inactive
              </span>
            )}
          </div>
          <p
            className="text-sm truncate mt-0.5"
            style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
          >
            {user.email}
          </p>
          {(user.inviteCode || user.teacher) && (
            <p
              className="text-xs mt-1"
              style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
            >
              {user.inviteCode && <>Code: <span style={{ color: "#F97316" }}>{user.inviteCode}</span></>}
              {user.inviteCode && user.teacher && " · "}
              {user.teacher && (
                <>Teacher: {typeof user.teacher === "object" ? user.teacher.name : user.teacher}</>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={user.role}
            disabled={isPending || isSelf}
            onChange={(e) => onChangeRole(e.target.value as Role)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
            title={isSelf ? "You can't change your own role" : "Change role"}
          >
            <option value="student" style={{ background: "#0a0a0a" }}>student</option>
            <option value="teacher" style={{ background: "#0a0a0a" }}>teacher</option>
            <option value="admin" style={{ background: "#0a0a0a" }}>admin</option>
          </select>

          <button
            onClick={onToggleActive}
            disabled={isPending || isSelf}
            className="px-3 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              background: user.isActive ? "rgba(148, 163, 184, 0.1)" : "rgba(34, 197, 94, 0.12)",
              border: `1px solid ${user.isActive ? "rgba(148, 163, 184, 0.25)" : "rgba(34, 197, 94, 0.3)"}`,
              color: user.isActive ? "#94A3B8" : "#22C55E",
              fontFamily: "var(--font-body)",
            }}
            title={isSelf ? "You can't deactivate yourself" : user.isActive ? "Deactivate" : "Activate"}
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={onDelete}
            disabled={isPending || isSelf}
            className="px-3 py-2 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#EF4444",
              fontFamily: "var(--font-body)",
            }}
            title={isSelf ? "You can't delete yourself" : "Delete user"}
          >
            Delete
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function PagerButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "var(--text-primary)",
      }}
    >
      {children}
    </button>
  );
}

