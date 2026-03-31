'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Lock } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Plate Listings' },
  { href: '/drawing', label: 'Drawing Numbers' },
  { href: '/paintings', label: 'Paintings' },
  { href: '/sell', label: 'Sell Your Number' },
  { href: '/how-to-buy', label: 'How to Buy' },
  { href: '/faq', label: 'FAQ' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/contact', label: 'Communication' },
  { href: '/about', label: 'About the Company' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      {/* Top bar: hamburger button */}
      <div className="flex items-center justify-between py-2">
        <span className="text-white text-xs opacity-70">0509080500</span>
        <button
          onClick={() => setOpen(v => !v)}
          className="text-white p-1 rounded hover:bg-white/10 transition"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div className="border-t border-white/20 py-2 pb-3 flex flex-col">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-white text-[14px] py-2.5 px-2 border-b border-white/10 last:border-0 hover:bg-white/10 transition"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="text-white/60 text-[13px] py-2.5 px-2 flex items-center gap-2 hover:bg-white/10 transition mt-1"
          >
            <Lock size={13} /> Admin
          </Link>
        </div>
      )}
    </div>
  );
}
