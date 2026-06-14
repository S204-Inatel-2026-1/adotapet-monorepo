'use client';

// src/app/faq/page.tsx

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/ui/BackToHome';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import OngHeader from '@/components/layout/OngHeader';
import PrivateHeader from '@/components/layout/PrivateHeader';

const categories = ['Todos', 'Adoção', 'Resgate', 'Cuidados', 'Conta/Login', 'ONGs parceiras'];

const faqs = [
  {
    category: 'Adoção',
    icon: '🐾',
    question: 'Como funciona o processo de adoção?',
    answer:
      'O processo é simples: encontre um pet que você goste, clique em "Solicitar adoção" e preencha o formulário com seus dados. A ONG responsável pelo animal irá analisar seu perfil e entrar em contato para agendar uma visita ou entrevista. Após aprovação, você pode buscar seu novo amigo!',
  },
  {
    category: 'Adoção',
    icon: '💰',
    question: 'Preciso pagar para adotar?',
    answer:
      'A adoção em si é gratuita. Porém, algumas ONGs pedem uma contribuição simbólica para cobrir custos de vacinação, castração e vermifugação do animal. Esse valor, quando cobrado, é informado diretamente pela ONG na conversa.',
  },
  {
    category: 'Adoção',
    icon: '🔄',
    question: 'Posso devolver um pet adotado?',
    answer:
      'Entendemos que imprevistos acontecem. Em caso de impossibilidade de continuar com o pet, entre em contato com a ONG de origem do animal. Nunca abandone o pet — isso é crime e causa sofrimento. A ONG irá orientar o melhor caminho para ambos.',
  },
  {
    category: 'Adoção',
    icon: '📋',
    question: 'Quais documentos preciso para adotar?',
    answer:
      'Geralmente é necessário apresentar RG ou CPF, comprovante de residência e, em alguns casos, comprovante de renda. Cada ONG pode ter requisitos específicos, que serão informados durante o processo.',
  },
  {
    category: 'Resgate',
    icon: '🚨',
    question: 'Como denunciar maus-tratos a animais?',
    answer:
      'Você pode denunciar pelo nosso formulário de denúncia, ligar para a Polícia Ambiental (linha 181), Disque Denúncia (190) ou entrar em contato com ONGs locais. Sempre que possível, reúna fotos e informações sobre o local. Consulte nossa página "Denunciar" para mais detalhes.',
  },
  {
    category: 'Resgate',
    icon: '🆘',
    question: 'Encontrei um animal perdido ou ferido. O que faço?',
    answer:
      'Acesse nossa página de Resgate e preencha o formulário com as informações do animal e sua localização. Voluntários e ONGs parceiras serão acionados para ajudar. Se o animal estiver em perigo imediato, ligue para a Polícia Ambiental.',
  },
  {
    category: 'Cuidados',
    icon: '💉',
    question: 'O pet adotado já vem vacinado?',
    answer:
      'Na maioria dos casos, sim. As ONGs parceiras do AdotaPET se comprometem a entregar os animais com vacinação em dia, vermifugados e castrados. Verifique a carteira de vacinação no momento da adoção e mantenha o calendário em dia.',
  },
  {
    category: 'Cuidados',
    icon: '🏠',
    question: 'Como preparar minha casa para receber um pet?',
    answer:
      'Antes de buscar seu novo amigo, garanta um espaço seguro, remova objetos perigosos ao alcance, tenha pote de água e comida, uma cama confortável e brinquedos. Para gatos, prepare a caixa de areia. Dê tempo para o pet se adaptar ao novo lar.',
  },
  {
    category: 'Conta/Login',
    icon: '👤',
    question: 'Como criar uma conta no AdotaPET?',
    answer:
      'Clique em "Entrar" no menu e depois em "Criar nova conta". Preencha seus dados básicos, confirme seu e-mail e pronto! Com uma conta você pode salvar pets favoritos, acompanhar solicitações de adoção e receber novidades.',
  },
  {
    category: 'Conta/Login',
    icon: '🔐',
    question: 'Esqueci minha senha. Como recuperar?',
    answer:
      'Na tela de login, clique em "Esqueceu sua senha?". Informe seu e-mail cadastrado e você receberá um link para criar uma nova senha. Verifique também a caixa de spam caso não encontre o e-mail.',
  },
  {
    category: 'ONGs parceiras',
    icon: '🏢',
    question: 'Como cadastrar uma ONG no AdotaPET?',
    answer:
      'Entre em contato pelo nosso formulário de contato ou envie um e-mail para parcerias@adotapet.com.br com os dados da sua organização. Nossa equipe irá analisar e entrar em contato em até 5 dias úteis para orientar o processo de cadastro.',
  },
  {
    category: 'ONGs parceiras',
    icon: '📦',
    question: 'Como cadastrar pets para adoção sendo uma ONG?',
    answer:
      'Após aprovação da sua ONG, você terá acesso ao painel de gestão onde poderá cadastrar animais, adicionar fotos e gerenciar as solicitações de adoção recebidas. Nosso suporte está disponível para ajudar durante todo o processo.',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { user } = useAuth();
  const isOng = user?.role === 'ong';

  const filtered = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'Todos' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      {isOng ? <OngHeader /> : <Header />}
      <div className="h-20" />
      <BackToHome />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-16 text-center">
        <span className="text-[#3A5B4F] font-bold bg-[#E8F0E6] px-4 py-1.5 rounded-full text-xs inline-flex items-center gap-2 mb-6">
          🐾 Central de Ajuda
        </span>
        <h1 className="text-5xl font-extrabold text-[#2C4A3E] mb-4">Perguntas Frequentes</h1>
        <p className="text-gray-500 text-lg">
          Tire suas dúvidas sobre adoção, resgate e cuidados com os pets.
        </p>
      </section>

      {/* Busca */}
      <section className="max-w-2xl mx-auto px-8 mb-10">
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Buscar pergunta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-[#F4C542] font-medium"
          />
        </div>
      </section>

      {/* Categorias */}
      <section className="max-w-4xl mx-auto px-8 mb-10">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#3A5B4F] text-white shadow-lg'
                  : 'bg-white text-[#2C4A3E] border border-gray-100 hover:border-[#3A5B4F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Accordion */}
      <section className="max-w-3xl mx-auto px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-medium">Nenhuma pergunta encontrada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{faq.icon}</span>
                    <div>
                      <span className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest block mb-1">
                        {faq.category}
                      </span>
                      <span className="font-bold text-[#2C4A3E]">{faq.question}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[#3A5B4F] text-xl font-bold ml-4 transition-transform ${
                      openIndex === index ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-6 pl-16">
                    <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA final */}
        <div className="mt-16 bg-[#2C4A3E] rounded-[40px] p-12 text-center text-white">
          <p className="text-3xl mb-3">💬</p>
          <h2 className="text-2xl font-bold mb-3">Ainda precisa de ajuda?</h2>
          <p className="text-[#E8F0E6] mb-8">
            Nossa equipe está pronta para te atender e tirar todas as suas dúvidas.
          </p>
          <Link
            href="/contato"
            className="bg-[#F4C542] text-[#2C4A3E] px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-transform inline-block"
          >
            Entrar em contato →
          </Link>
        </div>
      </section>
      <BackToHome centered />

      <Footer />
    </main>
  );
}