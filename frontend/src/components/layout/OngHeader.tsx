'use client';

// src/components/layout/OngHeader.tsx
// Header clean para páginas da ONG — apenas logo + dropdown

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OngHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const dropdownLinks = [
    { href: '/perfil',             label: '👤 Meu Perfil' },
    { href: '/faq',                label: '❓ Ajuda' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F9F7F2]/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/painel" className="flex items-center gap-2">
          <div className="bg-[#F4C542] w-10 h-10 flex items-center justify-center rounded-full text-2xl">
            ❤︎
          </div>
          <span className="font-bold text-[#2C4A3E] text-xl tracking-tight">
            AdotaPET
          </span>
        </Link>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            aria-label="Abrir menu do usuário"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 text-[#2C4A3E] font-bold border border-[#2C4A3E] px-5 py-2 rounded-full hover:bg-[#2C4A3E] hover:text-white transition-all text-sm shadow-[4px_4px_0px_0px_rgba(44,74,62,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] group"
          >
            <div className="w-5 h-5 rounded-full bg-[#F4C542] flex items-center justify-center text-[#2C4A3E] font-black text-[10px] group-hover:bg-white transition-colors overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <Image unoptimized src={user.avatar} alt={user.name} width={20} height={20} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <span>{user?.name?.split(' ')[0] ?? 'Conta'}</span>
            <span className={`text-[10px] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-50">

              {/* Cabeçalho */}
              <div className="px-5 py-4 border-b border-gray-50 bg-[#F9F7F2]">
                <p className="font-black text-[#2C4A3E] text-sm">{user?.name ?? 'Usuário'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email ?? ''}</p>
                <span className="text-[10px] font-bold bg-[#E8F0E6] text-[#3A5B4F] px-2 py-0.5 rounded-full mt-1.5 inline-block">
                  ONG / Protetor
                </span>
              </div>

              {/* Links */}
              <div className="py-2">
                {dropdownLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#2C4A3E] hover:bg-[#F9F7F2] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t border-gray-50 py-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                >
                  🚪 Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}