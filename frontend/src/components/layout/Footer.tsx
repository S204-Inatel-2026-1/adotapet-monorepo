'use client';

// src/components/layout/Footer.tsx

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [socialMessage, setSocialMessage] = useState<string | null>(null);

  const showComingSoon = (platform: string) => {
    setSocialMessage(`📢 Estamos criando nossa conta no ${platform}! Em breve você poderá nos seguir.`);
    setTimeout(() => setSocialMessage(null), 3000);
  };

  return (
    <footer className="bg-white pt-20 pb-10 px-8 relative">
      {/* Toast de redes sociais */}
      {socialMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2C4A3E] text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-bounce">
          {socialMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-100 pb-12 mb-8 text-left">
        {/* Logo e descrição */}
        <div>
          <Link href="/" className="font-bold text-[#2C4A3E] text-xl flex items-center gap-2 mb-6">
            <span className="bg-[#F4C542] w-10 h-10 flex items-center justify-center rounded-full text-2xl">❤︎</span>
            AdotaPET
          </Link>
          <p className="text-gray-400 text-sm">Conectando pets e pessoas para uma vida mais feliz.</p>
        </div>

        {/* Acesse rápido */}
        <div>
          <h4 className="font-bold text-[#2C4A3E] mb-6">Acesse rápido</h4>
          <ul className="text-gray-400 space-y-4 text-sm">
            <li><Link href="/#pets" className="hover:text-[#3A5B4F] transition-colors">Adotar</Link></li>
            <li><Link href="/#como-funciona" className="hover:text-[#3A5B4F] transition-colors">Como Funciona</Link></li>
            <li><Link href="/#ongs" className="hover:text-[#3A5B4F] transition-colors">ONGs</Link></li>
          </ul>
        </div>

        {/* Suporte */}
        <div>
          <h4 className="font-bold text-[#2C4A3E] mb-6">Suporte</h4>
          <ul className="text-gray-400 space-y-4 text-sm">
            <li><Link href="/faq" className="hover:text-[#3A5B4F] transition-colors">FAQ</Link></li>
            <li><Link href="/contato" className="hover:text-[#3A5B4F] transition-colors">Contato</Link></li>
            <li><Link href="/denunciar" className="hover:text-[#3A5B4F] transition-colors">Denunciar</Link></li>
            <li><Link href="/resgate" className="hover:text-[#3A5B4F] transition-colors">Ajuda com resgate</Link></li>
          </ul>
        </div>

        {/* Redes sociais */}
        <div>
          <h4 className="font-bold text-[#2C4A3E] mb-6">Redes Sociais</h4>
          <ul className="text-gray-400 space-y-4 text-sm">
            <li>
              <button onClick={() => showComingSoon('Instagram')} className="hover:text-[#3A5B4F] transition-colors cursor-pointer">
                Instagram
              </button>
            </li>
            <li>
              <button onClick={() => showComingSoon('Facebook')} className="hover:text-[#3A5B4F] transition-colors cursor-pointer">
                Facebook
              </button>
            </li>
          </ul>
        </div>
      </div>

      <p className="text-center text-gray-300 text-xs">© 2025 AdotaPET. Todos os direitos reservados.</p>
    </footer>
  );
}