import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, GraduationCap, Award, Briefcase, Users2, ShieldCheck, Check } from "lucide-react";

/**
 * Everystage — Login
 * -------------------------------------------------------------
 * Talks to the auth API in /backend (POST /api/auth/login).
 * Drop your API base URL in API_BASE below, or wire it through
 * an env var (e.g. import.meta.env.VITE_API_URL).
 *
 * Usage:
 *   <LoginPage onAuthenticated={(user) => navigate('/dashboard')} />
 * -------------------------------------------------------------
 */

const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:4000";

const STAGES = [
  { key: "student", label: "STUDENT", sub: "Enrolled & verified", icon: GraduationCap },
  { key: "skills", label: "SKILLS", sub: "Certified & scored", icon: Award },
  { key: "career", label: "CAREER", sub: "Roles & offers logged", icon: Briefcase },
  { key: "alumni", label: "ALUMNI", sub: "Network & mentorship", icon: Users2 },
];

const COPY = {
  student: {
    emphasis: "tracked",
    greet: "Welcome back",
    sub: "Sign in to pick up your student record where you left off.",
    accent: "#E8A33D",
  },
  alumni: {
    emphasis: "connected",
    greet: "Good to see you",
    sub: "Sign in to reach your network, mentors, and career history.",
    accent: "#2FB8A6",
  },
};

export default function LoginPage({ onAuthenticated, onSwitchToSignup }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [serverError, setServerError] = useState("");

  const active = COPY[role];
  const activeStageIndex = role === "alumni" ? 3 : 0;

  function validate() {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // sends/receives the httpOnly refresh-token cookie
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setServerError(data.error || "Something went wrong. Try again.");
        setTimeout(() => setStatus("idle"), 400);
        return;
      }

      setStatus("success");
      // Keep the access token in memory (e.g. React context / state manager),
      // never in localStorage — it's short-lived and refreshed via the cookie.
      onAuthenticated?.(data.user, data.accessToken);
    } catch (err) {
      setStatus("error");
      setServerError("Couldn't reach the server. Check your connection.");
      setTimeout(() => setStatus("idle"), 400);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[42%_1fr] bg-[#FDFCF9] text-[#0F1830]">
      {/* ============ LEFT: STAGE PATH ============ */}
      <aside className="relative hidden md:flex flex-col justify-between overflow-hidden p-11 text-[#FDFCF9]"
        style={{ background: "radial-gradient(120% 140% at 20% 0%, #243968 0%, #0F1830 62%)" }}>
        <motion.div
          className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "#2FB8A6" }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -left-20 -bottom-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "#E8A33D" }}
          animate={{ x: [0, 25, 0], y: [0, -35, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.18em]">
          <motion.span
            className="h-[7px] w-[7px] rounded-full"
            animate={{ backgroundColor: active.accent, boxShadow: `0 0 0 4px ${active.accent}30` }}
            transition={{ duration: 0.5 }}
          />
          Everystage
        </div>

        <div className="relative z-10 mt-9">
          <h1 className="font-serif text-[clamp(30px,3.4vw,42px)] font-semibold leading-[1.12] tracking-tight">
            Every stage of<br />
            the journey,{" "}
            <AnimatePresence mode="wait">
              <motion.em
                key={active.emphasis}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="not-italic font-serif italic font-medium"
                style={{ color: active.accent }}
              >
                {active.emphasis}
              </motion.em>
            </AnimatePresence>
            .
          </h1>
          <p className="mt-3.5 max-w-[360px] text-[15px] leading-relaxed text-white/60">
            One record that follows you from your first semester to your next job offer —
            academics, skills, and career, all in one place.
          </p>
        </div>

        {/* Stage nodes */}
        <div className="relative z-10 my-6 flex flex-1 flex-col justify-center gap-8">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isActive = i === activeStageIndex;
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="flex items-center gap-4"
              >
                <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: isActive ? active.accent : "rgba(255,255,255,0.28)" }}>
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border"
                      style={{ borderColor: active.accent }}
                      animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <Icon size={16} strokeWidth={1.6} />
                </div>
                <div>
                  <div className={`font-mono text-[11px] tracking-wide ${isActive ? "text-white" : "text-white/55"}`}>
                    {stage.label}
                  </div>
                  <div className="font-mono text-[9.5px] tracking-wide text-white/38">{stage.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[12.5px] text-white/40">
          <ShieldCheck size={14} strokeWidth={1.8} />
          Secure, consent-based data handling
        </div>
      </aside>

      {/* ============ RIGHT: FORM ============ */}
      <main className="flex items-center justify-center bg-[#F7F4EC] px-6 py-10 md:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center justify-between">
            <div className="font-serif text-[19px] font-semibold tracking-tight">Everystage</div>

            <div className="relative flex rounded-full bg-[#0F1830]/[0.06] p-[3px] font-mono text-[11.5px] tracking-wide">
              <motion.div
                className="absolute inset-y-[3px] w-[calc(50%-3px)] rounded-full bg-[#0F1830]"
                animate={{ x: role === "alumni" ? "calc(100% + 3px)" : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
              {["student", "alumni"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`relative z-10 rounded-full px-4 py-2 uppercase transition-colors duration-300 ${
                    role === r ? "text-white" : "text-[#5B6478]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-serif text-[26px] font-semibold">{active.greet}</h2>
                <p className="mt-1.5 text-sm text-[#5B6478]">{active.sub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <FloatingField
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={setEmail}
              error={errors.email}
              autoComplete="email"
            />

            <FloatingField
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="p-1 text-[#8B92A4] transition-colors hover:text-[#0F1830]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {serverError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 text-[13px] text-[#C4443A]"
              >
                {serverError}
              </motion.p>
            )}

            <div className="mb-6 flex items-center justify-between text-[13.5px]">
              <label className="flex cursor-pointer items-center gap-2 text-[#5B6478]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-[15px] w-[15px] accent-[#0F1830]"
                />
                Remember me
              </label>
              <a href="#" className="font-semibold text-[#0F1830] hover:underline">
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              className="relative flex w-full items-center justify-center rounded-[14px] py-4 font-bold text-[15px] text-[#FDFCF9] transition-colors"
              style={{ background: status === "success" ? "#2FB8A6" : "#0F1830" }}
            >
              <AnimatePresence mode="wait">
                {status === "loading" ? (
                  <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.span
                      className="block h-[18px] w-[18px] rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.span>
                ) : status === "success" ? (
                  <motion.span key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Check size={18} strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Sign in
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-3.5 font-mono text-[12px] uppercase tracking-wide text-[#8B92A4]">
            <span className="h-px flex-1 bg-[#0F1830]/[0.10]" />
            or continue with
            <span className="h-px flex-1 bg-[#0F1830]/[0.10]" />
          </div>

          <div className="flex gap-2.5">
            <SsoButton label="Google" />
            <SsoButton label="LinkedIn" />
          </div>

          <p className="mt-7 text-center text-[13.5px] text-[#5B6478]">
            New here?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="border-b border-[#0F1830] font-bold text-[#0F1830]"
            >
              Create an account
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

function FloatingField({ id, type, label, value, onChange, error, autoComplete, trailing }) {
  return (
    <div className="relative mb-4.5">
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder=" "
        onChange={(e) => onChange(e.target.value)}
        className={`peer w-full rounded-[14px] border-[1.5px] bg-[#FDFCF9] px-4 pb-2 pt-[19px] text-[15px] text-[#0F1830] outline-none transition-all placeholder-transparent focus:border-[#E8A33D] focus:ring-4 focus:ring-[#E8A33D]/[0.12] ${
          error ? "border-[#C4443A]" : "border-[#0F1830]/[0.10]"
        }`}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 font-mono uppercase tracking-wide text-[#8B92A4] transition-all duration-200
          peer-focus:top-2 peer-focus:text-[10.5px] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10.5px]
          ${value ? "top-2 text-[10.5px]" : "top-[19px] text-[15px] normal-case tracking-normal font-sans"}`}
      >
        {label}
      </label>
      {trailing && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      {error && <p className="mb-0 mt-1.5 ml-0.5 text-xs text-[#C4443A]">{error}</p>}
    </div>
  );
}

function SsoButton({ label }) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#0F1830]/[0.10] bg-[#FDFCF9] py-3 text-[13.5px] font-semibold text-[#0F1830] transition-all hover:-translate-y-px hover:border-[#0F1830]"
    >
      {label}
    </button>
  );
}
