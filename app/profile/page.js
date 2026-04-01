"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

/* ── tiny animation helper injected once ── */
const STYLE = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
.fade-up {
  opacity: 0;
  animation: fadeUp 0.45s ease forwards;
}
.fade-up-1  { animation-delay: 0.05s; }
.fade-up-2  { animation-delay: 0.12s; }
.fade-up-3  { animation-delay: 0.19s; }
.fade-up-4  { animation-delay: 0.26s; }
.fade-up-5  { animation-delay: 0.33s; }
.shimmer-bg {
  background: linear-gradient(90deg, #f0fdf4 25%, #dcfce7 50%, #f0fdf4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}
.input-field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  padding: 0.55rem 0.85rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  background: #fff;
}
.input-field:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52,211,153,0.15);
}
`;

/* ── Loading skeleton ── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-[#F7FAF7]">
      <style>{STYLE}</style>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="h-32 rounded-3xl shimmer-bg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl shimmer-bg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Read-only info chip ── */
function InfoChip({ label, value }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-4 hover:border-emerald-200 hover:shadow-sm transition-all duration-200">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-700 break-all">{value || "—"}</p>
    </div>
  );
}

/* ── Editable input card ── */
function FieldCard({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 hover:border-emerald-200 hover:shadow-sm transition-all duration-200">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

/* ── Section heading ── */
function SectionHeading({ icon, title, delayClass }) {
  return (
    <div className={`flex items-center gap-2 mb-4 fade-up ${delayClass}`}>
      <span className="text-lg">{icon}</span>
      <h2 className="text-base font-bold text-gray-800 tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-gray-100 ml-2" />
    </div>
  );
}

/* ── Avatar initials bubble ── */
function AvatarBubble({ email, name }) {
  const initials = (name || email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 flex-shrink-0">
      <span className="text-white text-xl font-black">{initials}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      setLoading(true);
      setError("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      if (active) { setUserId(user.id); setUserEmail(user.email || ""); }

      const [profileResp, detailsResp] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_details").select("*").eq("id", user.id).maybeSingle(),
      ]);

      if (!profileResp.data)  await supabase.from("profiles").upsert({ id: user.id, email: user.email });
      if (!detailsResp.data)  await supabase.from("user_details").upsert({ id: user.id });

      const [rp, rd] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_details").select("*").eq("id", user.id).maybeSingle(),
      ]);

      if (active) {
        const p = rp.data || null;
        const d = rd.data || null;
        setProfile(p); setDetails(d);
        setFullName(p?.full_name || "");
        setAvatarUrl(p?.avatar_url || "");
        setPhone(d?.phone || ""); setGender(d?.gender || "");
        setDateOfBirth(d?.date_of_birth || ""); setAddress(d?.address || "");
        setCity(d?.city || ""); setStateName(d?.state || "");
        setCountry(d?.country || ""); setPincode(d?.pincode || "");
        setOccupation(d?.occupation || ""); setCompany(d?.company || "");
        setExperience(d?.experience || ""); setBio(d?.bio || "");
        setWebsite(d?.website || "");
        setLoading(false);
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [router]);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      if (!userId) throw new Error("User session not found");
      const { error: pErr } = await supabase.from("profiles").upsert({
        id: userId, email: userEmail,
        full_name: fullName || null, avatar_url: avatarUrl || null,
      });
      if (pErr) throw new Error(`Profile update failed: ${pErr.message}`);

      const { error: dErr } = await supabase.from("user_details").upsert({
        id: userId, phone: phone || null, gender: gender || null,
        date_of_birth: dateOfBirth || null, address: address || null,
        city: city || null, state: stateName || null, country: country || null,
        pincode: pincode || null, occupation: occupation || null,
        company: company || null, experience: experience || null,
        bio: bio || null, website: website || null,
        updated_at: new Date().toISOString(),
      });
      if (dErr) throw new Error(`Details update failed: ${dErr.message}`);

      setProfile((prev) => ({ ...(prev || {}), id: userId, email: userEmail, full_name: fullName || null, avatar_url: avatarUrl || null }));
      setDetails((prev) => ({ ...(prev || {}), id: userId, phone: phone || null, updated_at: new Date().toISOString() }));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-[#F7FAF7]">
      <style>{STYLE}</style>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Hero header card ── */}
        <div className="fade-up fade-up-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <AvatarBubble email={userEmail} name={fullName} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {fullName || "Your Profile"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{userEmail}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active account
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2 sm:ml-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="relative overflow-hidden rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-bold px-6 py-2.5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving…
                </span>
              ) : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="fade-up rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="fade-up rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3.5 text-sm font-medium flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* ── Basic Profile ── */}
        <div className="fade-up fade-up-2">
          <SectionHeading icon="👤" title="Basic Profile" delayClass="fade-up-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoChip label="User ID" value={profile?.id ? `${profile.id.slice(0, 8)}…` : ""} />
            <InfoChip label="Email" value={profile?.email || userEmail} />
            <InfoChip label="Member Since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""} />
            <FieldCard label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
            <FieldCard label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" />
          </div>
        </div>

        {/* ── Personal Details ── */}
        <div className="fade-up fade-up-3">
          <SectionHeading icon="🪪" title="Personal Details" delayClass="fade-up-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FieldCard label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            <FieldCard label="Gender" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Male / Female / Other" />
            <FieldCard label="Date of Birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" />
            <FieldCard label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio about you" />
            <FieldCard label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
          </div>
        </div>

        {/* ── Address ── */}
        <div className="fade-up fade-up-4">
          <SectionHeading icon="📍" title="Address" delayClass="fade-up-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <FieldCard label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street / Area / Locality" />
            </div>
            <FieldCard label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <FieldCard label="State" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State" />
            <FieldCard label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
            <FieldCard label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" />
          </div>
        </div>

        {/* ── Occupation ── */}
        <div className="fade-up fade-up-5">
          <SectionHeading icon="💼" title="Occupation" delayClass="fade-up-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FieldCard label="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Your occupation" />
            <FieldCard label="Company / Organisation" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
            <FieldCard label="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5 years" />
            <InfoChip label="Last Updated" value={details?.updated_at ? new Date(details.updated_at).toLocaleString("en-IN") : "—"} />
          </div>
        </div>

        {/* ── Save button (bottom) ── */}
        <div className="fade-up fade-up-5 flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-bold px-8 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98]"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}