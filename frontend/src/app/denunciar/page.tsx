'use client';

// src/app/denunciar/page.tsx

import Footer from '@/components/layout/Footer';
import { useRouter } from 'next/navigation';
import BackToHome from '@/components/ui/BackToHome';
import Header from '@/components/layout/Header';

export default function DenunciarPage() {
  const router = useRouter();

  const sectionClass =
    'bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm';

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <Header />
      <div className="h-20" />
      <BackToHome />

      

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-8 py-20 text-center">
        <span className="text-[#3A5B4F] font-bold bg-[#E8F0E6] px-4 py-2 rounded-full text-xs inline-flex items-center gap-2 mb-6">
          🚨 Proteção Animal
        </span>

        <h1 className="text-5xl md:text-6xl font-extrabold text-[#2C4A3E] leading-tight mb-6">
          Denunciar maus-tratos
          <br />
          salva vidas 🐾
        </h1>

        <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mx-auto">
          Aprenda como identificar situações de risco, agir com segurança e
          denunciar casos de maus-tratos contra animais.
        </p>
      </section>

      {/* CONTEÚDO */}
      <div className="max-w-5xl mx-auto px-8 pb-24 space-y-10">

        {/* LEI */}
        <section className={`${sectionClass} border-l-[10px] border-[#F4C542]`}>
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F4C542]/20 flex items-center justify-center text-3xl shrink-0">
              ⚖️
            </div>

            <div className="max-w-3xl">
              <h2 className="text-3xl font-black text-[#2C4A3E] mb-4">
                Maus-tratos é crime
              </h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                No Brasil, maus-tratos contra animais é crime previsto pela
                Lei Federal nº 9.605/98 (Lei de Crimes Ambientais).
              </p>

              <div className="bg-[#F9F7F2] rounded-2xl p-6 border border-[#3A5B4F]/10">
                <p className="text-[#2C4A3E] font-semibold leading-relaxed">
                  “Praticar ato de abuso, maus-tratos, ferir ou mutilar animais
                  pode resultar em multa e pena de reclusão.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* O QUE É MAUS TRATOS */}
        <section className={sectionClass}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black text-[#2C4A3E] mb-8">
              Como identificar maus-tratos
            </h2>

            <p className="text-gray-500 leading-relaxed mb-8">
              Muitas pessoas não sabem reconhecer quando um animal está sofrendo.
              Maus-tratos podem acontecer de diversas formas — físicas,
              emocionais e por negligência.
            </p>

            <div className="grid md:grid-cols-2 gap-5 text-left">

              {[
                'Falta de água limpa e alimentação adequada',
                'Animais presos constantemente em correntes curtas',
                'Ferimentos sem tratamento veterinário',
                'Agressões físicas ou abandono',
                'Ambiente extremamente sujo ou insalubre',
                'Privação de abrigo contra chuva e sol',
                'Exploração para rinhas ou violência',
                'Animais extremamente magros ou debilitados',
              ].map((item) => (
                <div
                  key={item}
                  className="bg-[#F9F7F2] rounded-2xl p-5 border border-[#3A5B4F]/10 flex gap-4 items-start"
                >
                  <span className="text-2xl">🐾</span>

                  <p className="text-[#2C4A3E] font-medium leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO AGIR */}
        <section className={sectionClass}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-[#2C4A3E] mb-8 text-center">
              O que fazer ao presenciar maus-tratos
            </h2>

            <div className="space-y-5">

              {[
                {
                  number: '1',
                  title: 'Garanta sua segurança',
                  text: 'Evite confrontos perigosos. Nunca coloque sua integridade física em risco.',
                },
                {
                  number: '2',
                  title: 'Reúna informações',
                  text: 'Anote endereço, horário, características do local e, se possível, registre fotos ou vídeos.',
                },
                {
                  number: '3',
                  title: 'Busque ajuda',
                  text: 'Entre em contato com órgãos responsáveis, ONGs ou proteção animal.',
                },
                {
                  number: '4',
                  title: 'Formalize a denúncia',
                  text: 'Registrar oficialmente aumenta as chances de resgate e responsabilização.',
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-5 items-start bg-[#F9F7F2] rounded-2xl p-6 border border-[#3A5B4F]/10"
                >
                  <div className="w-12 h-12 rounded-full bg-[#F4C542] flex items-center justify-center font-black text-[#2C4A3E] shrink-0">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#2C4A3E] mb-2">
                      {step.title}
                    </h3>

                    <p className="text-gray-500 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTATOS */}
        <section className={sectionClass}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black text-[#2C4A3E] mb-8">
              Quem contatar nesses casos
            </h2>

            <div className="grid md:grid-cols-2 gap-5 text-left">

              {[
                {
                  icon: '🚓',
                  title: 'Polícia Militar Ambiental',
                  text: 'Atendimento especializado em crimes ambientais e maus-tratos.',
                  phone: '📞 190',
                },
                {
                  icon: '📞',
                  title: 'Disque Denúncia',
                  text: 'Denúncias anônimas e encaminhamento às autoridades.',
                  phone: '📞 181',
                },
                {
                  icon: '🌿',
                  title: 'IBAMA',
                  text: 'Casos envolvendo fauna silvestre ou crimes ambientais.',
                  phone: '📞 0800 61 8080',
                },
                {
                  icon: '🏛️',
                  title: 'Delegacia local',
                  text: 'Registro oficial do boletim de ocorrência.',
                  phone: '📞 Procure a delegacia da sua cidade',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#F9F7F2] rounded-2xl p-6 border border-[#3A5B4F]/10"
                >
                  <span className="text-4xl mb-4 block">{item.icon}</span>

                  <h3 className="text-xl font-black text-[#2C4A3E] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 leading-relaxed mb-4">
                    {item.text}
                  </p>

                  <div className="bg-white rounded-xl px-4 py-3 border border-[#3A5B4F]/10">
                    <p className="font-bold text-[#2C4A3E]">
                      {item.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-[#E8F0E6] rounded-2xl p-6 border border-[#3A5B4F]/10">
              <p className="text-[#2C4A3E] font-semibold leading-relaxed">
                Além dos órgãos oficiais, você também pode procurar ONGs,
                protetores independentes e redes de apoio animal para pedir ajuda
                e orientação.
              </p>
            </div>
          </div>
        </section>

        {/* DENÚNCIA ANÔNIMA */}
        <section className={sectionClass}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black text-[#2C4A3E] mb-8">
              Como funciona a denúncia anônima
            </h2>

            <div className="space-y-5 text-gray-500 leading-relaxed">
              <p>
                Em muitos casos, é possível denunciar maus-tratos sem informar
                sua identidade. Isso ajuda pessoas que têm medo de represálias
                ou exposição.
              </p>

              <p>
                Você pode realizar denúncias anônimas através do Disque Denúncia,
                canais online da prefeitura, Polícia Ambiental ou aplicativos
                especializados da sua cidade.
              </p>

              <p>
                Mesmo de forma anônima, tente fornecer o máximo de informações
                possíveis para facilitar a investigação e o resgate do animal.
              </p>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-[#2C4A3E] rounded-[40px] p-10 md:p-14 text-center text-white relative overflow-hidden">

          <div className="absolute top-0 right-0 w-72 h-72 bg-[#F4C542]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#F4C542]/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <span className="text-6xl mb-6 block">🐶🐱</span>

            <h2 className="text-4xl font-black mb-6">
              Sua voz pode salvar uma vida
            </h2>

            <p className="text-white/80 max-w-3xl mx-auto leading-relaxed text-lg mb-8">
              Não hesite em agir quando presenciar maus-tratos. Cada denúncia
              pode fazer a diferença entre o sofrimento e a salvação de um
              animal.
            </p>

            <p className="text-white/70 italic max-w-3xl mx-auto leading-relaxed mb-10">
              “A grandeza de uma nação pode ser julgada pelo modo como seus
              animais são tratados.”
              <br />
              — Mahatma Gandhi
            </p>

            <button
              onClick={() => router.push('/')}
              className="bg-[#F4C542] text-[#2C4A3E] px-10 py-5 rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
            >
              🐾 Ver pets para adoção
            </button>
          </div>
        </section>
      </div>

      <BackToHome centered />

      <Footer />
    </main>
  );
}