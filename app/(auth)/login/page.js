"use client";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      alert("Login gagal: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl">🌙 Self Management</h2>
          <p className="text-sm opacity-70">Masuk dengan akun Google</p>
          <button 
            className="btn btn-primary btn-block mt-4"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Loading..." : "🔑 Login dengan Google"}
          </button>
        </div>
      </div>
    </div>
  );
}