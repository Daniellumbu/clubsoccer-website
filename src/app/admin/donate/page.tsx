"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getDonateContent,
  saveDonateContent,
  DEFAULT_DONATE,
  type DonateContent,
} from "@/lib/firebase";

export default function AdminDonatePage() {
  const [form, setForm] = useState<DonateContent>(DEFAULT_DONATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDonateContent()
      .then((data) => { setForm(data); setLoading(false); })
      .catch((err) => { setError((err as Error).message); setLoading(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await saveDonateContent(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function setDonateUrl(value: string) {
    setForm((f) => ({ ...f, donateUrl: value }));
  }
  function setHero(field: keyof DonateContent["hero"], value: string) {
    setForm((f) => ({ ...f, hero: { ...f.hero, [field]: value } }));
  }
  function setAbout(field: keyof DonateContent["about"], value: string) {
    setForm((f) => ({ ...f, about: { ...f.about, [field]: value } }));
  }
  function setUsesSection(field: "sectionHeading", value: string) {
    setForm((f) => ({ ...f, uses: { ...f.uses, [field]: value } }));
  }
  function setUseItem(index: number, field: "icon" | "title" | "description", value: string) {
    setForm((f) => {
      const items = f.uses.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...f, uses: { ...f.uses, items } };
    });
  }
  function addUseItem() {
    setForm((f) => ({
      ...f,
      uses: { ...f.uses, items: [...f.uses.items, { icon: "", title: "", description: "" }] },
    }));
  }
  function removeUseItem(index: number) {
    setForm((f) => ({ ...f, uses: { ...f.uses, items: f.uses.items.filter((_, i) => i !== index) } }));
  }
  function setImpact(field: "heading" | "description" | "buttonText", value: string) {
    setForm((f) => ({ ...f, impact: { ...f.impact, [field]: value } }));
  }
  function setImpactTier(index: number, field: "amount" | "impact", value: string) {
    setForm((f) => {
      const tiers = f.impact.tiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      );
      return { ...f, impact: { ...f.impact, tiers } };
    });
  }
  function addImpactTier() {
    setForm((f) => ({
      ...f,
      impact: { ...f.impact, tiers: [...f.impact.tiers, { amount: "", impact: "" }] },
    }));
  }
  function removeImpactTier(index: number) {
    setForm((f) => ({
      ...f,
      impact: { ...f.impact, tiers: f.impact.tiers.filter((_, i) => i !== index) },
    }));
  }
  function setQuestions(field: keyof DonateContent["questions"], value: string) {
    setForm((f) => ({ ...f, questions: { ...f.questions, [field]: value } }));
  }

  const inputCls =
    "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue w-full";
  const textareaCls = inputCls + " resize-none";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {saving && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex items-center gap-3 min-w-[200px]">
            <div className="w-5 h-5 border-2 border-carleton-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700">Saving…</p>
          </div>
        </div>
      )}

      <Link
        href="/admin"
        className="text-sm text-gray-400 hover:text-carleton-blue transition-colors mb-6 inline-block"
      >
        ← Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Donate Page</h1>
        <div className="flex items-center gap-3">
          {saved && <p className="text-sm text-green-600 font-medium">Saved!</p>}
          <button
            form="donate-form"
            type="submit"
            disabled={saving}
            className="bg-carleton-blue text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Save All
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      <form id="donate-form" onSubmit={handleSave} className="space-y-10">
        {/* Donate URL */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Donate Link
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Donate URL</label>
              <input
                value={form.donateUrl}
                onChange={(e) => setDonateUrl(e.target.value)}
                className={inputCls}
                placeholder="https://givebutter.com/your-campaign"
              />
              <p className="text-xs text-gray-400 mt-1">
                Paste your Givebutter campaign link here once it&apos;s set up at givebutter.com — it supports card, Apple Pay, PayPal, and Venmo.
              </p>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Hero
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <input
                value={form.hero.label}
                onChange={(e) => setHero("label", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Headline</label>
              <input
                value={form.hero.headline}
                onChange={(e) => setHero("headline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.hero.description}
                onChange={(e) => setHero("description", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Button Text</label>
              <input
                value={form.hero.buttonText}
                onChange={(e) => setHero("buttonText", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* About the Fund */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            About the Fund
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Heading</label>
              <input
                value={form.about.heading}
                onChange={(e) => setAbout("heading", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Paragraph 1</label>
              <textarea
                rows={3}
                value={form.about.paragraph1}
                onChange={(e) => setAbout("paragraph1", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Paragraph 2</label>
              <textarea
                rows={3}
                value={form.about.paragraph2}
                onChange={(e) => setAbout("paragraph2", e.target.value)}
                className={textareaCls}
              />
            </div>
          </div>
        </section>

        {/* Where Your Money Goes */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Where Your Money Goes
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Section Heading</label>
              <input
                value={form.uses.sectionHeading}
                onChange={(e) => setUsesSection("sectionHeading", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-3 pt-1">
              {form.uses.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-carleton-blue uppercase tracking-wider">
                      Item {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeUseItem(i)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon</label>
                      <input
                        value={item.icon}
                        onChange={(e) => setUseItem(i, "icon", e.target.value)}
                        className={inputCls}
                        placeholder="⚽"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Title</label>
                      <input
                        value={item.title}
                        onChange={(e) => setUseItem(i, "title", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => setUseItem(i, "description", e.target.value)}
                      className={textareaCls}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addUseItem}
                className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-400 hover:text-carleton-blue hover:border-carleton-blue transition-colors"
              >
                + Add Item
              </button>
            </div>
          </div>
        </section>

        {/* Impact banner */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Impact Banner
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Heading</label>
              <input
                value={form.impact.heading}
                onChange={(e) => setImpact("heading", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.impact.description}
                onChange={(e) => setImpact("description", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Button Text</label>
              <input
                value={form.impact.buttonText}
                onChange={(e) => setImpact("buttonText", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-3 pt-1">
              {form.impact.tiers.map((tier, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-carleton-blue uppercase tracking-wider">
                      Tier {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImpactTier(i)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount</label>
                      <input
                        value={tier.amount}
                        onChange={(e) => setImpactTier(i, "amount", e.target.value)}
                        className={inputCls}
                        placeholder="$25"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Impact</label>
                      <input
                        value={tier.impact}
                        onChange={(e) => setImpactTier(i, "impact", e.target.value)}
                        className={inputCls}
                        placeholder="covers a match ball for a full practice"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addImpactTier}
                className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-400 hover:text-carleton-blue hover:border-carleton-blue transition-colors"
              >
                + Add Tier
              </button>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Questions
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Heading</label>
              <input
                value={form.questions.heading}
                onChange={(e) => setQuestions("heading", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.questions.description}
                onChange={(e) => setQuestions("description", e.target.value)}
                className={textareaCls}
              />
            </div>
          </div>
        </section>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-carleton-blue text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Save All
          </button>
          {saved && <p className="text-sm text-green-600 font-medium">Saved!</p>}
        </div>
      </form>
    </div>
  );
}
