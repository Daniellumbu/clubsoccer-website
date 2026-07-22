"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDonateContent, DEFAULT_DONATE, type DonateContent } from "@/lib/firebase";

export default function DonatePage() {
  const [content, setContent] = useState<DonateContent>(DEFAULT_DONATE);

  useEffect(() => {
    getDonateContent().then(setContent).catch(() => {});
  }, []);

  const { donateUrl, hero, about, uses, impact, questions } = content;

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="/backgroungImage1.JPG"
          alt="Carleton Club Soccer team"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-carleton-blue/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-carleton-maize mb-3">
            {hero.label}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            {hero.headline}
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            {hero.description}
          </p>
          <a
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-carleton-maize text-carleton-blue font-bold px-8 py-4 rounded-full text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            {hero.buttonText}
          </a>
        </div>
      </section>

      {/* About the Fund */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {about.heading}
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            {about.paragraph1}
          </p>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto mt-4">
            {about.paragraph2}
          </p>
        </div>

        {/* How funds are used */}
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {uses.sectionHeading}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {uses.items.map(({ icon, title, description }) => (
            <div
              key={title}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-3 block">{icon}</span>
              <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact banner */}
      <section className="bg-carleton-blue text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">{impact.heading}</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">{impact.description}</p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10 text-center">
            {impact.tiers.map(({ amount, impact: tierImpact }) => (
              <div key={amount} className="bg-white/10 rounded-2xl px-6 py-5">
                <p className="text-3xl font-extrabold text-carleton-maize mb-1">{amount}</p>
                <p className="text-sm text-white/80">{tierImpact}</p>
              </div>
            ))}
          </div>
          <a
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-carleton-maize text-carleton-blue font-bold px-8 py-4 rounded-full text-base hover:opacity-90 transition-opacity"
          >
            {impact.buttonText}
          </a>
        </div>
      </section>

      {/* Questions */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{questions.heading}</h2>
        <p className="text-gray-500 mb-4">{questions.description}</p>
        <Link
          href="/contact"
          className="inline-block border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Contact Us
        </Link>
      </section>
    </div>
  );
}
