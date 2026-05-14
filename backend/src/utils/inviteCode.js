const crypto = require("crypto");

// Base32-style alphabet excluding visually-confusing characters: 0/O, 1/I/L
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generate a random invite code in the form "TCH-XXXX" (4 chars after prefix).
 */
const generateInviteCode = () => {
  const bytes = crypto.randomBytes(4);
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `TCH-${code}`;
};

/**
 * Generate a unique invite code, retrying if a collision is found in the User collection.
 */
const generateUniqueInviteCode = async (User) => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateInviteCode();
    const existing = await User.findOne({ inviteCode: code }).select("_id");
    if (!existing) return code;
  }
  throw new Error("Unable to generate a unique invite code after 8 attempts");
};

module.exports = { generateInviteCode, generateUniqueInviteCode };
