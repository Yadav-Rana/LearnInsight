/**
 * Build a Mongo `$or` clause that restricts a content collection
 * (Subject or Quiz) based on the requester's role and tenancy.
 *
 *   - admin   → no restriction (returns null; callers should skip filtering)
 *   - teacher → public OR created by me
 *   - student → public OR created by my teacher (if attached)
 *   - other   → public only
 */
const buildVisibilityFilter = (user) => {
  if (!user) return [{ visibility: "public" }];
  if (user.role === "admin") return null; // unrestricted
  if (user.role === "teacher") {
    return [{ visibility: "public" }, { createdBy: user._id }];
  }
  // student
  const teacherId = user.teacher;
  return teacherId
    ? [{ visibility: "public" }, { createdBy: teacherId }]
    : [{ visibility: "public" }];
};

/**
 * Apply the visibility filter to an existing query object.
 * Returns the same object for convenience.
 */
const applyVisibilityFilter = (query, user) => {
  const orClause = buildVisibilityFilter(user);
  if (orClause === null) return query; // admin, no restriction
  // If the query already has $or, AND-merge by pushing onto $and
  if (query.$or) {
    query.$and = (query.$and || []).concat([{ $or: query.$or }, { $or: orClause }]);
    delete query.$or;
  } else {
    query.$or = orClause;
  }
  return query;
};

/**
 * Returns true if `user` is allowed to view this content document.
 * Used for getById endpoints after a single fetch.
 */
const canViewContent = (doc, user) => {
  if (!doc) return false;
  if (!user) return doc.visibility === "public";
  if (user.role === "admin") return true;
  if (doc.visibility === "public") return true;
  const createdBy = (doc.createdBy && doc.createdBy._id) || doc.createdBy;
  if (user.role === "teacher") {
    return createdBy && createdBy.toString() === user._id.toString();
  }
  // student
  if (!user.teacher) return false;
  return createdBy && createdBy.toString() === user.teacher.toString();
};

module.exports = {
  buildVisibilityFilter,
  applyVisibilityFilter,
  canViewContent,
};
