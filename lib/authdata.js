// lib/authData.js
// Helper buat auth: hash password, verify password, cek user/viewer.
// Versi: 1.0

import bcrypt from "bcryptjs";

// ========== HASH PASSWORD ==========
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// ========== VERIFY PASSWORD ==========
export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
}

// ========== VALIDASI PASSWORD ==========
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { valid: false, error: "Password minimal 6 karakter." };
  }
  return { valid: true };
}

// ========== VALIDASI EMAIL ==========
export function validateEmail(email) {
  if (!email || !email.includes("@")) {
    return { valid: false, error: "Email nggak valid." };
  }
  return { valid: true };
}

// ========== FORMAT TANGGAL ==========
export function nowISO() {
  return new Date().toISOString();
}