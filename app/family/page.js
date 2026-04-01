"use client";

import { useMemo, useState } from "react";

const initialMembers = [
  {
    id: 1,
    name: "Priya",
    relation: "Daughter",
    status: "Online",
    avatar: "👩",
    phone: "+91 98765 43210",
    checkedIn: true,
    color: "emerald",
  },
  {
    id: 2,
    name: "Rahul",
    relation: "Son",
    status: "Away",
    avatar: "👨",
    phone: "+91 98765 43211",
    checkedIn: false,
    color: "blue",
  },
  {
    id: 3,
    name: "Meera",
    relation: "Granddaughter",
    status: "Online",
    avatar: "👧",
    phone: "+91 98765 43212",
    checkedIn: true,
    color: "pink",
  },
  {
    id: 4,
    name: "Dr. Sharma",
    relation: "Doctor",
    status: "Available",
    avatar: "🩺",
    phone: "+91 98765 43213",
    checkedIn: false,
    color: "violet",
  },
];

const initialActivity = [
  {
    id: 1,
    icon: "💚",
    text: "Priya checked your health report",
    time: "10:30 AM",
  },
  {
    id: 2,
    icon: "⏰",
    text: "Rahul added an evening medicine reminder",
    time: "9:15 AM",
  },
  {
    id: 3,
    icon: "📞",
    text: "Meera called you this morning",
    time: "8:45 AM",
  },
  {
    id: 4,
    icon: "📋",
    text: "Dr. Sharma reviewed your blood pressure trend",
    time: "Yesterday",
  },
];

function getStatusStyles(status) {
  switch (status) {
    case "Online":
      return {
        dot: "bg-emerald-400",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
      };
    case "Away":
      return {
        dot: "bg-amber-400",
        text: "text-amber-700",
        bg: "bg-amber-50",
      };
    case "Available":
      return {
        dot: "bg-blue-400",
        text: "text-blue-700",
        bg: "bg-blue-50",
      };
    default:
      return {
        dot: "bg-gray-300",
        text: "text-gray-600",
        bg: "bg-gray-50",
      };
  }
}

function getCardAccent(color) {
  switch (color) {
    case "emerald":
      return "from-emerald-50 to-white border-emerald-100";
    case "blue":
      return "from-blue-50 to-white border-blue-100";
    case "pink":
      return "from-pink-50 to-white border-pink-100";
    case "violet":
      return "from-violet-50 to-white border-violet-100";
    default:
      return "from-gray-50 to-white border-gray-100";
  }
}

function getAvatarByRelation(relation) {
  const r = relation.toLowerCase();
  if (r.includes("daughter")) return "👩";
  if (r.includes("son")) return "👨";
  if (r.includes("granddaughter")) return "👧";
  if (r.includes("grandson")) return "👦";
  if (r.includes("wife")) return "👵";
  if (r.includes("husband")) return "👴";
  if (r.includes("doctor")) return "🩺";
  if (r.includes("caregiver")) return "🧑‍⚕️";
  return "🙂";
}

function callNumber(phone) {
  if (typeof window !== "undefined") {
    window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
  }
}

function messageNumber(phone) {
  if (typeof window !== "undefined") {
    window.location.href = `sms:${phone.replace(/\s+/g, "")}`;
  }
}

function whatsappNumber(phone, name) {
  if (typeof window !== "undefined") {
    const clean = phone.replace(/[^\d]/g, "");
    const message = encodeURIComponent(`Hello ${name}, this is a message from TulsiRaksha AI.`);
    window.open(`https://wa.me/${clean}?text=${message}`, "_blank");
  }
}

function ActivityItem({ item }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
      <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-gray-800 leading-relaxed">
          {item.text}
        </p>
        <p className="text-sm text-gray-400 mt-1 font-medium">{item.time}</p>
      </div>
    </div>
  );
}

function FamilyMemberCard({
  member,
  onCall,
  onMessage,
  onWhatsApp,
  onEdit,
  onDelete,
}) {
  const statusStyle = getStatusStyles(member.status);

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br ${getCardAccent(
        member.color
      )} p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-100`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
            {member.avatar}
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {member.name}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">
              {member.relation}
            </p>

            <div
              className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full ${statusStyle.bg}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
              <span className={`text-sm font-semibold ${statusStyle.text}`}>
                {member.status}
              </span>
            </div>
          </div>
        </div>

        {member.checkedIn && (
          <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold whitespace-nowrap">
            Checked in today
          </div>
        )}
      </div>

      <div className="mt-5 p-4 rounded-2xl bg-white/80 border border-gray-100">
        <p className="text-sm text-gray-400 font-medium">Phone</p>
        <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1">
          {member.phone}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => onCall(member)}
          className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm sm:text-base transition-colors"
        >
          📞 Call
        </button>
        <button
          onClick={() => onMessage(member)}
          className="h-12 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm sm:text-base transition-colors"
        >
          💬 Message
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <button
          onClick={() => onWhatsApp(member)}
          className="h-11 rounded-2xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold text-sm transition-colors"
        >
          WhatsApp
        </button>
        <button
          onClick={() => onEdit(member)}
          className="h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-sm transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(member)}
          className="h-11 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function MemberForm({
  title,
  values,
  setValues,
  onSave,
  onCancel,
  buttonLabel = "Save",
}) {
  return (
    <div className="rounded-[2rem] bg-white border border-emerald-100 shadow-xl shadow-emerald-100/40 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Fill the details below
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Name
          </label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:bg-white outline-none"
            placeholder="Enter name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Relation
          </label>
          <input
            type="text"
            value={values.relation}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, relation: e.target.value }))
            }
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:bg-white outline-none"
            placeholder="e.g. Daughter"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={values.phone}
            onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:border-emerald-400 focus:bg-white outline-none"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSave}
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200/50 transition-colors"
        >
          {buttonLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const [members, setMembers] = useState(initialMembers);
  const [activities, setActivities] = useState(initialActivity);
  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);

  const [formValues, setFormValues] = useState({
    name: "",
    relation: "",
    phone: "",
  });

  const checkedInCount = useMemo(
    () => members.filter((m) => m.checkedIn).length,
    [members]
  );

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.relation.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q)
    );
  }, [members, search]);

  function resetForm() {
    setFormValues({
      name: "",
      relation: "",
      phone: "",
    });
    setShowAddForm(false);
    setEditingMemberId(null);
  }

  function handleAddMember() {
    if (!formValues.name.trim() || !formValues.relation.trim() || !formValues.phone.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const newMember = {
      id: Date.now(),
      name: formValues.name.trim(),
      relation: formValues.relation.trim(),
      phone: formValues.phone.trim(),
      avatar: getAvatarByRelation(formValues.relation),
      status: "Online",
      checkedIn: false,
      color: "emerald",
    };

    setMembers((prev) => [...prev, newMember]);
    setActivities((prev) => [
      {
        id: Date.now() + 1,
        icon: "👥",
        text: `${newMember.name} was added to your family circle`,
        time: "Just now",
      },
      ...prev,
    ]);

    resetForm();
  }

  function handleStartEdit(member) {
    setEditingMemberId(member.id);
    setShowAddForm(false);
    setFormValues({
      name: member.name,
      relation: member.relation,
      phone: member.phone,
    });
  }

  function handleSaveEdit() {
    if (!formValues.name.trim() || !formValues.relation.trim() || !formValues.phone.trim()) {
      alert("Please fill all fields.");
      return;
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.id === editingMemberId
          ? {
              ...m,
              name: formValues.name.trim(),
              relation: formValues.relation.trim(),
              phone: formValues.phone.trim(),
              avatar: getAvatarByRelation(formValues.relation),
            }
          : m
      )
    );

    setActivities((prev) => [
      {
        id: Date.now(),
        icon: "✏️",
        text: `${formValues.name} details were updated`,
        time: "Just now",
      },
      ...prev,
    ]);

    resetForm();
  }

  function handleDelete(member) {
    const ok = confirm(`Remove ${member.name} from family members?`);
    if (!ok) return;

    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    setActivities((prev) => [
      {
        id: Date.now(),
        icon: "🗑️",
        text: `${member.name} was removed from your family circle`,
        time: "Just now",
      },
      ...prev,
    ]);
  }

  function handleCall(member) {
    alert(`Calling ${member.name} (${member.relation})`);
    callNumber(member.phone);
  }

  function handleMessage(member) {
    alert(`Opening messages for ${member.name}`);
    messageNumber(member.phone);
  }

  function handleWhatsApp(member) {
    alert(`Opening WhatsApp for ${member.name}`);
    whatsappNumber(member.phone, member.name);
  }

  function handlePrimaryCaregiverCall() {
    const priya = members.find((m) => m.name.toLowerCase().includes("priya"));
    if (priya) {
      alert(`Calling ${priya.name}`);
      callNumber(priya.phone);
    } else {
      alert("Primary caregiver not found.");
    }
  }

  function handleDoctorCall() {
    const doctor = members.find((m) =>
      m.relation.toLowerCase().includes("doctor")
    );
    if (doctor) {
      alert(`Calling ${doctor.name}`);
      callNumber(doctor.phone);
    } else {
      alert("Doctor contact not found.");
    }
  }

  function handleSendUpdate() {
    alert('Health update sent to family: "I am okay 💚"');
  }

  return (
    <main className="min-h-screen bg-[#fafbfd] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-emerald-50/70 to-transparent blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-50/60 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <p className="text-sm sm:text-base text-emerald-600 font-semibold mb-3">
              Stay connected with the people who care for you
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Family
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed">
              Your loved ones, caregivers, and doctor — all in one calm and caring space.
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-[2rem] bg-white/90 backdrop-blur-xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6 sm:p-8 mb-8 sm:mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-400 font-semibold">
                  Family Circle
                </p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                  You are connected with {members.length} loved ones
                </h2>
                <p className="mt-3 text-lg text-gray-500 leading-relaxed max-w-2xl">
                  {checkedInCount} family member
                  {checkedInCount > 1 ? "s have" : " has"} checked in today.
                  You are supported, cared for, and never alone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5 text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-emerald-700">
                    {members.length}
                  </p>
                  <p className="text-sm sm:text-base text-emerald-600 font-semibold mt-2">
                    Connected
                  </p>
                </div>
                <div className="rounded-3xl bg-blue-50 border border-blue-100 p-5 text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-blue-700">
                    {checkedInCount}
                  </p>
                  <p className="text-sm sm:text-base text-blue-600 font-semibold mt-2">
                    Checked In
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <section className="mb-10">
            <div className="flex flex-col gap-4 mb-5 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Family Members
                </h2>

                <button
                  onClick={() => {
                    setEditingMemberId(null);
                    setShowAddForm((prev) => !prev);
                    setFormValues({ name: "", relation: "", phone: "" });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200/50 font-semibold transition-all duration-200 w-full sm:w-auto"
                >
                  + Add Member
                </button>
              </div>

              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search by name, relation, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white focus:border-emerald-400 outline-none text-base"
                />
              </div>
            </div>

            {showAddForm && (
              <div className="mb-6">
                <MemberForm
                  title="Add New Member"
                  values={formValues}
                  setValues={setFormValues}
                  onSave={handleAddMember}
                  onCancel={resetForm}
                  buttonLabel="Add Member"
                />
              </div>
            )}

            {editingMemberId && (
              <div className="mb-6">
                <MemberForm
                  title="Edit Member"
                  values={formValues}
                  setValues={setFormValues}
                  onSave={handleSaveEdit}
                  onCancel={resetForm}
                  buttonLabel="Save Changes"
                />
              </div>
            )}

            {filteredMembers.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">
                <p className="text-lg font-semibold text-gray-600">
                  No family members found
                </p>
                <p className="text-gray-400 mt-2">
                  Try a different search or add a new member.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filteredMembers.map((member) => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    onCall={handleCall}
                    onMessage={handleMessage}
                    onWhatsApp={handleWhatsApp}
                    onEdit={handleStartEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <section className="rounded-[2rem] bg-white border border-gray-100 shadow-lg shadow-gray-100/40 p-6 sm:p-7">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Activity
                </h2>
                <p className="text-sm sm:text-base text-gray-400 mt-1 font-medium">
                  Family updates and check-ins
                </p>
              </div>

              <div className="space-y-2">
                {activities.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white border border-gray-100 shadow-lg shadow-gray-100/40 p-6 sm:p-7">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Emergency Contacts
                </h2>
                <p className="text-sm sm:text-base text-gray-400 mt-1 font-medium">
                  Quick access when you need help
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-red-50 border border-red-100 p-5">
                  <p className="text-sm uppercase tracking-wide text-red-500 font-semibold">
                    Primary Caregiver
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    Priya — Daughter
                  </h3>
                  <p className="text-gray-500 mt-1 font-medium">
                    +91 98765 43210
                  </p>
                  <button
                    onClick={handlePrimaryCaregiverCall}
                    className="mt-4 w-full h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                  >
                    📞 Call Priya
                  </button>
                </div>

                <div className="rounded-3xl bg-violet-50 border border-violet-100 p-5">
                  <p className="text-sm uppercase tracking-wide text-violet-500 font-semibold">
                    Doctor
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    Dr. Sharma
                  </h3>
                  <p className="text-gray-500 mt-1 font-medium">
                    +91 98765 43213
                  </p>
                  <button
                    onClick={handleDoctorCall}
                    className="mt-4 w-full h-12 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white font-semibold transition-colors"
                  >
                    🩺 Call Doctor
                  </button>
                </div>

                <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5">
                  <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">
                    Quick Update
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    Send “I am okay”
                  </h3>
                  <p className="text-gray-500 mt-1 font-medium">
                    Notify family with one tap
                  </p>
                  <button
                    onClick={handleSendUpdate}
                    className="mt-4 w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                  >
                    💚 Send Update
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}