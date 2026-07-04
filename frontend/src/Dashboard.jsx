import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Award,
  Briefcase,
  Plus,
  X,
  Loader2,
  LogOut,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const API_BASE = import.meta?.env?.VITE_API_URL || "https://everystage-backend.onrender.com";

async function authFetch(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export default function Dashboard({ user, token, onSignOut }) {
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [career, setCareer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setError("");
      const data = await authFetch("/api/profile", token);
      setEducation(data.education || []);
      setSkills(data.skills || []);
      setCareer(data.career || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const roleAccent = user?.role === "alumni" ? "#2FB8A6" : "#E8A33D";

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#0F1830]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#0F1830]/10 bg-[#FDFCF9] px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="font-serif text-lg font-semibold tracking-tight">Everystage</div>
          <span
            className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white"
            style={{ background: roleAccent }}
          >
            {user?.role}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold">{user?.fullName}</div>
            <div className="text-xs text-[#8B92A4]">{user?.email}</div>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 rounded-full border border-[#0F1830]/15 px-3.5 py-2 text-sm font-semibold text-[#5B6478] transition-colors hover:border-[#0F1830] hover:text-[#0F1830]"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-semibold">Your record</h1>
          <p className="mt-1 text-[#5B6478]">
            Every stage of your journey, in one place — add to it as things happen.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-[#C4443A]/10 px-4 py-3 text-sm text-[#C4443A]">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-[#8B92A4]">
            <Loader2 size={18} className="animate-spin" /> Loading your record...
          </div>
        ) : (
          <div className="space-y-12">
            <EducationSection token={token} items={education} onChange={loadProfile} />
            <SkillsSection token={token} items={skills} onChange={loadProfile} />
            <CareerSection token={token} items={career} onChange={loadProfile} />
          </div>
        )}
      </main>
    </div>
  );
}

/* ============================================================
   Shared bits
   ============================================================ */

function SectionHeader({ icon: Icon, title, count, accent, onAdd, adding }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: `${accent}1A`, color: accent }}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        <span className="font-mono text-xs text-[#8B92A4]">{count}</span>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 rounded-full border border-[#0F1830]/15 px-3 py-1.5 text-xs font-semibold text-[#0F1830] transition-colors hover:border-[#0F1830]"
      >
        {adding ? <X size={13} /> : <Plus size={13} />}
        {adding ? "Cancel" : "Add"}
      </button>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#0F1830]/15 bg-[#FDFCF9]/50 py-8 text-center text-sm text-[#8B92A4]">
      {text}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-wide text-[#8B92A4]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-[#0F1830]/10 bg-[#FDFCF9] px-3 py-2.5 text-sm text-[#0F1830] outline-none transition-all focus:border-[#E8A33D] focus:ring-4 focus:ring-[#E8A33D]/10";

function SaveButton({ saving, label = "Save" }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="flex items-center gap-1.5 rounded-full bg-[#0F1830] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-px disabled:opacity-60"
    >
      {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
      {label}
    </button>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

/* ============================================================
   Education
   ============================================================ */

function EducationSection({ token, items, onChange }) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    institution: "",
    program: "",
    degreeLevel: "bachelors",
    startDate: "",
    endDate: "",
    gpa: "",
    status: "in_progress",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await authFetch("/api/education", token, {
        method: "POST",
        body: JSON.stringify({ ...form, gpa: form.gpa ? Number(form.gpa) : undefined }),
      });
      setForm({ institution: "", program: "", degreeLevel: "bachelors", startDate: "", endDate: "", gpa: "", status: "in_progress" });
      setAdding(false);
      onChange();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await authFetch(`/api/education/${id}`, token, { method: "DELETE" });
    onChange();
  }

  return (
    <section>
      <SectionHeader icon={GraduationCap} title="Education" count={items.length} accent="#E8A33D" onAdd={() => setAdding((a) => !a)} adding={adding} />

      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 overflow-hidden rounded-2xl border border-[#0F1830]/10 bg-[#FDFCF9] p-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="Institution">
                <input required className={inputClass} value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
              </Field>
              <Field label="Program">
                <input className={inputClass} value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="B.Tech Computer Science" />
              </Field>
              <Field label="Degree level">
                <select className={inputClass} value={form.degreeLevel} onChange={(e) => setForm({ ...form, degreeLevel: e.target.value })}>
                  {["high_school", "associate", "bachelors", "masters", "doctorate", "certificate", "other"].map((v) => (
                    <option key={v} value={v}>{v.replace("_", " ")}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
              <Field label="Start date">
                <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </Field>
              <Field label="End date (optional)">
                <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </Field>
              <Field label="GPA (optional, out of 10)">
                <input type="number" step="0.01" min="0" max="10" className={inputClass} value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4"><SaveButton saving={saving} label="Save education" /></div>
          </motion.form>
        )}
      </AnimatePresence>

      {items.length === 0 && !adding ? (
        <EmptyState text="No education records yet — add your first one." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="group relative rounded-2xl border border-[#0F1830]/10 bg-[#FDFCF9] p-4">
              <button onClick={() => handleDelete(item._id)} className="absolute right-3 top-3 text-[#8B92A4] opacity-0 transition-opacity hover:text-[#C4443A] group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
              <div className="font-semibold">{item.institution}</div>
              {item.program && <div className="text-sm text-[#5B6478]">{item.program}</div>}
              <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-[#8B92A4]">
                <span>{formatDate(item.startDate) || "—"} – {formatDate(item.endDate) || "Present"}</span>
                {item.gpa && <span>· GPA {item.gpa}</span>}
              </div>
              <StatusPill status={item.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Skills
   ============================================================ */

function SkillsSection({ token, items, onChange }) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "technical", proficiency: "intermediate", issuer: "", earnedDate: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await authFetch("/api/skills", token, { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", category: "technical", proficiency: "intermediate", issuer: "", earnedDate: "" });
      setAdding(false);
      onChange();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await authFetch(`/api/skills/${id}`, token, { method: "DELETE" });
    onChange();
  }

  const proficiencyColor = { beginner: "#8B92A4", intermediate: "#E8A33D", advanced: "#2FB8A6", expert: "#0F1830" };

  return (
    <section>
      <SectionHeader icon={Award} title="Skills & Certifications" count={items.length} accent="#2FB8A6" onAdd={() => setAdding((a) => !a)} adding={adding} />

      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 overflow-hidden rounded-2xl border border-[#0F1830]/10 bg-[#FDFCF9] p-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="Skill name">
                <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="React" />
              </Field>
              <Field label="Issuer (optional)">
                <input className={inputClass} value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Coursera, AWS, self-taught..." />
              </Field>
              <Field label="Category">
                <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {["technical", "soft", "language", "certification", "other"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Proficiency">
                <select className={inputClass} value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: e.target.value })}>
                  {["beginner", "intermediate", "advanced", "expert"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Earned date (optional)">
                <input type="date" className={inputClass} value={form.earnedDate} onChange={(e) => setForm({ ...form, earnedDate: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4"><SaveButton saving={saving} label="Save skill" /></div>
          </motion.form>
        )}
      </AnimatePresence>

      {items.length === 0 && !adding ? (
        <EmptyState text="No skills added yet." />
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {items.map((item) => (
            <div key={item._id} className="group relative flex items-center gap-2 rounded-full border border-[#0F1830]/10 bg-[#FDFCF9] px-4 py-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ background: proficiencyColor[item.proficiency] }} />
              <span className="font-semibold">{item.name}</span>
              {item.issuer && <span className="text-[#8B92A4]">· {item.issuer}</span>}
              <button onClick={() => handleDelete(item._id)} className="text-[#8B92A4] opacity-0 transition-opacity hover:text-[#C4443A] group-hover:opacity-100">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Career Timeline
   ============================================================ */

function CareerSection({ token, items, onChange }) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", type: "full_time", status: "current", location: "", startDate: "", endDate: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await authFetch("/api/career", token, { method: "POST", body: JSON.stringify(form) });
      setForm({ company: "", role: "", type: "full_time", status: "current", location: "", startDate: "", endDate: "" });
      setAdding(false);
      onChange();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await authFetch(`/api/career/${id}`, token, { method: "DELETE" });
    onChange();
  }

  return (
    <section>
      <SectionHeader icon={Briefcase} title="Career Timeline" count={items.length} accent="#0F1830" onAdd={() => setAdding((a) => !a)} adding={adding} />

      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 overflow-hidden rounded-2xl border border-[#0F1830]/10 bg-[#FDFCF9] p-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company">
                <input required className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </Field>
              <Field label="Role">
                <input required className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </Field>
              <Field label="Type">
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {["internship", "full_time", "part_time", "contract", "offer"].map((v) => <option key={v} value={v}>{v.replace("_", " ")}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["applied", "interviewing", "offered", "accepted", "rejected", "current", "past"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Location (optional)">
                <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
              <Field label="Start date">
                <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </Field>
              <Field label="End date (optional, leave blank if current)">
                <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4"><SaveButton saving={saving} label="Save role" /></div>
          </motion.form>
        )}
      </AnimatePresence>

      {items.length === 0 && !adding ? (
        <EmptyState text="No career history yet — log a role, internship, or offer." />
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#0F1830]/10" />
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item._id} className="group relative">
                <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#F7F4EC] bg-[#0F1830]" />
                <div className="rounded-2xl border border-[#0F1830]/10 bg-[#FDFCF9] p-4">
                  <button onClick={() => handleDelete(item._id)} className="absolute right-3 top-3 text-[#8B92A4] opacity-0 transition-opacity hover:text-[#C4443A] group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                  <div className="font-semibold">{item.role} · {item.company}</div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[#8B92A4]">
                    <span>{formatDate(item.startDate) || "—"} – {formatDate(item.endDate) || "Present"}</span>
                    {item.location && <span>· {item.location}</span>}
                  </div>
                  <StatusPill status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }) {
  const colors = {
    completed: "#2FB8A6",
    in_progress: "#E8A33D",
    current: "#2FB8A6",
    accepted: "#2FB8A6",
    offered: "#2FB8A6",
    applied: "#8B92A4",
    interviewing: "#E8A33D",
    rejected: "#C4443A",
    past: "#8B92A4",
  };
  return (
    <span
      className="mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
      style={{ background: `${colors[status] || "#8B92A4"}1A`, color: colors[status] || "#8B92A4" }}
    >
      {status?.replace("_", " ")}
    </span>
  );
}
