"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Loader } from "@/components/ui";
import { GlassCard } from "@/components/dashboard";
import { useAuth } from "@/hooks/useAuth";

type ResourceType = "youtube" | "article" | "pdf" | "other";

interface ResourceData {
  _id?: string;
  title: string;
  url: string;
  type: ResourceType;
  description: string;
}

interface SubjectData {
  name: string;
  description: string;
  icon: string;
  parent: string;
  order: number;
  isActive: boolean;
  visibility: "public" | "private";
}

interface SubjectOption {
  _id: string;
  name: string;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
};

const sectionMotion = (i: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay: i * 0.1 },
});

const ICON_OPTIONS = ["code", "cpu", "database", "globe", "layers", "settings", "book", "beaker"];

export default function EditSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const [subject, setSubject] = useState<SubjectData>({
    name: "",
    description: "",
    icon: "",
    parent: "",
    order: 0,
    isActive: true,
    visibility: "private",
  });
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [otherSubjects, setOtherSubjects] = useState<SubjectOption[]>([]);
  const [newResource, setNewResource] = useState<ResourceData>({
    title: "",
    url: "",
    type: "youtube",
    description: "",
  });
  const [addingResource, setAddingResource] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get(`/subjects/${params.id}`), api.get("/subjects")])
      .then(([subjectRes, allRes]) => {
        const s = subjectRes.data.data;
        const createdById =
          typeof s.createdBy === "object" ? s.createdBy._id : s.createdBy;
        if (user && user.role !== "admin" && createdById !== user._id) {
          setForbidden(true);
          setLoading(false);
          return;
        }
        setSubject({
          name: s.name || "",
          description: s.description || "",
          icon: s.icon || "",
          parent: s.parent ? (typeof s.parent === "object" ? s.parent._id : s.parent) : "",
          order: s.order ?? 0,
          isActive: s.isActive !== false,
          visibility: s.visibility === "public" ? "public" : "private",
        });
        setResources(
          (s.resources || []).map((r: ResourceData) => ({
            _id: r._id,
            title: r.title,
            url: r.url,
            type: r.type,
            description: r.description || "",
          }))
        );
        const all: SubjectOption[] = allRes.data.data || allRes.data.subjects || [];
        setOtherSubjects(all.filter((sub) => sub._id !== params.id));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load subject");
        setLoading(false);
      });
  }, [params.id, user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const payload: Record<string, unknown> = {
        name: subject.name,
        description: subject.description,
        icon: subject.icon || null,
        parent: subject.parent || null,
        order: subject.order,
        isActive: subject.isActive,
      };
      if (isAdmin) payload.visibility = subject.visibility;
      await api.put(`/subjects/${params.id}`, payload);
      router.push(`/subjects/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.url.trim()) {
      setError("Resource title and URL are required");
      return;
    }
    try {
      setAddingResource(true);
      setError("");
      const res = await api.post(`/subjects/${params.id}/resources`, newResource);
      setResources(res.data.resources || []);
      setNewResource({ title: "", url: "", type: "youtube", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add resource");
    } finally {
      setAddingResource(false);
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    try {
      setRemovingId(resourceId);
      setError("");
      const res = await api.delete(`/subjects/${params.id}/resources/${resourceId}`);
      setResources(res.data.resources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove resource");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="md" variant="wave" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-2xl mx-auto pt-16 text-center space-y-4">
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          You can&apos;t edit this subject
        </h2>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
          Only the subject&apos;s owner or an admin can edit it.
        </p>
        <button
          onClick={() => router.push(`/subjects/${params.id}`)}
          className="px-5 py-2 rounded-xl text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            color: "white",
            fontFamily: "var(--font-body)",
          }}
        >
          Back to subject
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div {...sectionMotion(0)} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Edit Subject
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
            Update details and manage resources
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
              color: "white",
              fontFamily: "var(--font-body)",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>

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

      <motion.div {...sectionMotion(1)}>
        <GlassCard>
          <h2
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Subject Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Name *
              </label>
              <input
                type="text"
                value={subject.name}
                onChange={(e) => setSubject({ ...subject, name: e.target.value })}
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Description
              </label>
              <textarea
                value={subject.description}
                onChange={(e) => setSubject({ ...subject, description: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30 resize-none"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {subject.description.length}/500
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Icon
                </label>
                <select
                  value={subject.icon}
                  onChange={(e) => setSubject({ ...subject, icon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                >
                  <option value="" style={{ background: "#1a1a2e" }}>None</option>
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic} style={{ background: "#1a1a2e" }}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Parent
                </label>
                <select
                  value={subject.parent}
                  onChange={(e) => setSubject({ ...subject, parent: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                >
                  <option value="" style={{ background: "#1a1a2e" }}>None (root)</option>
                  {otherSubjects.map((s) => (
                    <option key={s._id} value={s._id} style={{ background: "#1a1a2e" }}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Display Order
                </label>
                <input
                  type="number"
                  value={subject.order}
                  onChange={(e) => setSubject({ ...subject, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subject.isActive}
                  onChange={(e) => setSubject({ ...subject, isActive: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                >
                  Active
                </span>
              </label>
              {isAdmin && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subject.visibility === "public"}
                    onChange={(e) =>
                      setSubject({ ...subject, visibility: e.target.checked ? "public" : "private" })
                    }
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                  >
                    Public (visible to everyone)
                  </span>
                </label>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div {...sectionMotion(2)}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Resources
            </h2>
            <span
              className="text-xs"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              {resources.length} {resources.length === 1 ? "resource" : "resources"}
            </span>
          </div>

          {resources.length === 0 ? (
            <p
              className="text-sm py-2"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              No resources yet. Add one below.
            </p>
          ) : (
            <div className="space-y-2 mb-6">
              {resources.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium"
                    style={{
                      background: "rgba(249, 115, 22, 0.12)",
                      border: "1px solid rgba(249, 115, 22, 0.3)",
                      color: "#F97316",
                    }}
                  >
                    {r.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                    >
                      {r.title}
                    </p>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs truncate block hover:underline"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {r.url}
                    </a>
                  </div>
                  <button
                    onClick={() => r._id && handleRemoveResource(r._id)}
                    disabled={!r._id || removingId === r._id}
                    className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-40"
                    style={{ color: "rgba(255, 255, 255, 0.4)" }}
                    title="Remove resource"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className="p-4 rounded-xl"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed rgba(255, 255, 255, 0.15)",
            }}
          >
            <h3
              className="text-sm font-medium mb-3"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              Add a resource
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,140px] gap-3">
              <input
                type="text"
                placeholder="Title"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className="px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                style={inputStyle}
              />
              <input
                type="url"
                placeholder="https://..."
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                className="px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                style={inputStyle}
              />
              <select
                value={newResource.type}
                onChange={(e) =>
                  setNewResource({ ...newResource, type: e.target.value as ResourceType })
                }
                className="px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                style={inputStyle}
              >
                <option value="youtube" style={{ background: "#1a1a2e" }}>YouTube</option>
                <option value="article" style={{ background: "#1a1a2e" }}>Article</option>
                <option value="pdf" style={{ background: "#1a1a2e" }}>PDF</option>
                <option value="other" style={{ background: "#1a1a2e" }}>Other</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              className="w-full mt-3 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              style={inputStyle}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAddResource}
                disabled={addingResource}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                }}
              >
                {addingResource ? "Adding..." : "Add Resource"}
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div {...sectionMotion(3)} className="flex justify-end gap-2 pb-8">
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            color: "white",
            fontFamily: "var(--font-body)",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>
    </div>
  );
}
