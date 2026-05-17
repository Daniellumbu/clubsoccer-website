"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getCoaches,
  saveCoach,
  deleteCoach,
  uploadCoachPhoto,
  type Coach,
} from "@/lib/firebase";
import { ImageCropper } from "@/components/ui/ImageCropper";

const ROLES = ["Head Coach", "Assistant Coach", "Goalkeeper Coach", "Fitness Coach"];
const emptyForm = { name: "", role: "Head Coach", bio: "", photoUrl: "" };

export default function AdminCoachPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImageBlob, setEditImageBlob] = useState<Blob | null>(null);
  const [editPreview, setEditPreview] = useState<string>("");
  const [addForm, setAddForm] = useState(emptyForm);
  const [addImageBlob, setAddImageBlob] = useState<Blob | null>(null);
  const [addPreview, setAddPreview] = useState<string>("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cropForRef = useRef<"add" | "edit">("add");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const data = await getCoaches();
    setCoaches(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(coach: Coach) {
    setEditingId(coach.id);
    setEditForm({ name: coach.name, role: coach.role, bio: coach.bio ?? "", photoUrl: coach.photoUrl ?? "" });
    setEditImageBlob(null);
    setEditPreview(coach.photoUrl ?? "");
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
      if (editImageBlob) photoUrl = await uploadCoachPhoto(editImageBlob, "coach-photo.jpg");
      await saveCoach(editingId, { name: editForm.name, role: editForm.role, bio: editForm.bio || undefined, photoUrl });
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
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | undefined;
      if (addImageBlob) photoUrl = await uploadCoachPhoto(addImageBlob, "coach-photo.jpg");
      await saveCoach(null, { name: addForm.name, role: addForm.role, bio: addForm.bio || undefined, photoUrl });
      setAddForm(emptyForm);
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

  async function handleDelete(coach: Coach) {
    if (!confirm(`Remove ${coach.name}?`)) return;
    try {
      await deleteCoach(coach.id);
      if (editingId === coach.id) setEditingId(null);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Saving overlay */}
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
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Coaches</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3 mb-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && (
        <>
          <div className="space-y-2 mb-8">
            {coaches.length === 0 && <p className="text-gray-400 text-sm">No coaches yet. Add one below.</p>}
            {coaches.map((coach) =>
              editingId === coach.id ? (
                <form key={coach.id} onSubmit={handleUpdate} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls + " w-full"} placeholder="Coach name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Role</label>
                      <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className={inputCls + " w-full bg-white"}>
                        {ROLES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bio</label>
                    <textarea rows={3} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className={inputCls + " w-full resize-none"} placeholder="Short bio (optional)" />
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
                <div key={coach.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {coach.photoUrl ? (
                      <img src={coach.photoUrl} alt={coach.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <span className="w-10 h-10 flex items-center justify-center rounded-full bg-carleton-blue text-carleton-maize font-bold flex-shrink-0">
                        {coach.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{coach.name}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{coach.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => startEdit(coach)} className="text-sm text-carleton-blue hover:opacity-70 transition-opacity">Edit</button>
                    <button onClick={() => handleDelete(coach)} className="text-sm text-red-400 hover:text-red-600 transition-colors">✕</button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Add Coach</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={inputCls + " w-full"} placeholder="Coach name" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role</label>
                  <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className={inputCls + " w-full bg-white"}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bio</label>
                <textarea rows={3} value={addForm.bio} onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })} className={inputCls + " w-full resize-none"} placeholder="Short bio (optional)" />
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
              <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                Add Coach
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
