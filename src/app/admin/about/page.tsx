"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAboutContent,
  saveAboutContent,
  DEFAULT_ABOUT,
  type AboutContent,
} from "@/lib/firebase";

export default function AdminAboutPage() {
  const [form, setForm] = useState<AboutContent>(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAboutContent()
      .then((data) => { setForm(data); setLoading(false); })
      .catch((err) => { setError((err as Error).message); setLoading(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await saveAboutContent(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function setHero(field: keyof AboutContent["hero"], value: string) {
    setForm((f) => ({ ...f, hero: { ...f.hero, [field]: value } }));
  }
  function setStory(field: keyof AboutContent["story"], value: string) {
    setForm((f) => ({ ...f, story: { ...f.story, [field]: value } }));
  }
  function setValuesSection(field: "sectionLabel" | "sectionHeading", value: string) {
    setForm((f) => ({ ...f, values: { ...f.values, [field]: value } }));
  }
  function setValueItem(index: number, field: "title" | "description", value: string) {
    setForm((f) => {
      const items = f.values.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...f, values: { ...f.values, items } };
    });
  }
  function setFaqSection(field: "sectionLabel" | "sectionHeading", value: string) {
    setForm((f) => ({ ...f, faq: { ...f.faq, [field]: value } }));
  }
  function setFaqItem(index: number, field: "q" | "a", value: string) {
    setForm((f) => {
      const items = f.faq.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...f, faq: { ...f.faq, items } };
    });
  }
  function addFaqItem() {
    setForm((f) => ({ ...f, faq: { ...f.faq, items: [...f.faq.items, { q: "", a: "" }] } }));
  }
  function removeFaqItem(index: number) {
    setForm((f) => ({ ...f, faq: { ...f.faq, items: f.faq.items.filter((_, i) => i !== index) } }));
  }
  function setCta(field: keyof AboutContent["cta"], value: string) {
    setForm((f) => ({ ...f, cta: { ...f.cta, [field]: value } }));
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
        <h1 className="text-4xl font-bold text-gray-900">About Page</h1>
        <div className="flex items-center gap-3">
          {saved && <p className="text-sm text-green-600 font-medium">Saved!</p>}
          <button
            form="about-form"
            type="submit"
            disabled={saving}
            className="bg-carleton-blue text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Save All
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      <form id="about-form" onSubmit={handleSave} className="space-y-10">
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
          </div>
        </section>

        {/* Our Story */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Our Story
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Section Label</label>
              <input
                value={form.story.label}
                onChange={(e) => setStory("label", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Heading</label>
              <input
                value={form.story.heading}
                onChange={(e) => setStory("heading", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Paragraph 1</label>
              <textarea
                rows={3}
                value={form.story.paragraph1}
                onChange={(e) => setStory("paragraph1", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Paragraph 2</label>
              <textarea
                rows={3}
                value={form.story.paragraph2}
                onChange={(e) => setStory("paragraph2", e.target.value)}
                className={textareaCls}
              />
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Values
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Section Label</label>
                <input
                  value={form.values.sectionLabel}
                  onChange={(e) => setValuesSection("sectionLabel", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Section Heading</label>
                <input
                  value={form.values.sectionHeading}
                  onChange={(e) => setValuesSection("sectionHeading", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-3 pt-1">
              {form.values.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-xl p-3 space-y-2"
                >
                  <span className="text-xs font-semibold text-carleton-blue uppercase tracking-wider">
                    Value {i + 1}
                  </span>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input
                      value={item.title}
                      onChange={(e) => setValueItem(i, "title", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => setValueItem(i, "description", e.target.value)}
                      className={textareaCls}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            FAQ
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Section Label</label>
                <input
                  value={form.faq.sectionLabel}
                  onChange={(e) => setFaqSection("sectionLabel", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Section Heading</label>
                <input
                  value={form.faq.sectionHeading}
                  onChange={(e) => setFaqSection("sectionHeading", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-3 pt-1">
              {form.faq.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-carleton-blue uppercase tracking-wider">
                      Q{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFaqItem(i)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Question</label>
                    <input
                      value={item.q}
                      onChange={(e) => setFaqItem(i, "q", e.target.value)}
                      className={inputCls}
                      placeholder="Question…"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Answer</label>
                    <textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => setFaqItem(i, "a", e.target.value)}
                      className={textareaCls}
                      placeholder="Answer…"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFaqItem}
                className="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-sm text-gray-400 hover:text-carleton-blue hover:border-carleton-blue transition-colors"
              >
                + Add Question
              </button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Call to Action
          </h2>
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Heading</label>
              <input
                value={form.cta.heading}
                onChange={(e) => setCta("heading", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.cta.description}
                onChange={(e) => setCta("description", e.target.value)}
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
