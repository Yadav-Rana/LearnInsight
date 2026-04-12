"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui";
import { Avatar, EmptyState } from "@/components/dashboard";
import api from "@/lib/api";

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  enrolledSubjects?: string[];
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatJoinedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Joined today";
  if (diffDays === 1) return "Joined yesterday";
  if (diffDays < 30) return `Joined ${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Joined ${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `Joined ${years} ${years === 1 ? "year" : "years"} ago`;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users?role=student");
      setStudents(response.data.users || []);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 403
      ) {
        setStudents([]);
      } else {
        setError("Failed to load students");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Students
        </h1>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
          Manage and view student information
        </p>
      </div>

      {/* Search */}
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#EF4444",
          }}
        >
          {error}
        </div>
      )}

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255, 255, 255, 0.3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="No students found"
          description={searchQuery ? "Try a different search term." : "No students have enrolled yet."}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredStudents.map((student) => (
            <StudentCard key={student._id} student={student} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function StudentCard({ student }: { student: Student }) {
  const [isHovered, setIsHovered] = useState(false);
  const enrolledCount = student.enrolledSubjects?.length || 0;

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(20, 20, 25, 0.6)",
        backdropFilter: "blur(20px)",
        border: isHovered ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.06)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} avatar={student.avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-semibold truncate"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              {student.name}
            </h3>
            <p
              className="text-sm truncate"
              style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}
            >
              {student.email}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#3B82F6" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>
              {enrolledCount} {enrolledCount === 1 ? "subject" : "subjects"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#F97316" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>
              {formatJoinedDate(student.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="px-6 py-3"
        style={{ background: "rgba(255, 255, 255, 0.02)", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <Link href={`/students/${student._id}`} className="text-sm font-medium" style={{ color: "#F97316" }}>
          View Details →
        </Link>
      </div>
    </motion.div>
  );
}
