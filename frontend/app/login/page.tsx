"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Globe2 } from "lucide-react";
import { login, saveToken } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Logo } from "../../components/Logo";
import { SmartImage } from "../../components/SmartImage";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      saveToken(res.access_token);
      // Redirect based on user role
      const redirectPath = res.user?.role === "admin" ? "/admin" : "/search";
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <SmartImage
          src="https://images.unsplash.com/photo-1524492412937-b5600c9fd34b?auto=format&fit=crop&w=1400&q=80"
          alt="Taj Mahal at sunrise"
          gradient="from-brand-900 via-brand-800 to-slate-900"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/85 via-brand-800/70 to-slate-900/80" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo />
          <div>
            <h2 className="max-w-md text-4xl font-extrabold leading-tight">
              Your next journey starts here
            </h2>
            <p className="mt-4 max-w-md text-brand-50/90">
              Compare every way to travel, book the right stay, and plan complete
              trips across India — all in one calm place.
            </p>
            <div className="mt-8 flex gap-6 text-sm text-brand-50/80">
              <Stat k="7+" v="travel modes" />
              <Stat k="500+" v="destinations" />
              <Stat k="24/7" v="AI assist" />
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-500">Log in to plan and manage your trips.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Email" htmlFor="email" required error={error ? undefined : undefined}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="field pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="password" required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="field px-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                Remember me
              </label>
              <a href="#" className="text-sm font-semibold text-brand-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to TravelSphere?{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-white">{k}</div>
      <div className="text-xs">{v}</div>
    </div>
  );
}
