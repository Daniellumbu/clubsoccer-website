"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSchools, saveSchool, deleteSchool, uploadSchoolLogo } from "@/lib/firebase";
import { HOME_LOCATION, type School } from "@/lib/schools";
import { ImageCropper } from "@/components/ui/ImageCropper";

const emptyForm = { name: "", location: "" };

const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue w-full";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editLogoBlob, setEditLogoBlob] = useState<Blob | null>(null);
  const [editPreview, setEditPreview] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addLogoBlob, setAddLogoBlob] = useState<Blob | null>(null);
  const [addPreview, setAddPreview] = useState<string>("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cropForRef = useRef<"add" | "edit">("add");
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSchools(await getSchools());
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(school: School) {
    setEditingId(school.id);
    setEditForm({ name: school.name, location: school.location });
    setEditLogoBlob(null);
    setEditPreview(school.logo || "");
    setShowAdd(false);
  }

  function openCropper(file: File, target: "add" | "edit") {
    cropForRef.current = target;
    setCropSrc(URL.createObjectURL(file));
  }

  function handleCropDone(blob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    const url = URL.createObjectURL(blob);
    if (cropForRef.current === "add") {
      if (addPreview.startsWith("blob:")) URL.revokeObjectURL(addPreview);
      setAddLogoBlob(blob);
      setAddPreview(url);
    } else {
      if (editPreview.startsWith("blob:")) URL.revokeObjectURL(editPreview);
      setEditLogoBlob(blob);
      setEditPreview(url);
    }
    setCropSrc(null);
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
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
      let logo = editPreview;
      if (editLogoBlob) logo = await uploadSchoolLogo(editLogoBlob, "logo.jpg");
      await saveSchool(editingId, { name: editForm.name, location: editForm.location, logo });
      setEditingId(null);
      setEditLogoBlob(null);
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
      let logo = "";
      if (addLogoBlob) logo = await uploadSchoolLogo(addLogoBlob, "logo.jpg");
      await saveSchool(null, { name: addForm.name, location: addForm.location, logo });
      setShowAdd(false);
      setAddForm(emptyForm);
      setAddLogoBlob(null);
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
    if (!confirm(`Remove ${name}? Games already scheduled against them will keep their name but lose the logo.`)) return;
    try {
      await deleteSchool(id);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {saving && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center gap-4 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-carleton-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Saving…</p>
            </div>
          </div>
        </div>
      )}

      {cropSrc && <ImageCropper src={cropSrc} onDone={handleCropDone} onCancel={handleCropCancel} />}

      <Link href="/admin" className="text-sm text-gray-400 hover:text-carleton-blue transition-colors mb-6 inline-block">
        ← Admin
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-4xl font-bold text-gray-900">Schools</h1>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}
          className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add School
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Opponents used for logos and location autofill when scheduling games. Adding a school here makes it selectable in the Schedule tab.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={inputCls} placeholder="Winona State University" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input required value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} className={inputCls} placeholder="Winona State University, Winona MN" />
            <p className="text-xs text-gray-400 mt-1">Used to fill in the location when this school is picked as an away opponent. Home games always use {HOME_LOCATION}.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Logo (optional)</label>
            <div className="flex items-center gap-3">
              {addPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={addPreview} alt="preview" className="w-12 h-12 object-contain flex-shrink-0" />
              )}
              <input
                ref={addFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) openCropper(f, "add"); }}
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-carleton-blue file:text-white hover:file:opacity-90"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? "Saving…" : "Add School"}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setAddForm(emptyForm); setAddPreview(""); setAddLogoBlob(null); }} className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!loading && schools.length === 0 && !showAdd && (
        <p className="text-gray-400 text-sm">No schools yet. Add one above.</p>
      )}

      {!loading && schools.length > 0 && (
        <div className="space-y-3">
          {schools.map((school) => {
            if (editingId === school.id) {
              return (
                <form key={school.id} onSubmit={handleUpdate} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                    <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <input required value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Logo</label>
                    <div className="flex items-center gap-3">
                      {editPreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editPreview} alt="preview" className="w-12 h-12 object-contain flex-shrink-0" />
                      )}
                      <input
                        ref={editFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) openCropper(f, "edit"); }}
                        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-carleton-blue file:text-white hover:file:opacity-90"
                      />
                    </div>
                    {editPreview && (
                      <button type="button" onClick={() => { setEditPreview(""); setEditLogoBlob(null); if (editFileRef.current) editFileRef.current.value = ""; }} className="mt-1 text-xs text-red-400 hover:text-red-600">
                        Remove logo
                      </button>
                    )}
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div key={school.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {school.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={school.logo} alt={school.name} className="w-9 h-9 object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-bold">
                      {school.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{school.name}</p>
                    <p className="text-xs text-gray-400 truncate">{school.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => startEdit(school)} className="text-sm text-carleton-blue hover:opacity-70 transition-opacity">Edit</button>
                  <button onClick={() => handleDelete(school.id, school.name)} className="text-sm text-red-400 hover:text-red-600 transition-colors">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
