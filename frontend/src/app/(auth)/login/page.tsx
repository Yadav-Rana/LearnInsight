"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      const result = await login(data);
      if (result.meta.requestStatus === "fulfilled") {
        router.push("/dashboard");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-2xl p-8 md:p-10 max-w-md mx-auto"
      style={{
        background: "rgba(20, 20, 20, 0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              fontFamily: "var(--font-hk-grotesk), var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Welcome Back
          </h1>
          <p
            className="text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            Sign in to continue your learning journey
          </p>
        </motion.div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
            }}
          >
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            autoComplete="email"
            className="w-full px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none"
            style={{
              fontFamily: "var(--font-body)",
              background: "rgba(255, 255, 255, 0.05)",
              border: errors.email
                ? "1px solid rgba(239, 68, 68, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              if (!errors.email) {
                e.currentTarget.style.border = "1px solid rgba(249, 115, 22, 0.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
              }
            }}
            onBlur={(e) => {
              if (!errors.email) {
                e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm" style={{ color: "#f87171" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-2"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
            }}
          >
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            autoComplete="current-password"
            className="w-full px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none"
            style={{
              fontFamily: "var(--font-body)",
              background: "rgba(255, 255, 255, 0.05)",
              border: errors.password
                ? "1px solid rgba(239, 68, 68, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              if (!errors.password) {
                e.currentTarget.style.border = "1px solid rgba(249, 115, 22, 0.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
              }
            }}
            onBlur={(e) => {
              if (!errors.password) {
                e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-2 text-sm" style={{ color: "#f87171" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="orange"
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </form>

      {/* Footer Links */}
      <div className="mt-8 text-center">
        <p
          className="text-sm"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--text-muted)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold transition-colors"
            style={{ color: "#F97316" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fb923c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#F97316";
            }}
          >
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
