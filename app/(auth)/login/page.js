// app/(auth)/login/page.js
"use client";

import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { verifyPassword } from "@/lib/authdata";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null); // null | "user" | "viewer"
  const [step, setStep] = useState("choose"); // "choose" | "google" | "password"
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null); // data user/viewer setelah Google login
  const [error, setError] = useState("");
  const router = useRouter();

  // ========== LOGIN GOOGLE ==========
  const handleGoogleLogin = async (type) => {
    setLoading(true);
    setError("");
    setMode(type);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      // Cek apakah user terdaftar
      if (type === "user") {
        // Cek di collection users
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // User baru — belum sign up
          await signOut(auth);
          setError("Akun ini belum terdaftar sebagai User. Silakan Sign Up dulu.");
          setLoading(false);
          return;
        }

        const data = userSnap.data();
        if (!data.passwordHash) {
          await signOut(auth);
          setError("Akun ini belum punya password. Silakan Sign Up ulang.");
          setLoading(false);
          return;
        }

        setUserData({ ...data, _uid: user.uid, _type: "user" });
        setStep("password");
        setLoading(false);
      } else if (type === "viewer") {
        // Cek di collection viewers
        const q = query(collection(db, "viewers"), where("email", "==", email));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
          await signOut(auth);
          setError("Akun ini belum terdaftar sebagai Viewer. Silakan Sign Up dulu.");
          setLoading(false);
          return;
        }

        const viewerDoc = querySnap.docs[0];
        const data = viewerDoc.data();

        if (!data.passwordHash) {
          await signOut(auth);
          setError("Akun viewer ini belum punya password. Silakan Sign Up ulang.");
          setLoading(false);
          return;
        }

        setUserData({ ...data, _uid: viewerDoc.id, _type: "viewer" });
        setStep("password");
        setLoading(false);
      }
    } catch (err) {
      console.error("[login] Error:", err);
      setError("Login gagal: " + err.message);
      setLoading(false);
    }
  };

  // ========== VERIFY PASSWORD ==========
  const handleVerifyPassword = async () => {
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const valid = await verifyPassword(password, userData.passwordHash);
      if (!valid) {
        setError("Password salah. Coba lagi.");
        setLoading(false);
        return;
      }

      // Password bener — redirect
      if (userData._type === "user") {
        router.push("/dashboard");
      } else {
        router.push("/viewer");
      }
    } catch (err) {
      console.error("[login] Verify error:", err);
      setError("Terjadi error: " + err.message);
      setLoading(false);
    }
  };

  // ========== BATAL ==========
  const handleCancel = async () => {
    await signOut(auth);
    setMode(null);
    setStep("choose");
    setPassword("");
    setUserData(null);
    setError("");
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">

          {/* HEADER */}
          <h2 className="card-title text-2xl">🌙 Self Management</h2>

          {/* STEP: CHOOSE */}
          {step === "choose" && (
            <>
              <p className="text-sm opacity-70 mb-2">Pilih tipe login:</p>

              <button
                className="btn btn-primary btn-block mt-2"
                onClick={() => handleGoogleLogin("user")}
                disabled={loading}
              >
                {loading && mode === "user" ? "Loading..." : "👤 LOGIN SEBAGAI USER"}
              </button>

              <button
                className="btn btn-secondary btn-block mt-2"
                onClick={() => handleGoogleLogin("viewer")}
                disabled={loading}
              >
                {loading && mode === "viewer" ? "Loading..." : "👁️ LOGIN SEBAGAI VIEWER"}
              </button>

              <p className="text-xs opacity-50 mt-4">Login pake akun Google + password.</p>

              <div className="divider">ATAU</div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push("/signup")}
              >
                BELUM DAFTAR? SILAHKAN SIGN UP
              </button>
            </>
          )}

          {/* STEP: PASSWORD */}
          {step === "password" && userData && (
            <>
              <div className="badge badge-primary mb-2">
                {userData._type === "user" ? "👤 User" : "👁️ Viewer"}
              </div>
              <p className="text-sm opacity-70 mb-2">
                Halo, <b>{userData.nama || userData.email}</b>!
              </p>
              <p className="text-xs opacity-60 mb-4">
                Masukin password {userData._type === "user" ? "user" : "viewer"} lo.
              </p>

              <input
                type="password"
                className="input input-bordered w-full text-center"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                autoFocus
              />

              <button
                className="btn btn-primary btn-block mt-3"
                onClick={handleVerifyPassword}
                disabled={loading || !password}
              >
                {loading ? "Loading..." : "🔓 Masuk"}
              </button>

              <button
                className="btn btn-ghost btn-sm mt-2"
                onClick={handleCancel}
                disabled={loading}
              >
                ← Batal
              </button>
            </>
          )}

          {/* ERROR */}
          {error && (
            <div className="alert alert-error mt-3 py-2 text-xs">
              <span>❌ {error}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}