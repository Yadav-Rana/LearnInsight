"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Loader } from "@/components/ui";

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

const faqs = [
  {
    question: "Is LearnInsight free to use?",
    answer: "Yes! We offer a free tier that includes basic features. Premium plans are available for advanced AI insights and unlimited quiz generation.",
  },
  {
    question: "How does the AI quiz generation work?",
    answer: "Our AI analyzes your syllabus or learning materials and automatically generates relevant questions. It adapts to your progress and focuses on areas where you need more practice.",
  },
  {
    question: "Can teachers create custom content?",
    answer: "Absolutely! Teachers can create custom quizzes, add resources, and track student progress through their dashboard.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All data is encrypted, and we never share your information with third parties.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const inputClasses = "w-full px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none";

  const inputStyle = {
    fontFamily: "var(--font-body)",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "var(--text-primary)",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid rgba(249, 115, 22, 0.5)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="pt-28 md:pt-32 pb-20">
      {/* Hero Section */}
      <section className="px-4 mb-16 md:mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{
                background: "rgba(249, 115, 22, 0.1)",
                color: "#F97316",
                border: "1px solid rgba(249, 115, 22, 0.2)",
              }}
            >
              Contact Us
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              Get in <span style={{ color: "#F97316" }}>Touch</span>
            </h1>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}
            >
              Have questions about LearnInsight? We&apos;d love to hear from you.
              Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & FAQs */}
      <section className="px-4 mb-16 md:mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(20, 20, 20, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                }}
              >
                Send us a Message
              </h2>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <p className="text-sm" style={{ color: "#22c55e" }}>
                    Thank you for your message! We&apos;ll get back to you soon.
                  </p>
                </motion.div>
              )}

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
                  <p className="text-sm" style={{ color: "#ef4444" }}>
                    {error}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium mb-2 uppercase tracking-wider"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                    />
                  </div>
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
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs font-medium mb-2 uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`${inputClasses} cursor-pointer`}
                    style={{
                      ...inputStyle,
                      backgroundColor: "#1a1a1a",
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="" style={{ backgroundColor: "#1a1a1a", color: "#999" }}>Select a topic</option>
                    <option value="general" style={{ backgroundColor: "#1a1a1a", color: "#e5e5e5" }}>General Inquiry</option>
                    <option value="support" style={{ backgroundColor: "#1a1a1a", color: "#e5e5e5" }}>Technical Support</option>
                    <option value="feedback" style={{ backgroundColor: "#1a1a1a", color: "#e5e5e5" }}>Feedback</option>
                    <option value="partnership" style={{ backgroundColor: "#1a1a1a", color: "#e5e5e5" }}>Partnership</option>
                    <option value="other" style={{ backgroundColor: "#1a1a1a", color: "#e5e5e5" }}>Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-medium mb-2 uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={`${inputClasses} resize-none`}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <Button type="submit" variant="orange" size="lg" className="w-full">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size="xs" variant="dots" />
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </motion.div>

            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                }}
              >
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    className="p-5 rounded-xl"
                    style={{
                      background: "rgba(20, 20, 20, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <h3
                      className="font-semibold mb-2"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {faq.question}
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div
                className="mt-6 p-5 rounded-xl"
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Can&apos;t find what you&apos;re looking for? Feel free to send us a
                  message and we&apos;ll be happy to help!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
