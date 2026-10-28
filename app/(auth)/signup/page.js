// app/(auth)/signup/page.js
"use client";

import { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { hashPassword, validatePassword, validateEmail, nowISO } from "@/lib/authdata";
import { UserPlus, User, Eye, CheckCircle2, Brain } from "lucide-react";

export default function Signup() {
  const [step, setStep] = useState("choose");
  const [tipe, setTipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [googleUser, setGoogleUser] = useState(null);
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const router = useRouter();

  const handleGoogleSignup = async (type) => {
    setLoading(true);
    setError("");
    setTipe(type);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (type === "user") {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().passwordHash) {
          setError("Akun ini udah terdaftar sebagai User. Silakan login.");
          setLoading(false);
          return;
        }
      } else if (type === "viewer") {
        const viewerRef = doc(db, "viewers", user.uid);
        const viewerSnap = await getDoc(viewerRef);
        if (viewerSnap.exists() && viewerSnap.data().passwordHash) {
          setError("Akun ini udah terdaftar sebagai Viewer. Silakan login.");
          setLoading(false);
          return;
        }
      }

      setGoogleUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      });
      setNama(user.displayName || "");
      setStep("form");
      setLoading(false);
    } catch (err) {
      console.error("[signup] Error:", err);
      setError("Sign up gagal: " + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    const emailCheck = validateEmail(googleUser.email);
    if (!emailCheck.valid) {
      setError(emailCheck.error);
      return;
    }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setError(pwCheck.error);
      return;
    }
    if (password !== passwordConfirm) {
      setError("Password dan konfirmasi password nggak sama.");
      return;
    }

    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);

      if (tipe === "user") {
        const userRef = doc(db, "users", googleUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          await setDoc(userRef, {
            email: googleUser.email,
            nama: nama || googleUser.displayName,
            photoURL: googleUser.photoURL,
            passwordHash,
            role: "owner",
            updatedAt: nowISO(),
          }, { merge: true });
        } else {
          await setDoc(userRef, {
            email: googleUser.email,
            nama: nama || googleUser.displayName,
            photoURL: googleUser.photoURL,
            passwordHash,
            role: "owner",
            createdAt: nowISO(),
            updatedAt: nowISO(),
          });
        }
      } else if (tipe === "viewer") {
        const viewerRef = doc(db, "viewers", googleUser.uid);
        await setDoc(viewerRef, {
          email: googleUser.email,
          nama: nama || googleUser.displayName,
          photoURL: googleUser.photoURL,
          passwordHash,
          role: "viewer",
          createdAt: nowISO(),
          updatedAt: nowISO(),
        });
      }

      setStep("success");
      setLoading(false);
    } catch (err) {
      console.error("[signup] Submit error:", err);
      setError("Gagal daftar: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "success") {
      const t = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [step, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">

          <div className="flex flex-col items-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full mb-2 text-primary">
              <Brain size={40} className="text-primary" />
            </div>
            <h2 className="card-title text-2xl font-bold text-gray-800">Daftar Akun</h2>
          </div>

          {step === "choose" && (
            <>
              <p className="text-sm text-gray-500 text-center mb-3">Pilih tipe akun:</p>

              <button
                className="btn btn-primary btn-block gap-2"
                onClick={() => handleGoogleSignup("user")}
                disabled={loading}
              >
                {loading && tipe === "user" ? <span className="loading loading-spinner loading-sm" /> : <User size={18} />}
                {loading && tipe === "user" ? "Menghubungkan..." : "Daftar sebagai User"}
              </button>

              <button
                className="btn btn-outline btn-secondary btn-block gap-2 mt-2"
                onClick={() => handleGoogleSignup("viewer")}
                disabled={loading}
              >
                {loading && tipe === "viewer" ? <span className="loading loading-spinner loading-sm" /> : <Eye size={18} />}
                {loading && tipe === "viewer" ? "Menghubungkan..." : "Daftar sebagai Viewer"}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Gunakan akun Google Anda.
              </p>

              <div className="divider text-xs text-gray-400">ATAU</div>

              <button
                className="btn btn-ghost btn-sm text-gray-600"
                onClick={() => router.push("/login")}
              >
                Sudah punya akun? Login
              </button>
            </>
          )}

          {step === "form" && googleUser && (
            <>
              <div className={`badge ${tipe === "user" ? "badge-primary" : "badge-secondary"} mx-auto mb-2 gap-1`}>
                {tipe === "user" ? <User size={12} /> : <Eye size={12} />}
                {tipe === "user" ? "User" : "Viewer"}
              </div>

              <div className="flex items-center gap-3 mt-2 p-3 bg-base-200 rounded-lg">
                {googleUser.photoURL && (
                  <img src={googleUser.photoURL} alt="avatar" className="w-10 h-10 rounded-full border border-base-300" />
                )}
                <div className="text-left text-xs">
                  <p className="font-bold text-gray-800">{googleUser.displayName}</p>
                  <p className="text-gray-500">{googleUser.email}</p>
                </div>
              </div>

              <div className="form-control mt-3">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold text-gray-600">Nama Panggilan</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  placeholder="Nama lo"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div className="form-control mt-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold text-gray-600">Password (min 6 karakter)</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered input-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-control mt-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold text-gray-600">Konfirmasi Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered input-sm"
                  placeholder="Ulangi password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>

              {tipe === "viewer" && (
                <div className="alert alert-info mt-3 py-2 text-xs">
                  <span>
                    Viewer bisa liat semua user yang terdaftar di website. Nggak perlu pilih owner.
                  </span>
                </div>
              )}

              <button
                className="btn btn-primary btn-block mt-4 gap-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : <UserPlus size={18} />}
                {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
              </button>

              <button
                className="btn btn-ghost btn-sm mt-2 text-gray-500"
                onClick={() => {
                  setStep("choose");
                  setGoogleUser(null);
                  setPassword("");
                  setPasswordConfirm("");
                }}
                disabled={loading}
              >
                ← Batal
              </button>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="text-success mx-auto mb-3" />
              <p className="font-bold text-lg text-gray-800">Berhasil Daftar!</p>
              <p className="text-sm text-gray-500 mt-2">
                Anda akan diarahkan ke halaman login dalam 3 detik...
              </p>
              <span className="loading loading-dots loading-sm mt-4 text-primary"></span>
            </div>
          )}

          {error && (
            <div className="alert alert-error mt-3 py-2 text-xs">
              <span>{error}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}