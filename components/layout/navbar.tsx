"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  { label: "Platform", href: "#dashboard" },
  { label: "Storefronts", href: "#storefronts" },
  { label: "Finances", href: "#finance" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <a className="brand" href="#top" aria-label="Flash home">
          <span className="brand-mark" aria-hidden="true">
            <span>F</span>
          </span>
          <span>Flash</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="button button--small button--dark" href="#dashboard">
            Explore platform <ArrowUpRight size={15} strokeWidth={2} />
          </a>
        </div>
        <button
          className="mobile-nav-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          ref={menuButtonRef}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <AnimatePresence>
          {menuOpen ? (
            <motion.nav
              className="mobile-nav-panel"
              id="mobile-navigation"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {links.map((link) => (
                <a key={link.label} href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              ))}
              <a className="mobile-nav-cta" href="#dashboard" onClick={closeMenu}>
                Explore platform <ArrowUpRight size={15} />
              </a>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
