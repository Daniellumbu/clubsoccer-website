"use client";

import { useState } from "react";

// Replace INSTAGRAM_URL when ready
const INSTAGRAM_URL = "https://instagram.com/carletonclubsoccer";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function setField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setError("Name, email, and message are required.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  }

  const inputCls =
    "border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carleton-blue w-full";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact</h1>
      <p className="text-gray-500 mb-12">Get in touch with Carleton Club Soccer.</p>

      <div className="grid sm:grid-cols-5 gap-8">
        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="sm:col-span-3 flex flex-col gap-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Message <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              className={inputCls + " resize-none"}
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-2 bg-carleton-blue text-white font-semibold px-6 py-3 rounded-full text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
          {status === "sent" && (
            <p className="text-sm text-green-600 font-medium">
              Thanks! We&apos;ll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}
        </form>

        {/* Instagram card */}
        <div className="sm:col-span-2 flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex flex-col items-center justify-center text-white gap-3">
            <InstagramIcon />
            <p className="text-sm font-medium opacity-80 tracking-wide">Photo coming soon</p>
          </div>
          <div className="p-6 bg-white flex flex-col items-center text-center gap-2">
            <p className="font-semibold text-gray-900">Follow Us</p>
            <p className="text-sm text-gray-500">Stay up to date with match highlights and team news.</p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            >
              <InstagramIcon />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
