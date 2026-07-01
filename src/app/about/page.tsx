"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAboutContent, DEFAULT_ABOUT, type AboutContent } from "@/lib/firebase";

const VALUE_ICONS = [
  <svg key="student-run" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-3.5 2M12 20l3.5-2" />
  </svg>,
  <svg key="competitive" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>,
  <svg key="open" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  <svg key="community" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>,
];

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT);

  useEffect(() => {
    getAboutContent().then(setContent).catch(() => {});
  }, []);

  const { hero, story, values, faq, cta } = content;

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <Image
          src="/backgroundimage2.png"
          alt="Carleton Club Soccer team"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-carleton-blue/75" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-carleton-maize mb-3">
            {hero.label}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-6">
            {hero.headline}
          </h1>
          <p className="text-lg text-white/80 max-w-xl leading-relaxed">
            {hero.description}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-carleton-blue mb-3">{story.label}</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-5 leading-snug">
              {story.heading}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">{story.paragraph1}</p>
            <p className="text-gray-500 leading-relaxed">{story.paragraph2}</p>
          </div>
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/backgroungImage1.JPG"
              alt="Team on the field"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-carleton-blue/10" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-carleton-blue mb-3">{values.sectionLabel}</p>
            <h2 className="text-3xl font-bold text-gray-900">{values.sectionHeading}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.items.map(({ title, description }, i) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-carleton-blue/10 text-carleton-blue flex items-center justify-center mb-4">
                  {VALUE_ICONS[i % VALUE_ICONS.length]}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-carleton-blue mb-3">{faq.sectionLabel}</p>
          <h2 className="text-3xl font-bold text-gray-900">{faq.sectionHeading}</h2>
        </div>
        <div className="space-y-4">
          {faq.items.map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">{q}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-carleton-blue py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{cta.heading}</h2>
          <p className="text-white/75 mb-8 max-w-md mx-auto">{cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-carleton-maize text-carleton-blue font-bold px-8 py-4 rounded-full text-base hover:opacity-90 transition-opacity shadow-lg"
            >
              Get in Touch
            </Link>
            <Link
              href="/donate"
              className="inline-block border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-white/10 transition-colors"
            >
              Support the Club
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
