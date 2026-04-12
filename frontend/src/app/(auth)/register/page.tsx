"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { Button, Loader } from "@/components/ui";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Powered Insights",
    description: "Get personalized learning recommendations based on your progress",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Track Progress",
    description: "Visualize your learning journey with detailed analytics",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Smart Quizzes",
    description: "AI-generated quizzes tailored to strengthen weak areas",
  },
];

const roleOptions = [
  {
    value: "student",
    label: "Student",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    value: "teacher",
    label: "Teacher",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    clearError();

    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      if (result.meta.requestStatus === "fulfilled") {
        router.push("/dashboard");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none text-sm";

  const getInputStyle = (hasError: boolean) => ({
    fontFamily: "var(--font-body)",
    background: "rgba(255, 255, 255, 0.05)",
    border: hasError ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
    color: "var(--text-primary)",
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    if (!hasError) {
      e.currentTarget.style.border = "1px solid rgba(249, 115, 22, 0.5)";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    if (!hasError) {
      e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)";
      e.currentTarget.style.boxShadow = "none";
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Left Side - Features (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:block"
      >
        <div className="mb-8">
          <h2
            className="text-4xl xl:text-5xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Start Your
            <br />
            <span style={{ color: "#F97316" }}>Learning Journey</span>
          </h2>
          <p
            className="text-lg"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            Join thousands of learners achieving their goals with AI-powered insights.
          </p>
        </div>

        <div className="space-y-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="flex gap-4 p-4 rounded-xl transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(249, 115, 22, 0.1)",
                  color: "#F97316",
                }}
              >
                {feature.icon}
              </div>
              <div>
                <h3
                  className="font-semibold mb-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-primary)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-muted)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            Create Account
          </h1>
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: "#F97316" }}
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl"
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection - Tabs Style */}
          <div>
            <label
              className="block text-xs font-medium mb-2 uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              I am a
            </label>
            <div
              className="flex p-1 rounded-xl"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
            >
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue("role", option.value as "student" | "teacher")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: selectedRole === option.value ? "#F97316" : "transparent",
                    color: selectedRole === option.value ? "#000" : "var(--text-muted)",
                  }}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("role")} />
          </div>

          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium mb-2 uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              Full Name
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              autoComplete="name"
              className={inputClasses}
              style={getInputStyle(!!errors.name)}
              onFocus={(e) => handleFocus(e, !!errors.name)}
              onBlur={(e) => handleBlur(e, !!errors.name)}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium mb-2 uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              autoComplete="email"
              className={inputClasses}
              style={getInputStyle(!!errors.email)}
              onFocus={(e) => handleFocus(e, !!errors.email)}
              onBlur={(e) => handleBlur(e, !!errors.email)}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Fields - Side by Side on larger screens */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-muted)",
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  className={`${inputClasses} pr-10`}
                  style={getInputStyle(!!errors.password)}
                  onFocus={(e) => handleFocus(e, !!errors.password)}
                  onBlur={(e) => handleBlur(e, !!errors.password)}
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium mb-2 uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--text-muted)",
                }}
              >
                Confirm
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  className={`${inputClasses} pr-10`}
                  style={getInputStyle(!!errors.confirmPassword)}
                  onFocus={(e) => handleFocus(e, !!errors.confirmPassword)}
                  onBlur={(e) => handleBlur(e, !!errors.confirmPassword)}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button type="submit" variant="orange" size="lg" className="w-full">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size="xs" variant="dots" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>

          {/* Terms */}
          <p
            className="text-center text-xs"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            By creating an account, you agree to our{" "}
            <span className="underline cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              Terms of Service
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
