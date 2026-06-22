'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { Lock, Heart, PawPrint, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import BackToHome from '@/components/ui/BackToHome';

const schema = z.object({
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/(?=.*[a-z])/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/(?=.*[A-Z])/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/(?=.*\d)/, 'A senha deve conter pelo menos um número')
    .regex(/(?=.*[^A-Za-z0-9])/, 'A senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string()
    .min(1, 'A confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    if (!token) return;
    try {
      setApiError(null);
      await api.resetPassword(token, data.password);
      setSubmitted(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro ao redefinir a senha.');
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <span className="text-5xl mb-6 block">⚠️</span>
        <h2 className="text-xl font-bold text-foreground mb-3">Token de redefinição inválido ou expirado.</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Para receber um novo link de recuperação de senha, clique no botão abaixo.
        </p>
        <Link href="/esqueceu-senha" className="block w-full">
          <button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors">
            Solicitar Novo Link
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {submitted ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-6 text-green-500">
            <CheckCircle className="size-16" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Senha alterada com sucesso!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Sua senha foi redefinida e você já pode fazer login.
          </p>
          <Link href="/login" className="block w-full">
            <button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors">
              Ir para Login
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Criar Nova Senha</h1>
            <p className="text-muted-foreground text-sm">
              Digite e confirme sua nova senha abaixo
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <Lock className="absolute left-4 top-9.5 size-5 text-muted-foreground z-10" />
              <Input
                label="Nova senha"
                type="password"
                placeholder="Digite sua nova senha"
                className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-9.5 size-5 text-muted-foreground z-10" />
              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Confirme sua nova senha"
                className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function RecuperarSenha() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-accent p-3 rounded-full">
              <Heart className="size-7 text-accent-foreground fill-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">AdotaPET</span>
          </div>

          <Suspense fallback={
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#F4C542] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm font-medium">Carregando...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 border-t border-border/40 pt-6">
            <BackToHome centered />
          </div>
        </div>

        {/* Patinhas decorativas */}
        <div className="mt-6 flex justify-center gap-2 opacity-50">
          <PawPrint className="size-6 text-accent/60" />
          <PawPrint className="size-5 text-secondary/60" />
          <PawPrint className="size-4 text-primary/60" />
        </div>
      </div>
    </div>
  );
}
