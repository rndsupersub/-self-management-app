// app/(auth)/signup/page.js
"use client";

import { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { hashPassword, validatePassword, validateEmail, nowISO } from "@/lib/authdata";

export default function Signup() {
  const [step, setStep] = useState("choose");
  const [tipe, setTipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [googleUser, setGoogleUser] = useState(null);
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [ownerList, setOwnerList] = useState([]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

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

        setLoadingOwners(true);
        try {
          const usersSnap = await getDocs(collection(db, "users"));
          const owners = usersSnap.docs
            .map((d) => ({ uid: d.id, ...d.data() }))
            .filter((u) => !u.role || u.role === "owner")
            .map((u) => ({
              uid: u.uid,
              nama: u.nama || u.displayName || u.email || "User tanpa nama",
              email: u.email || "",
            }));
          setOwnerList(owners);
        } catch (err) {
          console.error("[signup] Gagal fetch owners:", err);
          setError("Gagal ambil daftar owner: " + err.message);
        }
        setLoadingOwners(false);
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

  const toggleOwner = (uid) => {
    setSelectedOwners((prev) =>
      prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]
    );
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
    if (tipe === "viewer" && selectedOwners.length === 0) {
      setError("Pilih minimal 1 owner yang mau lo liat.");
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
          ownerUids: selectedOwners,
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
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">

          <h2 className="card-title text-2xl text-center justify-center">📝 Sign Up</h2>

          {step === "choose" && (
            <>
              <p className="text-sm opacity-70 text-center mb-3">Daftar sebagai:</p>

              <button
                className="btn btn-primary btn-block"
                onClick={() => handleGoogleSignup("user")}
                disabled={loading}
              >
                {loading && tipe === "user" ? "Loading..." : "👤 Daftar sebagai USER"}
              </button>

              <button
                className="btn btn-secondary btn-block mt-2"
                onClick={() => handleGoogleSignup("viewer")}
                disabled={loading}
              >
                {loading && tipe === "viewer" ? "Loading..." : "👁️ Daftar sebagai VIEWER"}
              </button>

              <p className="text-xs opacity-50 text-center mt-3">
                Daftar pake akun Google + bikin password.
              </p>

              <div className="divider">ATAU</div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push("/login")}
              >
                UDAH PUNYA AKUN? LOGIN
              </button>
            </>
          )}

          {step === "form" && googleUser && (
            <>
              <div className={`badge ${tipe === "user" ? "badge-primary" : "badge-secondary"} mx-auto`}>
                {tipe === "user" ? "👤 User" : "👁️ Viewer"}
              </div>

              <div className="flex items-center gap-2 mt-3 p-2 bg-base-200 rounded">
                {googleUser.photoURL && (
                  <img src={googleUser.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
                )}
                <div className="text-left text-xs">
                  <p className="font-bold">{googleUser.displayName}</p>
                  <p className="opacity-60">{googleUser.email}</p>
                </div>
              </div>

              <div className="form-control mt-3">
                <label className="label">
                  <span className="label-text text-xs">Nama</span>
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
                <label className="label">
                  <span className="label-text text-xs">Password (min 6 karakter)</span>
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
                <label className="label">
                  <span className="label-text text-xs">Konfirmasi Password</span>
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
                <div className="form-control mt-3">
                  <label className="label">
                    <span className="label-text text-xs">
                      Pilih owner yang mau lo liat (min 1)
                    </span>
                  </label>

                  {loadingOwners ? (
                    <p className="text-xs text-center opacity-50">
                      <span className="loading loading-spinner loading-xs"></span> Loading owner...
                    </p>
                  ) : ownerList.length === 0 ? (
                    <p className="text-xs text-center opacity-50 italic">
                      Belum ada owner terdaftar.
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {ownerList.map((owner) => (
                        <label
                          key={owner.uid}
                          className="flex items-center gap-2 p-2 rounded bg-base-200 cursor-pointer hover:bg-base-300"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selectedOwners.includes(owner.uid)}
                            onChange={() => toggleOwner(owner.uid)}
                          />
                          <div className="text-left text-xs">
                            <p className="font-bold">{owner.nama}</p>
                            <p className="opacity-60">{owner.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn btn-primary btn-block mt-4"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Loading..." : "✅ Daftar"}
              </button>

              <button
                className="btn btn-ghost btn-sm mt-2"
                onClick={() => {
                  setStep("choose");
                  setGoogleUser(null);
                  setPassword("");
                  setPasswordConfirm("");
                  setSelectedOwners([]);
                }}
                disabled={loading}
              >
                ← Batal
              </button>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-bold text-lg">Berhasil daftar!</p>
              <p className="text-sm opacity-70 mt-2">
                Lo bakal diarahkan ke halaman login dalam 3 detik...
              </p>
            </div>
          )}

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