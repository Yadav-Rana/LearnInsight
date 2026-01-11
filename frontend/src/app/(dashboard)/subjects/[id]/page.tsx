"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: "youtube" | "article" | "pdf";
}

interface Subject {
  _id: string;
  name: string;
  description: string;
  icon: string;
  parent: { _id: string; name: string } | null;
  level: number;
  createdBy: { _id: string; name: string };
  resources: Resource[];
  createdAt: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number | null;
  questionsCount: number;
  isPublished: boolean;
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [children, setChildren] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddResource, setShowAddResource] = useState(false);

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    if (params.id) {
      fetchSubject();
      fetchQuizzes();
    }
  }, [params.id]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const [subjectRes, hierarchyRes] = await Promise.all([
        api.get(`/subjects/${params.id}`),
        api.get(`/subjects/${params.id}/hierarchy`).catch(() => ({ data: { data: { children: [] } } })),
      ]);
      setSubject(subjectRes.data.data);
      setChildren(hierarchyRes.data.data?.children || []);
    } catch (err) {
      setError("Failed to load subject");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await api.get(`/quizzes/subject/${params.id}`);
      setQuizzes(response.data.data || []);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Remove this resource?")) return;
    try {
      await api.delete(`/subjects/${params.id}/resources/${resourceId}`);
      fetchSubject();
    } catch (err) {
      alert("Failed to remove resource");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "Subject not found"}</p>
        <button
          onClick={() => router.push("/subjects")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/subjects" className="hover:text-blue-600">
          Subjects
        </Link>
        <span>/</span>
        {subject.parent && (
          <>
            <Link href={`/subjects/${subject.parent._id}`} className="hover:text-blue-600">
              {subject.parent.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900">{subject.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
            <p className="mt-2 text-gray-600">{subject.description || "No description available"}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>Created by {subject.createdBy?.name || "Unknown"}</span>
              <span>•</span>
              <span>{subject.resources?.length || 0} resources</span>
              <span>•</span>
              <span>{quizzes.length} quizzes</span>
            </div>
          </div>
          {isTeacherOrAdmin && (
            <div className="flex gap-2">
              <Link
                href={`/subjects/${subject._id}/edit`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </Link>
              <Link
                href={`/quizzes/create?subject=${subject._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Quiz
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sub-subjects */}
      {children.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sub-topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <Link
                key={child._id}
                href={`/subjects/${child._id}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {child.description || "No description"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
          {isTeacherOrAdmin && (
            <button
              onClick={() => setShowAddResource(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Resource
            </button>
          )}
        </div>

        {subject.resources?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No resources added yet</p>
        ) : (
          <div className="space-y-3">
            {subject.resources?.map((resource) => (
              <div
                key={resource._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getResourceColor(resource.type)}`}>
                    {getResourceIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => handleDeleteResource(resource._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quizzes</h2>
          {isTeacherOrAdmin && (
            <Link
              href={`/quizzes/create?subject=${subject._id}`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Create Quiz
            </Link>
          )}
        </div>

        {quizzes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No quizzes available yet</p>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {quiz.questionsCount || 0} questions
                    {quiz.timeLimit && ` • ${quiz.timeLimit} min`}
                  </p>
                </div>
                <Link
                  href={`/quizzes/${quiz._id}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isTeacherOrAdmin ? "View" : "Take Quiz"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {showAddResource && (
        <AddResourceModal
          subjectId={subject._id}
          onClose={() => setShowAddResource(false)}
          onSuccess={() => {
            setShowAddResource(false);
            fetchSubject();
          }}
        />
      )}
    </div>
  );
}

function getResourceIcon(type: string) {
  switch (type) {
    case "youtube":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "pdf":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
}

function getResourceColor(type: string) {
  switch (type) {
    case "youtube":
      return "bg-red-100 text-red-600";
    case "pdf":
      return "bg-orange-100 text-orange-600";
    default:
      return "bg-blue-100 text-blue-600";
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "hard":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

interface AddResourceModalProps {
  subjectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddResourceModal({ subjectId, onClose, onSuccess }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    type: "article" as "youtube" | "article" | "pdf",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/subjects/${subjectId}/resources`, formData);
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add resource";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Resource</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Resource title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "youtube" | "article" | "pdf" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="article">Article</option>
              <option value="youtube">YouTube Video</option>
              <option value="pdf">PDF Document</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
