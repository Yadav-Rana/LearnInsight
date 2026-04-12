"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Loader } from "@/components/ui";

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  subject: { _id: string; name: string };
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number | null;
  questions: Question[];
  isPublished: boolean;
  createdBy: { _id: string; name: string };
}

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quiz taking state
  const [isTaking, setIsTaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    percentage: number;
    timeTaken: number;
  } | null>(null);

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    if (params.id) {
      fetchQuiz();
    }
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (!isTaking || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTaking, timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${params.id}`);
      setQuiz(response.data.data);
    } catch (err) {
      setError("Failed to load quiz");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (!quiz) return;
    setIsTaking(true);
    setCurrentQuestion(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
    setResult(null);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = useCallback(async () => {
    if (!quiz || submitting) return;

    try {
      setSubmitting(true);
      const startTime = quiz.timeLimit ? quiz.timeLimit * 60 : 0;
      const timeTaken = timeLeft !== null ? startTime - timeLeft : 0;

      const response = await api.post("/attempts", {
        quiz: quiz._id,
        answers: answers.map((a) => (a === null ? -1 : a)),
        timeTaken,
      });

      setResult({
        score: response.data.data.score,
        percentage: response.data.data.percentage,
        timeTaken: response.data.data.timeTaken,
      });
      setIsTaking(false);
    } catch (err) {
      alert("Failed to submit quiz");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers, timeLeft, submitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "Quiz not found"}</p>
        <button onClick={() => router.push("/quizzes")} className="mt-4 text-blue-600 hover:underline">
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Result view
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
            result.percentage >= 70 ? "bg-green-100" : result.percentage >= 40 ? "bg-yellow-100" : "bg-red-100"
          }`}>
            <span className={`text-3xl font-bold ${
              result.percentage >= 70 ? "text-green-600" : result.percentage >= 40 ? "text-yellow-600" : "text-red-600"
            }`}>
              {result.percentage}%
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            {result.percentage >= 70 ? "Great Job!" : result.percentage >= 40 ? "Good Effort!" : "Keep Practicing!"}
          </h1>
          <p className="mt-2 text-gray-600">You completed the quiz: {quiz.title}</p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-xl font-bold text-gray-900">{result.score}/{quiz.questions.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-xl font-bold text-gray-900">{result.percentage}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Time Taken</p>
              <p className="text-xl font-bold text-gray-900">{formatTime(result.timeTaken)}</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={startQuiz}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retry Quiz
            </button>
            <Link
              href="/quizzes"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  if (isTaking) {
    const question = quiz.questions[currentQuestion];
    const answeredCount = answers.filter((a) => a !== null).length;

    return (
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            {timeLeft !== null && (
              <div className={`px-4 py-2 rounded-lg ${timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  answers[currentQuestion] === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    answers[currentQuestion] === index
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-900">{option}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            {answeredCount} of {quiz.questions.length} answered
          </span>

          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestion === index
                    ? "bg-blue-600 text-white"
                    : answers[index] !== null
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz overview (before starting)
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/quizzes" className="hover:text-blue-600">Quizzes</Link>
        <span>/</span>
        <span className="text-gray-900">{quiz.title}</span>
      </nav>

      {/* Quiz Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                quiz.difficulty === "easy" ? "bg-green-100 text-green-700" :
                quiz.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {quiz.difficulty}
              </span>
              {!quiz.isPublished && isTeacherOrAdmin && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  Draft
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="mt-2 text-gray-600">{quiz.description || "No description available"}</p>
          </div>
          {isTeacherOrAdmin && (
            <Link
              href={`/quizzes/${quiz._id}/edit`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Quiz
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-medium text-gray-900">{quiz.subject?.name || "N/A"}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Questions</p>
            <p className="font-medium text-gray-900">{quiz.questions?.length || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Time Limit</p>
            <p className="font-medium text-gray-900">{quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Created by</p>
            <p className="font-medium text-gray-900">{quiz.createdBy?.name || "Unknown"}</p>
          </div>
        </div>

        {/* Start Quiz Button (only for students or if published) */}
        {(quiz.isPublished || isTeacherOrAdmin) && quiz.questions?.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={startQuiz}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isTeacherOrAdmin ? "Preview Quiz" : "Start Quiz"}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              {quiz.timeLimit
                ? `You will have ${quiz.timeLimit} minutes to complete this quiz.`
                : "Take your time, there is no time limit."}
            </p>
          </div>
        )}

        {quiz.questions?.length === 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            This quiz has no questions yet.
          </div>
        )}
      </div>
    </div>
  );
}
