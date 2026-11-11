"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/content/site";
import { CloseIcon, MenuIcon } from "./icons";
import { useEnquiry } from "./enquiry/enquiry-provider";
import Logo from "./logo";

export default function SiteHeader() {
  const pathname = usePathname();
  const { open } = useEnquiry();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />

        <nav className="site-nav" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__cta">
          <Link href="/track" className="btn btn--outline btn--sm">
            Track pickup
          </Link>
          <button type="button" className="btn btn--sm" onClick={() => open("pickup")}>
            Schedule pickup
          </button>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <nav id="mobile-nav" className="mobile-nav" data-open={menuOpen} aria-label="Mobile">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
        <Link href="/track">Track a pickup</Link>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setMenuOpen(false);
            open("pickup");
          }}
        >
          Schedule a pickup
        </button>
      </nav>
    </header>
  );
}
