'use client';

// src/app/perfil/page.tsx

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, normalizeUser } from '@/services/api';
import PrivateHeader from '@/components/layout/PrivateHeader';
import OngHeader from '@/components/layout/OngHeader';
import BackButton from '@/components/ui/BackButton';
import { useRouter } from 'next/navigation';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const perfilSchema = z.object({
  name:  z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  city:  z.string().optional(),
  state: z.string().optional(),
});

const senhaSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(/(?=.*[a-z])/, 'Deve conter pelo menos uma letra minúscula')
      .regex(/(?=.*[A-Z])/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/(?=.*\d)/, 'Deve conter pelo menos um número')
      .regex(/(?=.*[^A-Za-z0-9])/, 'Deve conter pelo menos um caractere especial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type PerfilForm = z.infer<typeof perfilSchema>;
type SenhaForm  = z.infer<typeof senhaSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputClass = (hasError: boolean) =>
  `w-full px-5 py-4 rounded-2xl bg-[#F9F7F2] outline-none font-medium transition-all focus:ring-2 focus:ring-[#F4C542] ${
    hasError ? 'ring-2 ring-red-400' : ''
  }`;

const labelClass = 'text-xs font-black text-[#2C4A3E] uppercase tracking-widest block mb-2';

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const isOng = user?.role === 'ong';

  const [savedPerfil, setSavedPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  const [savedSenha, setSavedSenha] = useState(false);
  const [errorSenha, setErrorSenha] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Formulário de perfil ──
  const {
    register: registerPerfil,
    handleSubmit: handleSubmitPerfil,
    reset,
    formState: { errors: errorsPerfil, isSubmitting: isSubmittingPerfil },
  } = useForm<PerfilForm>({ resolver: zodResolver(perfilSchema) });

  // ── Formulário de senha ──
  const {
    register: registerSenha,
    handleSubmit: handleSubmitSenha,
    reset: resetSenha,
    formState: { errors: errorsSenha, isSubmitting: isSubmittingSenha },
  } = useForm<SenhaForm>({ resolver: zodResolver(senhaSchema) });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adotapet_token') : null;
    if (!token || token.split('.').length < 2) return;

    let payload: { sub?: string };
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
    } catch {
      return;
    }
    if (!payload?.sub) return;

    api
      .getUserById(payload.sub)
      .then((u) =>
        reset({
          name:  u.fullName ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          city:  u.city ?? '',
          state: u.state ?? '',
        }),
      )
      .catch(() => {
        if (user) {
          reset({ name: user.name || '', email: user.email || '', phone: '', city: '', state: '' });
        }
      });
  }, [reset, user]);

  // ── Submit perfil ──
  const onSubmitPerfil = async (data: PerfilForm) => {
    try {
      setErrorPerfil(null);
      const token = localStorage.getItem('adotapet_token') || '';
      if (!token || token.split('.').length < 2) throw new Error('Sessão inválida. Faça login novamente.');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const updatedUserRaw = await api.updateUser(payload.sub, data);
      login(token, normalizeUser(updatedUserRaw));
      setSavedPerfil(true);
      setTimeout(() => setSavedPerfil(false), 3000);
    } catch (err) {
      setErrorPerfil(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    }
  };

  // ── Submit senha ──
  const onSubmitSenha = async (data: SenhaForm) => {
    try {
      setErrorSenha(null);
      const token = localStorage.getItem('adotapet_token') || '';
      if (!token || token.split('.').length < 2) throw new Error('Sessão inválida. Faça login novamente.');
      const payload = JSON.parse(atob(token.split('.')[1]));
      // TODO (Lucas): PATCH /users/:id — { password: data.password }
      console.log('Trocar senha do usuário', payload.sub, data.password);
      setSavedSenha(true);
      resetSenha();
      setTimeout(() => setSavedSenha(false), 3000);
    } catch (err) {
      setErrorSenha(err instanceof Error ? err.message : 'Erro ao trocar senha');
    }
  };

  // ── Excluir conta ──
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('adotapet_token') || '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      // TODO (Lucas): DELETE /users/:id
      console.log('Excluir conta', payload.sub);
      logout();
      router.push('/');
    } catch (err) {
      console.error('Erro ao excluir conta', err);
    }
  };

  if (authLoading) {
    return (
      <main className="bg-[#F9F7F2] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A5B4F]" />
      </main>
    );
  }

  return (
    <main className="bg-[#F9F7F2] min-h-screen font-sans">
      {isOng ? <OngHeader /> : <PrivateHeader />}
      <div className="h-20" />

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-4 -ml-2 -mt-2">
          <BackButton href={isOng ? '/painel' : '/dashboard'} label="Voltar" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 pb-16 space-y-6">

        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#2C4A3E] mb-2">Meu Perfil</h1>
          <p className="text-gray-500">Gerencie suas informações pessoais.</p>
        </div>

        {/* ── Avatar ── */}
        <div className="flex items-center gap-6 bg-white p-6 rounded-[32px] border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-[#3A5B4F] flex items-center justify-center text-white font-black text-3xl flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-bold text-[#2C4A3E] text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400 mb-3">
              {isOng ? 'ONG / Protetor Independente' : 'Adotante'}
            </p>
            <button className="text-xs font-black text-[#3A5B4F] bg-[#E8F0E6] px-4 py-2 rounded-full hover:bg-[#3A5B4F] hover:text-white transition-all">
              Alterar foto
            </button>
          </div>
        </div>

        {/* ── Informações pessoais ── */}
        {errorPerfil && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
            {errorPerfil}
          </div>
        )}

        <form onSubmit={handleSubmitPerfil(onSubmitPerfil)} className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-[#2C4A3E] mb-2">Informações pessoais</h2>

          <div>
            <label className={labelClass}>Nome completo</label>
            <input type="text" {...registerPerfil('name')} className={inputClass(!!errorsPerfil.name)} />
            {errorsPerfil.name && <p className="text-xs text-red-500 mt-1">{errorsPerfil.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>E-mail</label>
            <input type="email" {...registerPerfil('email')} className={inputClass(!!errorsPerfil.email)} />
            {errorsPerfil.email && <p className="text-xs text-red-500 mt-1">{errorsPerfil.email.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Telefone</label>
            <input type="tel" placeholder="(00) 00000-0000" {...registerPerfil('phone')} className={inputClass(false)} />
          </div>

          <div>
            <label className={labelClass}>Cidade</label>
            <input type="text" placeholder="Sua cidade" {...registerPerfil('city')} className={inputClass(false)} />
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <input type="text" placeholder="UF" maxLength={2} {...registerPerfil('state')} className={inputClass(false)} />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmittingPerfil}
              className="bg-[#3A5B4F] text-white font-bold px-10 py-4 rounded-2xl hover:bg-[#2C4A3E] transition-all disabled:opacity-70"
            >
              {isSubmittingPerfil ? 'Salvando...' : 'Salvar alterações'}
            </button>
            {savedPerfil && (
              <span className="text-[#3A5B4F] font-bold text-sm">✅ Salvo com sucesso!</span>
            )}
          </div>
        </form>

        {/* ── Seções exclusivas da ONG ── */}
     
          <>
            {/* Troca de senha */}
            {errorSenha && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
                {errorSenha}
              </div>
            )}

            <form onSubmit={handleSubmitSenha(onSubmitSenha)} className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-5">
              <h2 className="text-xl font-bold text-[#2C4A3E] mb-2">Trocar senha</h2>

              <div>
                <label className={labelClass}>Nova senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerSenha('password')}
                  className={inputClass(!!errorsSenha.password)}
                />
                {errorsSenha.password && (
                  <p className="text-xs text-red-500 mt-1">{errorsSenha.password.message}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Confirmar nova senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerSenha('confirmPassword')}
                  className={inputClass(!!errorsSenha.confirmPassword)}
                />
                {errorsSenha.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errorsSenha.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingSenha}
                  className="bg-[#3A5B4F] text-white font-bold px-10 py-4 rounded-2xl hover:bg-[#2C4A3E] transition-all disabled:opacity-70"
                >
                  {isSubmittingSenha ? 'Salvando...' : 'Trocar senha'}
                </button>
                {savedSenha && (
                  <span className="text-[#3A5B4F] font-bold text-sm">✅ Senha alterada!</span>
                )}
              </div>
            </form>

            {/* Zona de perigo */}
            <div className="bg-white p-8 rounded-[32px] border border-red-100 space-y-4">
              <h2 className="text-xl font-bold text-red-500 mb-1">Zona de perigo</h2>
              <p className="text-sm text-gray-400">
                Ao excluir sua conta, todos os dados da ONG, pets cadastrados e histórico de adoções serão permanentemente removidos. Essa ação não pode ser desfeita.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-sm font-bold text-red-500 bg-red-50 px-6 py-3 rounded-2xl hover:bg-red-100 transition-all"
                >
                  🗑️ Excluir minha conta
                </button>
              ) : (
                <div className="bg-red-50 rounded-2xl p-5 space-y-3">
                  <p className="text-sm font-bold text-red-600">
                    Tem certeza? Esta ação é irreversível.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all text-sm"
                    >
                      Sim, excluir conta
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold hover:border-gray-300 transition-all text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        
      </div>

      <footer className="mt-12 border-t border-gray-100 py-6">
        <p className="text-center text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} AdotaPET. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}