"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getLeadership,
  getLeadershipSeasons,
  addLeadershipEntry,
  updateLeadershipEntry,
  deleteLeadershipEntry,
  uploadLeaderPhoto,
  type LeadershipEntry,
} from "@/lib/firebase";
import { ImageCropper } from "@/components/ui/ImageCropper";

const ROLES = [
  "Club President",
  "Club Vice President",
  "Club Treasurer",
  "Captain",
  "Social Captain",
  "Campus OutReach Manager",
];

const ROLE_ORDER = ROLES;

const emptyForm = { name: "", role: ROLES[0], season: "", bio: "", photoUrl: "" };

function roleIndex(role: string) {
  const i = ROLE_ORDER.indexOf(role);
  return i === -1 ? ROLE_ORDER.length : i;
}

export default function AdminLeadersPage() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [entries, setEntries] = useState<LeadershipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImageBlob, setEditImageBlob] = useState<Blob | null>(null);
  const [editPreview, setEditPreview] = useState<string>("");
  const [addForm, setAddForm] = useState(emptyForm);
  const [addImageBlob, setAddImageBlob] = useState<Blob | null>(null);
  const [addPreview, setAddPreview] = useState<string>("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cropForRef = useRef<"add" | "edit">("add");
  const [showNewSeason, setShowNewSeason] = useState(false);
  const [newSeason, setNewSeason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const [s, all] = await Promise.all([getLeadershipSeasons(), getLeadership()]);
    setSeasons(s);
    setEntries(all);
    if (s.length > 0 && !selectedSeason) {
      setSelectedSeason(s[0]);
      setAddForm((f) => ({ ...f, season: s[0] }));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = entries
    .filter((e) => e.season === selectedSeason)
    .sort((a, b) => roleIndex(a.role) - roleIndex(b.role));

  function switchSeason(s: string) {
    setSelectedSeason(s);
    setEditingId(null);
    setAddForm((f) => ({ ...f, season: s }));
  }

  function startEdit(entry: LeadershipEntry) {
    setEditingId(entry.id);
    setEditForm({ name: entry.name, role: entry.role, season: entry.season, bio: entry.bio ?? "", photoUrl: entry.photoUrl ?? "" });
    setEditImageBlob(null);
    setEditPreview(entry.photoUrl ?? "");
  }

  function openCropper(file: File, target: "add" | "edit") {
    cropForRef.current = target;
    setCropSrc(URL.createObjectURL(file));
  }

  function handleCropDone(blob: Blob) {
    const url = URL.createObjectURL(blob);
    if (cropForRef.current === "add") { setAddImageBlob(blob); setAddPreview(url); }
    else { setEditImageBlob(blob); setEditPreview(url); }
    setCropSrc(null);
  }

  function handleCropCancel() {
    if (cropForRef.current === "add" && addFileRef.current) addFileRef.current.value = "";
    if (cropForRef.current === "edit" && editFileRef.current) editFileRef.current.value = "";
    setCropSrc(null);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      let photoUrl = editForm.photoUrl || undefined;
      if (editImageBlob) photoUrl = await uploadLeaderPhoto(editImageBlob, "leader-photo.jpg");
      const data: Omit<LeadershipEntry, "id"> = {
        name: editForm.name,
        role: editForm.role,
        season: editForm.season,
        bio: editForm.bio || undefined,
        photoUrl,
      };
      await updateLeadershipEntry(editingId, data);
      setEditingId(null);
      setEditImageBlob(null);
      setEditPreview("");
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.season) return;
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | undefined;
      if (addImageBlob) photoUrl = await uploadLeaderPhoto(addImageBlob, "leader-photo.jpg");
      const data: Omit<LeadershipEntry, "id"> = {
        name: addForm.name,
        role: addForm.role,
        season: addForm.season,
        bio: addForm.bio || undefined,
        photoUrl,
      };
      await addLeadershipEntry(data);
      setAddForm({ ...emptyForm, season: selectedSeason, role: ROLES[0] });
      setAddImageBlob(null);
      setAddPreview("");
      if (addFileRef.current) addFileRef.current.value = "";
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await deleteLeadershipEntry(id);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  async function handleCreateSeason(e: React.FormEvent) {
    e.preventDefault();
    if (!newSeason.trim()) return;
    const s = newSeason.trim();
    setSeasons((prev) => [s, ...prev]);
    switchSeason(s);
    setNewSeason("");
    setShowNewSeason(false);
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {saving && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center gap-4 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-carleton-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Saving…</p>
            </div>
            <button onClick={() => setSaving(false)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {cropSrc && <ImageCropper src={cropSrc} onDone={handleCropDone} onCancel={handleCropCancel} />}

      <Link href="/admin" className="text-sm text-gray-400 hover:text-carleton-blue transition-colors mb-6 inline-block">
        ← Admin
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Leadership</h1>
        <div className="flex items-center gap-3">
          {seasons.length > 0 && (
            <select
              value={selectedSeason}
              onChange={(e) => switchSeason(e.target.value)}
              className={inputCls + " bg-white"}
            >
              {seasons.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
          <button
            onClick={() => setShowNewSeason(!showNewSeason)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            + Season
          </button>
        </div>
      </div>

      {showNewSeason && (
        <form onSubmit={handleCreateSeason} className="flex gap-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <input
            required
            value={newSeason}
            onChange={(e) => setNewSeason(e.target.value)}
            placeholder="2026-2027"
            className={inputCls + " flex-1"}
          />
          <button type="submit" className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Create</button>
          <button type="button" onClick={() => setShowNewSeason(false)} className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && (
        <>
          <div className="space-y-2 mb-10">
            {visible.length === 0 && (
              <p className="text-gray-400 text-sm">No members listed for this season. Add one below.</p>
            )}
            {visible.map((entry) =>
              editingId === entry.id ? (
                <form key={entry.id} onSubmit={handleUpdate} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls + " w-full"} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Role</label>
                      <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className={inputCls + " w-full bg-white"}>
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bio (optional)</label>
                    <input value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className={inputCls + " w-full"} placeholder="Short bio or note" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Photo</label>
                    <div className="flex items-center gap-3">
                      {editPreview && <img src={editPreview} alt="preview" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />}
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) openCropper(f, "edit"); }}
                        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-carleton-blue file:text-white hover:file:opacity-90"
                      />
                    </div>
                    {editPreview && (
                      <button type="button" onClick={() => { setEditPreview(""); setEditImageBlob(null); setEditForm({ ...editForm, photoUrl: "" }); if (editFileRef.current) editFileRef.current.value = ""; }} className="mt-1 text-xs text-red-400 hover:text-red-600">
                        Remove photo
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">Save</button>
                    <button type="button" onClick={() => { setEditingId(null); setEditImageBlob(null); setEditPreview(""); }} className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
                  </div>
                </form>
              ) : (
                <div key={entry.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt={entry.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <span className="w-10 h-10 flex items-center justify-center rounded-full bg-carleton-blue text-carleton-maize font-bold text-sm flex-shrink-0">
                        {entry.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{entry.name}</p>
                      <p className="text-xs text-carleton-blue font-medium uppercase tracking-wider">{entry.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => startEdit(entry)} className="text-sm text-carleton-blue hover:opacity-70 transition-opacity">Edit</button>
                    <button onClick={() => handleDelete(entry.id, entry.name)} className="text-sm text-red-400 hover:text-red-600 transition-colors">✕</button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Add Member</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={inputCls + " w-full"} placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role</label>
                  <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className={inputCls + " w-full bg-white"}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bio (optional)</label>
                <input value={addForm.bio} onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })} className={inputCls + " w-full"} placeholder="Short bio or note" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  {addPreview && <img src={addPreview} alt="preview" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />}
                  <input
                    ref={addFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) openCropper(f, "add"); }}
                    className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-carleton-blue file:text-white hover:file:opacity-90"
                  />
                </div>
              </div>
              <button type="submit" disabled={saving || !selectedSeason} className="bg-carleton-blue text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                Add Member
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
