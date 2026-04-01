"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

function InfoRow({ label, value }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-gray-800 font-semibold mt-1 break-words">{value || "-"}</p>
    </div>
  );
}

function ProfileInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl p-4">
      <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300"
      />
    </div>
  );
}

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
  const [state, setState] = useState("");
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (active) {
        setUserId(user.id);
        setUserEmail(user.email || "");
      }

      const [profileResp, detailsResp] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_details").select("*").eq("id", user.id).maybeSingle(),
      ]);

      if (profileResp.error && active) {
        setError(`Profiles read failed: ${profileResp.error.message}`);
      }

      if (detailsResp.error && active) {
        setError((prev) => prev || `User details read failed: ${detailsResp.error.message}`);
      }

      // Best-effort bootstrap if row does not exist yet
      if (!profileResp.data) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
        });
      }

      if (!detailsResp.data) {
        await supabase.from("user_details").upsert({ id: user.id });
      }

      const refreshedProfile = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      const refreshedDetails = await supabase
        .from("user_details")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (active) {
        const profileData = refreshedProfile.data || null;
        const detailsData = refreshedDetails.data || null;

        setProfile(profileData);
        setDetails(detailsData);

        setFullName(profileData?.full_name || "");
        setAvatarUrl(profileData?.avatar_url || "");

        setPhone(detailsData?.phone || "");
        setGender(detailsData?.gender || "");
        setDateOfBirth(detailsData?.date_of_birth || "");
        setAddress(detailsData?.address || "");
        setCity(detailsData?.city || "");
        setState(detailsData?.state || "");
        setCountry(detailsData?.country || "");
        setPincode(detailsData?.pincode || "");
        setOccupation(detailsData?.occupation || "");
        setCompany(detailsData?.company || "");
        setExperience(detailsData?.experience || "");
        setBio(detailsData?.bio || "");
        setWebsite(detailsData?.website || "");

        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!userId) throw new Error("User session not found");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email: userEmail,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
      });

      if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);

      const { error: detailsError } = await supabase.from("user_details").upsert({
        id: userId,
        phone: phone || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        pincode: pincode || null,
        occupation: occupation || null,
        company: company || null,
        experience: experience || null,
        bio: bio || null,
        website: website || null,
        updated_at: new Date().toISOString(),
      });

      if (detailsError) throw new Error(`Details update failed: ${detailsError.message}`);

      setProfile((prev) => ({
        ...(prev || {}),
        id: userId,
        email: userEmail,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
      }));

      setDetails((prev) => ({
        ...(prev || {}),
        id: userId,
        phone: phone || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        pincode: pincode || null,
        occupation: occupation || null,
        company: company || null,
        experience: experience || null,
        bio: bio || null,
        website: website || null,
        updated_at: new Date().toISOString(),
      }));

      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center">
        <div className="text-gray-600 font-semibold">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAF5]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white border border-emerald-100 rounded-3xl shadow-sm p-6 sm:p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
          <p className="text-gray-600 mt-2">Logged in as {userEmail}</p>
          <div className="mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold px-5 py-2.5 transition"
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoRow label="ID" value={profile?.id} />
            <InfoRow label="Email" value={profile?.email || userEmail} />
            <ProfileInput
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
            />
            <ProfileInput
              label="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <InfoRow label="Created At" value={profile?.created_at} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProfileInput
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
            />
            <ProfileInput
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="Male / Female / Other"
            />
            <ProfileInput
              label="Date of Birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              type="date"
            />
            <ProfileInput
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, area"
            />
            <ProfileInput
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
            <ProfileInput
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
            />
            <ProfileInput
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
            />
            <ProfileInput
              label="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
            />
            <ProfileInput
              label="Occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Occupation"
            />
            <ProfileInput
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
            />
            <ProfileInput
              label="Experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Experience"
            />
            <ProfileInput
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio"
            />
            <ProfileInput
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
            <InfoRow label="Updated At" value={details?.updated_at} />
          </div>
        </section>
      </main>
    </div>
  );
}
