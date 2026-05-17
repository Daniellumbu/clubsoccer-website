"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/rosters", label: "Roster" },
  { href: "/coaches", label: "Coach" },
  { href: "/leaders", label: "Leadership" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
  { href: "/donate", label: "Donate", highlight: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-carleton-blue text-white shadow-md relative z-50 overflow-visible">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <Image
            src="/images.jpeg"
            alt="Carleton FC Logo"
            width={72}
            height={72}
            priority
            className="drop-shadow-lg translate-y-2"
          />
          <span className="text-xl font-bold tracking-tight">Carleton Club Soccer</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map(({ href, label, highlight }) => (
            <li key={href}>
              {highlight ? (
                <Link
                  href={href}
                  className="bg-carleton-maize text-carleton-blue px-3 py-1.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  {label}
                </Link>
              ) : (
                <Link
                  href={href}
                  className={`hover:text-carleton-maize transition-colors ${
                    pathname === href ? "text-carleton-maize" : "text-blue-200"
                  }`}
                >
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-wider bg-carleton-maize hover:opacity-90 text-carleton-blue px-3 py-1.5 rounded transition-opacity"
          >
            Admin
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-200 ${
                mobileOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-200 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-200 ${
                mobileOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-carleton-blue border-t border-blue-800 px-4 pb-4">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map(({ href, label, highlight }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    highlight
                      ? "text-carleton-blue bg-carleton-maize font-semibold"
                      : pathname === href
                      ? "text-carleton-maize bg-white/10"
                      : "text-blue-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
