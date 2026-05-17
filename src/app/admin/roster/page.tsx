"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getRosters,
  createSeason,
  addPlayerToRoster,
  updatePlayerInRoster,
  removePlayerFromRoster,
  deleteRoster,
  importRoster,
  uploadPlayerImage,
  type Roster,
  type Player,
} from "@/lib/firebase";
import { ImageCropper } from "@/components/ui/ImageCropper";

const POSITIONS = ["GK", "DEF", "MID", "FWD"];
const YEAR_LABELS: Record<number, string> = { 1: "Freshman", 2: "Sophomore", 3: "Junior", 4: "Senior" };
const emptyForm = { name: "", number: "", position: "MID", imageUrl: "", year: "" };

export default function AdminRosterPage() {
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editImageBlob, setEditImageBlob] = useState<Blob | null>(null);
  const [editPreview, setEditPreview] = useState<string>("");
  const [addForm, setAddForm] = useState(emptyForm);
  const [addImageBlob, setAddImageBlob] = useState<Blob | null>(null);
  const [addPreview, setAddPreview] = useState<string>("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const cropForRef = useRef<"add" | "edit">("add");
  const [newSeason, setNewSeason] = useState("");
  const [showNewSeason, setShowNewSeason] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importFromId, setImportFromId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const data = await getRosters();
    setRosters(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const roster = rosters.find((r) => r.id === selectedId) ?? null;
  const players = roster?.players.slice().sort((a, b) => a.number - b.number) ?? [];

  function startEdit(player: Player) {
    setEditingId(player.id);
    setEditForm({ name: player.name, number: String(player.number), position: player.position, imageUrl: player.imageUrl || "", year: player.year ? String(player.year) : "" });
    setEditImageBlob(null);
    setEditPreview(player.imageUrl || "");
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
    if (!editingId || !selectedId) return;
    setSaving(true);
    setError(null);
    try {
      let imageUrl = editForm.imageUrl || undefined;
      if (editImageBlob) imageUrl = await uploadPlayerImage(editImageBlob, selectedId, "player-photo.jpg");
      const data: Omit<Player, "id"> = {
        name: editForm.name,
        number: Number(editForm.number),
        position: editForm.position,
        imageUrl,
        year: editForm.year ? Number(editForm.year) : undefined,
      };
      await updatePlayerInRoster(selectedId, editingId, data);
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
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      let imageUrl: string | undefined;
      if (addImageBlob) imageUrl = await uploadPlayerImage(addImageBlob, selectedId, "player-photo.jpg");
      const data: Omit<Player, "id"> = {
        name: addForm.name,
        number: Number(addForm.number),
        position: addForm.position,
        imageUrl,
        year: addForm.year ? Number(addForm.year) : undefined,
      };
      await addPlayerToRoster(selectedId, data);
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

  async function handleRemove(playerId: string, name: string) {
    if (!selectedId || !confirm(`Remove ${name}?`)) return;
    try {
      await removePlayerFromRoster(selectedId, playerId);
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  async function handleCreateSeason(e: React.FormEvent) {
    e.preventDefault();
    if (!newSeason.trim()) return;
    setSaving(true);
    try {
      const id = await createSeason(newSeason.trim());
      setNewSeason("");
      setShowNewSeason(false);
      await load();
      setSelectedId(id);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoster() {
    if (!roster || !confirm(`Delete the entire ${roster.season} roster? This cannot be undone.`)) return;
    try {
      await deleteRoster(selectedId);
      const remaining = rosters.filter((r) => r.id !== selectedId);
      setSelectedId(remaining[0]?.id || "");
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importFromId || !newSeason.trim()) return;
    setSaving(true);
    try {
      const id = await importRoster(importFromId, newSeason.trim());
      setNewSeason("");
      setImportFromId("");
      setShowImport(false);
      await load();
      setSelectedId(id);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center gap-4 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-carleton-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Saving…</p>
            </div>
            <button
              onClick={() => setSaving(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image cropper */}
      {cropSrc && <ImageCropper src={cropSrc} onDone={handleCropDone} onCancel={handleCropCancel} />}

      <Link href="/admin" className="text-sm text-gray-400 hover:text-carleton-blue transition-colors mb-6 inline-block">
        ← Admin
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Roster</h1>
        <div className="flex items-center gap-3">
          {rosters.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setEditingId(null); }}
                className={inputCls + " bg-white"}
              >
                {rosters.map((r) => <option key={r.id} value={r.id}>{r.season}</option>)}
              </select>
              <button onClick={handleDeleteRoster} className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm transition-colors">
                Delete
              </button>
            </div>
          )}
          <button onClick={() => { setShowNewSeason(!showNewSeason); setShowImport(false); }} className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            + Season
          </button>
          <button onClick={() => { setShowImport(!showImport); setShowNewSeason(false); }} className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Import Roster
          </button>
        </div>
      </div>

      {showNewSeason && (
        <form onSubmit={handleCreateSeason} className="flex gap-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <input required value={newSeason} onChange={(e) => setNewSeason(e.target.value)} placeholder="2026-2027" className={inputCls + " flex-1"} />
          <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">Create</button>
          <button type="button" onClick={() => setShowNewSeason(false)} className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
        </form>
      )}

      {showImport && (
        <form onSubmit={handleImport} className="flex flex-wrap gap-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <select required value={importFromId} onChange={(e) => setImportFromId(e.target.value)} className={inputCls + " bg-white"}>
            <option value="">Select source roster</option>
            {rosters.map((r) => <option key={r.id} value={r.id}>{r.season}</option>)}
          </select>
          <input required value={newSeason} onChange={(e) => setNewSeason(e.target.value)} placeholder="New season (e.g. 2026-2027)" className={inputCls + " flex-1 min-w-36"} />
          <p className="w-full text-xs text-gray-400">Seniors (Year 4) are dropped; all others are promoted one year.</p>
          <button type="submit" disabled={saving} className="bg-carleton-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">Import</button>
          <button type="button" onClick={() => { setShowImport(false); setImportFromId(""); setNewSeason(""); }} className="border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
        </form>
      )}

      {loading && (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!loading && roster && (
        <>
          <div className="space-y-2 mb-8">
            {players.length === 0 && <p className="text-gray-400 text-sm">No players yet. Add one below.</p>}
            {players.map((player) =>
              editingId === player.id ? (
                <form key={player.id} onSubmit={handleUpdate} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Number</label>
                      <input type="number" required min={1} max={99} value={editForm.number} onChange={(e) => setEditForm({ ...editForm, number: e.target.value })} className={inputCls + " w-full"} placeholder="#" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls + " w-full"} placeholder="Player name" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Position</label>
                      <select value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} className={inputCls + " w-full bg-white"}>
                        {POSITIONS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Year</label>
                      <select value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} className={inputCls + " w-full bg-white"}>
                        <option value="">— optional —</option>
                        <option value="1">Freshman</option>
                        <option value="2">Sophomore</option>
                        <option value="3">Junior</option>
                        <option value="4">Senior</option>
                      </select>
                    </div>
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
                      <button type="button" onClick={() => { setEditPreview(""); setEditImageBlob(null); setEditForm({ ...editForm, imageUrl: "" }); if (editFileRef.current) editFileRef.current.value = ""; }} className="mt-1 text-xs text-red-400 hover:text-red-600">
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
                <div key={player.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {player.imageUrl ? (
                      <img src={player.imageUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <span className="w-10 h-10 flex items-center justify-center rounded-full bg-carleton-blue text-carleton-maize text-xs font-bold flex-shrink-0">{player.number}</span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{player.name} <span className="text-gray-400 font-normal text-sm">#{player.number}</span></p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                        <span className="uppercase tracking-wider">{player.position}</span>
                        {player.year && <span>• {YEAR_LABELS[player.year] ?? `Year ${player.year}`}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => startEdit(player)} className="text-sm text-carleton-blue hover:opacity-70 transition-opacity">Edit</button>
                    <button onClick={() => handleRemove(player.id, player.name)} className="text-sm text-red-400 hover:text-red-600 transition-colors">✕</button>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Add Player</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">#</label>
                  <input type="number" required min={1} max={99} value={addForm.number} onChange={(e) => setAddForm({ ...addForm, number: e.target.value })} className={inputCls + " w-full"} placeholder="10" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={inputCls + " w-full"} placeholder="Player name" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Position</label>
                  <select value={addForm.position} onChange={(e) => setAddForm({ ...addForm, position: e.target.value })} className={inputCls + " w-full bg-white"}>
                    {POSITIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year</label>
                  <select value={addForm.year} onChange={(e) => setAddForm({ ...addForm, year: e.target.value })} className={inputCls + " w-full bg-white"}>
                    <option value="">— optional —</option>
                    <option value="1">Freshman</option>
                    <option value="2">Sophomore</option>
                    <option value="3">Junior</option>
                    <option value="4">Senior</option>
                  </select>
                </div>
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
                Add Player
              </button>
            </form>
          </div>
        </>
      )}

      {!loading && rosters.length === 0 && (
        <p className="text-gray-400 text-sm">No seasons yet. Create one above.</p>
      )}
    </div>
  );
}
