'use client';

// src/app/contato/page.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Footer from '@/components/layout/Footer';
import BackToHome from '@/components/ui/BackToHome';
import Header from '@/components/layout/Header';

const contatoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('Digite um e-mail válido'),
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type ContatoForm = z.infer<typeof contatoSchema>;

const contactInfo = [
  { icon: '📧', label: 'E-mail', value: 'contato@adotapet.com.br' },
  { icon: '📞', label: 'Telefone', value: '(35) 3471-0000' },
  { icon: '📍', label: 'Endereço', value: 'Santa Rita do Sapucaí, MG' },
];

const supportCards = [
  {
    icon: '🕐',
    title: 'Horário de Atendimento',
    lines: ['Segunda a Sexta: 8h às 18h', 'Sábado: 9h às 13h'],
  },
  {
    icon: '🐾',
    title: 'Suporte para Adoção',
    lines: ['Dúvidas sobre o processo', 'Acompanhamento pós-adoção'],
  },
];

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContatoForm>({ resolver: zodResolver(contatoSchema) });

  const onSubmit = async (data: ContatoForm) => {
    await new Promise((r) => setTimeout(r, 1200));
    console.log('Mensagem enviada:', data);
    setSubmitted(true);
    reset();
  };

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <Header />
      <div className="h-20" />
      <BackToHome />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-16 text-center">
        <span className="text-[#3A5B4F] font-bold bg-[#E8F0E6] px-4 py-1.5 rounded-full text-xs inline-flex items-center gap-2 mb-6">
          💬 Fale com a gente
        </span>
        <h1 className="text-5xl font-extrabold text-[#2C4A3E] mb-4">Entre em Contato</h1>
        <p className="text-gray-500 text-lg">Estamos aqui para ajudar você e os pets.</p>
      </section>

      {/* Conteúdo principal */}
      <section className="max-w-6xl mx-auto px-8 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Lado esquerdo */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#2C4A3E] mb-4">Adoramos conversar 🐾</h2>
            <p className="text-gray-500 leading-relaxed">
              Seja para tirar dúvidas sobre adoção, reportar um problema ou propor uma parceria,
              nossa equipe está pronta para te atender com carinho e agilidade. Nenhuma dúvida é
              pequena quando o assunto é o bem-estar animal.
            </p>
          </div>

          {/* Infos de contato */}
          <div className="space-y-4">
            {contactInfo.map((info) => (
              <div key={info.label} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <p className="text-xs font-black text-[#3A5B4F] uppercase tracking-widest">{info.label}</p>
                  <p className="font-bold text-[#2C4A3E]">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cards de suporte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supportCards.map((card) => (
              <div key={card.title} className="bg-[#E8F0E6] p-6 rounded-2xl">
                <span className="text-2xl mb-3 block">{card.icon}</span>
                <h3 className="font-bold text-[#2C4A3E] mb-2">{card.title}</h3>
                {card.lines.map((line) => (
                  <p key={line} className="text-sm text-gray-500">{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Lado direito — Formulário */}
        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <span className="text-6xl mb-6">✅</span>
              <h2 className="text-2xl font-bold text-[#2C4A3E] mb-3">Mensagem enviada!</h2>
              <p className="text-gray-500 mb-8">
                Recebemos sua mensagem e retornaremos em breve. Obrigada por entrar em contato! 🐾
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-[#3A5B4F] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#2C4A3E] transition-all"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#2C4A3E] mb-8">Envie uma mensagem</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Nome */}
                <div>
                  <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    {...register('name')}
                    className={`w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] ${
                      errors.name ? 'ring-2 ring-red-400' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className={`w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] ${
                      errors.email ? 'ring-2 ring-red-400' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Assunto */}
                <div>
                  <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">
                    Assunto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dúvida sobre adoção"
                    {...register('subject')}
                    className={`w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] ${
                      errors.subject ? 'ring-2 ring-red-400' : ''
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.subject.message}</p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Conte como podemos ajudar..."
                    {...register('message')}
                    className={`w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] resize-none ${
                      errors.message ? 'ring-2 ring-red-400' : ''
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3A5B4F] text-white font-bold py-4 rounded-2xl hover:bg-[#2C4A3E] transition-all shadow-lg hover:shadow-xl text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensagem 🐾'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Mapa estilizado */}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <div className="bg-[#2C4A3E] rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div>
            <h2 className="text-2xl font-bold mb-2">Onde estamos 📍</h2>
            <p className="text-[#E8F0E6]">Santa Rita do Sapucaí — Vale da Eletrônica, MG</p>
            <p className="text-[#E8F0E6] text-sm mt-2">
              Uma cidade que acredita no bem-estar animal tanto quanto em tecnologia.
            </p>
          </div>
          <div className="bg-[#3A5B4F] rounded-3xl px-12 py-8 text-center">
            <p className="text-5xl mb-2">🗺️</p>
            <p className="text-sm text-[#E8F0E6] font-medium">Sul de Minas Gerais</p>
            <p className="text-xs text-[#E8F0E6]/60 mt-1">CEP: 37540-000</p>
          </div>
        </div>
      </section>
      <BackToHome centered />
      <Footer />
    </main>
  );
}