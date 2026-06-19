'use client';

// src/components/layout/Navbar.tsx

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F7F2]/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={(e) => {
            // Se já estiver na home, faz scroll ao topo
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div className="bg-[#F4C542] w-10 h-10 flex items-center justify-center rounded-full text-2xl">
            ❤︎
          </div>
          <span className="font-bold text-[#2C4A3E] text-xl tracking-tight">AdotaPET</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-[#2C4A3E] font-medium text-sm">
          <Link href="/#pets" className="hover:text-black transition-colors">Adotar</Link>
          <Link href="/#como-funciona" className="hover:text-black transition-colors">Como funciona</Link>
          <Link href="/#ongs" className="hover:text-black transition-colors">ONGs</Link>
          <Link href="/resgate" className="hover:text-black transition-colors">Resgate</Link>
          <Link href="/denunciar" className="hover:text-black transition-colors">Denunciar</Link>

          <Link
            href="/login"
            className="flex items-center gap-2 text-[#2C4A3E] font-bold border border-[#2C4A3E] px-8 py-2 rounded-full hover:bg-[#2C4A3E] hover:text-white transition-all text-sm shadow-[4px_4px_0px_0px_rgba(44,74,62,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <span>➜]</span> Entrar
          </Link>
        </div>
      </div>
    </nav>
  );
}