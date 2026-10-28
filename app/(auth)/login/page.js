// app/(auth)/login/page.js
"use client";

import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"; // Tambah setDoc
import { useRouter } from "next/navigation";
import { verifyPassword, hashPassword } from "@/lib/authdata"; // Tambah hashPassword
import { User, Eye, Lock, ArrowRight, Brain, RefreshCw, Save, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState("choose"); // "choose" | "password" | "reset"
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  // State buat Lupa Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const router = useRouter();

  const handleGoogleLogin = async (type) => {
    setLoading(true);
    setError("");
    setMode(type);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      if (type === "user") {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
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

  const handleResetPassword = async () => {
    setResetError("");
    setResetSuccess(false);

    if (newPassword.length < 6) {
      setResetError("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Password dan konfirmasi nggak sama.");
      return;
    }

    setLoading(true);
    try {
      const newHash = await hashPassword(newPassword);
      
      if (userData._type === "user") {
        await setDoc(doc(db, "users", userData._uid), { passwordHash: newHash }, { merge: true });
      } else {
        await setDoc(doc(db, "viewers", userData._uid), { passwordHash: newHash }, { merge: true });
      }

      // Update state lokal biar langsung sinkron
      setUserData({ ...userData, passwordHash: newHash });
      setResetSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      
      // Balik ke step password setelah 2 detik
      setTimeout(() => {
        setStep("password");
        setResetSuccess(false);
      }, 2000);

    } catch (err) {
      console.error("[reset] Error:", err);
      setResetError("Gagal reset password: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await signOut(auth);
    setMode(null);
    setStep("choose");
    setPassword("");
    setUserData(null);
    setError("");
    setResetError("");
    setResetSuccess(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">

          <div className="bg-primary/10 p-4 rounded-full mb-2 text-primary">
            <Brain size={40} className="text-primary" />
          </div>
          <h2 className="card-title text-2xl font-bold text-gray-800">Self Management</h2>

          {step === "choose" && (
            <>
              <p className="text-sm text-gray-500 mb-4">Pilih tipe akun untuk masuk:</p>

              <button
                className="btn btn-primary btn-block gap-2"
                onClick={() => handleGoogleLogin("user")}
                disabled={loading}
              >
                {loading && mode === "user" ? <span className="loading loading-spinner loading-sm" /> : <User size={18} />}
                {loading && mode === "user" ? "Menghubungkan..." : "Masuk sebagai User"}
              </button>

              <button
                className="btn btn-outline btn-secondary btn-block gap-2 mt-2"
                onClick={() => handleGoogleLogin("viewer")}
                disabled={loading}
              >
                {loading && mode === "viewer" ? <span className="loading loading-spinner loading-sm" /> : <Eye size={18} />}
                {loading && mode === "viewer" ? "Menghubungkan..." : "Masuk sebagai Viewer"}
              </button>

              <p className="text-xs text-gray-400 mt-4">Login aman menggunakan Google + Password.</p>

              <div className="divider text-xs text-gray-400">ATAU</div>

              <button
                className="btn btn-ghost btn-sm text-gray-600"
                onClick={() => router.push("/signup")}
              >
                Belum punya akun? Sign Up
              </button>
            </>
          )}

          {step === "password" && userData && (
            <>
              <div className={`badge ${userData._type === "user" ? "badge-primary" : "badge-secondary"} mb-2 gap-1`}>
                {userData._type === "user" ? <User size={12} /> : <Eye size={12} />}
                {userData._type === "user" ? "User" : "Viewer"}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Halo, <b className="text-gray-800">{userData.nama || userData.email}</b>!
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Masukin password akun lo.
              </p>

              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  className="input input-bordered w-full pl-10 text-center"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                  autoFocus
                />
              </div>

              <button
                className="btn btn-primary btn-block mt-3 gap-2"
                onClick={handleVerifyPassword}
                disabled={loading || !password}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : <ArrowRight size={18} />}
                {loading ? "Memverifikasi..." : "Masuk"}
              </button>

              <div className="flex justify-between w-full mt-2">
                <button
                  className="btn btn-ghost btn-xs text-gray-500"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  ← Batal
                </button>
                <button
                  className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                  onClick={() => { setStep("reset"); setError(""); }}
                  disabled={loading}
                >
                  Lupa Password?
                </button>
              </div>
            </>
          )}

          {step === "reset" && userData && (
            <>
              <div className="badge badge-warning mb-2 gap-1">
                <RefreshCw size={12} /> Reset Password
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Bikin password baru buat <b className="text-gray-800">{userData.nama || userData.email}</b>.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Pastiin lo inget password barunya ya.
              </p>

              <div className="space-y-2 w-full">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10 text-sm"
                    placeholder="Password Baru (min 6 karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10 text-sm"
                    placeholder="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {resetError && (
                <div className="alert alert-error mt-3 py-2 text-xs text-left w-full flex items-center gap-1">
                  <AlertTriangle size={14} /> <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="alert alert-success mt-3 py-2 text-xs text-left w-full flex items-center gap-1">
                  <CheckCircle2 size={14} /> <span>Password berhasil diubah! Mengalihkan...</span>
                </div>
              )}

              <button
                className="btn btn-primary btn-block mt-3 gap-2"
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmPassword || resetSuccess}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : <Save size={18} />}
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>

              <button
                className="btn btn-ghost btn-sm mt-2 text-gray-500 w-full"
                onClick={() => { setStep("password"); setNewPassword(""); setConfirmPassword(""); setResetError(""); }}
                disabled={loading || resetSuccess}
              >
                ← Batal Reset
              </button>
            </>
          )}

          {error && (
            <div className="alert alert-error mt-4 py-2 text-xs text-left w-full">
              <span>{error}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}