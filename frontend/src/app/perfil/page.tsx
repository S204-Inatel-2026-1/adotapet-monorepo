'use client';

// src/app/perfil/page.tsx

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, normalizeUser } from '@/services/api';
import PrivateHeader from '@/components/layout/PrivateHeader';
import BackButton from '@/components/ui/BackButton';

const perfilSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type PerfilForm = z.infer<typeof perfilSchema>;

export default function PerfilPage() {
  const { user, login, loading: authLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        city: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: PerfilForm) => {
    try {
      setError(null);
      const token = localStorage.getItem('adotapet_token') || '';
      
      if (!token || token.split('.').length < 2) {
        throw new Error('Sessão inválida. Por favor, faça login novamente.');
      }

      const payloadStr = token.split('.')[1];
      const payload = JSON.parse(atob(payloadStr));
      const userId = payload.sub;

      const updatedUserRaw = await api.updateUser(userId, data);
      
      login(token, normalizeUser(updatedUserRaw));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] ${
      hasError ? 'ring-2 ring-red-400' : ''
    }`;

  if (authLoading) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A5B4F]"></div>
      </main>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      <PrivateHeader />
      <div className="h-20" />

        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-4 -ml-2 -mt-2">
            <BackButton href="/dashboard" label="Voltar" />
          </div>
        </div>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#2C4A3E] mb-2">Meu Perfil</h1>
          <p className="text-gray-500">Gerencie suas informações pessoais.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-10 bg-white p-6 rounded-[32px] border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-[#3A5B4F] flex items-center justify-center text-white font-black text-3xl">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-bold text-[#2C4A3E] text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400 mb-3">
              {user?.role === 'ong' ? 'ONG / Protetor Independente' : 'Adotante'}
            </p>
            <button className="text-xs font-black text-[#3A5B4F] bg-[#E8F0E6] px-4 py-2 rounded-full hover:bg-[#3A5B4F] hover:text-white transition-all">
              Alterar foto
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-[#2C4A3E] mb-2">Informações pessoais</h2>

          <div>
            <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Nome completo</label>
            <input type="text" {...register('name')} className={inputClass(!!errors.name)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">E-mail</label>
            <input type="email" {...register('email')} className={inputClass(!!errors.email)} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Telefone</label>
            <input type="tel" placeholder="(00) 00000-0000" {...register('phone')} className={inputClass(false)} />
          </div>

          <div>
            <label className="text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2">Cidade</label>
            <input type="text" placeholder="Sua cidade" {...register('city')} className={inputClass(false)} />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#3A5B4F] text-white font-bold px-10 py-4 rounded-2xl hover:bg-[#2C4A3E] transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </button>

            {saved && (
              <span className="text-[#3A5B4F] font-bold text-sm flex items-center gap-2">
                ✅ Salvo com sucesso!
              </span>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
