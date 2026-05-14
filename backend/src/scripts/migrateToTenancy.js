/**
 * One-shot migration for the multi-tenancy roll-out.
 *
 *   - Sets visibility="public" on every existing Subject and Quiz so seeded
 *     content remains visible to everyone after the new filters land.
 *   - Generates a unique invite code for every teacher that does not yet have one.
 *   - Leaves student `teacher` as null — students opt in via the new invite flow.
 *
 * Idempotent: re-running it is safe.
 *
 * Usage:  node src/scripts/migrateToTenancy.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../config");
const { User, Subject, Quiz } = require("../models");
const { generateUniqueInviteCode } = require("../utils/inviteCode");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(config.mongodbUri);
  console.log("Connected.\n");

  try {
    // 1. Flip existing subjects/quizzes to public so seeded content stays visible.
    const subjectsRes = await Subject.updateMany(
      { visibility: { $ne: "public" } },
      { $set: { visibility: "public" } }
    );
    console.log(`Subjects updated to public: ${subjectsRes.modifiedCount}`);

    const quizzesRes = await Quiz.updateMany(
      { visibility: { $ne: "public" } },
      { $set: { visibility: "public" } }
    );
    console.log(`Quizzes updated to public:  ${quizzesRes.modifiedCount}`);

    // 2. Give every teacher an invite code if missing.
    const teachersWithoutCode = await User.find({
      role: "teacher",
      $or: [{ inviteCode: { $exists: false } }, { inviteCode: null }],
    });
    console.log(`Teachers needing an invite code: ${teachersWithoutCode.length}`);

    for (const teacher of teachersWithoutCode) {
      teacher.inviteCode = await generateUniqueInviteCode(User);
      await teacher.save();
      console.log(`  ${teacher.name} (${teacher.email}) → ${teacher.inviteCode}`);
    }

    console.log("\nMigration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
