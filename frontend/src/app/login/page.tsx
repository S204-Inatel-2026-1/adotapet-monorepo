"use client"; // Obrigatório no Next.js para páginas que têm interatividade (formulários, botões)

import Link from "next/link"; // Trocamos o react-router pelo Next.js
import { Heart, Mail, Lock, PawPrint } from "lucide-react";
import { api } from '@/services/api';
import { decodeJwtPayload, normalizeUser } from '@/services/api';

// Importações da nossa "Tríade"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/Input"; 
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BackToHome from '@/components/ui/BackToHome';
import Image from "next/image";

//  O CONTRATO (ZOD): Aqui definimos as regras do formulário
const loginSchema = z.object({
    email: z.string()
        .min(1, "O e-mail é obrigatório")
        .email("Digite um formato de e-mail válido"),
    password: z.string()
        .min(8, "A senha deve ter no mínimo 8 caracteres"),
});

// Extraímos a tipagem do schema para o TypeScript nos ajudar
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    // O GERENTE (React Hook Form): Configurando o formulário
    const {
        register, // A função que "grampeia" os inputs
        handleSubmit, // A função que intercepta o envio
        formState: { errors, isSubmitting }, // Aqui pegamos os erros e o estado de carregamento
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema), // Conectando o React Hook Form com o Zod
    });

    // A AÇÃO: O que acontece quando os dados passam pelo Zod com sucesso?
    const onSubmit = async (data: LoginForm) => {
        try {
            setError(null);
            const response = await api.login(data);
            const token = response.access_token;

            const payload = decodeJwtPayload(token);
            const userId = payload?.sub;

            if (!userId) {
                throw new Error('Erro ao identificar usuário no token');
            }

            const rawUser = await api.getUserById(userId);
            const userData = normalizeUser(rawUser);

            login(token, userData);

            // Redireciona para a home
            if (userData.role === 'ong') {
                router.push('/painel');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'E-mail ou senha inválidos';
            setError(errorMsg);
            console.error("Erro no login:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Elementos Decorativos de Fundo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="absolute top-10 left-10 opacity-20">
                <PawPrint className="size-12 text-primary" />
            </div>
            <div className="absolute bottom-20 right-20 opacity-20">
                <PawPrint className="size-16 text-accent" />
            </div>
            <div className="absolute top-1/3 right-1/4 opacity-10">
                <PawPrint className="size-10 text-secondary" />
            </div>

            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">

                {/* Lado Esquerdo - Ilustração */}
                <div className="hidden md:flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent rounded-full opacity-50 blur-xl" />
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-full opacity-40 blur-xl" />
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-card">
                            <Image
                                src="https://images.unsplash.com/photo-1739513261094-ba34a1c9e307?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwaWxsdXN0cmF0aW9uJTIwZnJpZW5kbHl8ZW58MXx8fHwxNzczNzA1MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                alt="Friendly cat"
                                width={1080}
                                height={500}
                                className="w-full h-[500px] object-cover"
                                unoptimized
                            />
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta!</h2>
                        <p className="text-muted-foreground">
                            Continue sua jornada de adoção responsável
                        </p>
                    </div>
                </div>

                {/* Lado Direito - Formulário */}
                <div className="flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8 md:p-10">

                            {/* Logo */}
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <div className="bg-accent p-3 rounded-full">
                                    <Heart className="size-7 text-accent-foreground fill-accent-foreground" />
                                </div>
                                <span className="text-2xl font-bold text-foreground">AdotaPET</span>
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-foreground mb-2">Entrar na plataforma</h1>
                                <p className="text-muted-foreground">
                                    Acesse sua conta e encontre seu novo amigo
                                </p>
                            </div>

                            {/* Mensagem de Erro */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Conectamos o handleSubmit do React Hook Form aqui */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                                {/* Campo de E-mail */}
                                <div className="relative">
                                    {/* O ícone fica flutuando por cima do input */}
                                    <Mail className="absolute left-4 top-9.5 size-5 text-muted-foreground z-10" />
                                    <Input
                                        label="E-mail"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
                                        error={errors.email?.message} // Passa o erro do Zod para o Input!
                                        {...register("email")} // Grampeia o campo!
                                    />
                                </div>

                                {/* Campo de Senha */}
                                <div className="relative">
                                    <Lock className="absolute left-4 top-9.5 size-5 text-muted-foreground z-10" />
                                    <Input
                                        label="Senha"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-12 rounded-2xl bg-input-background border-border/50 focus:border-primary"
                                        error={errors.password?.message}
                                        {...register("password")}
                                    />
                                </div>

                                <div className="text-right">
                                    <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                                        Esqueceu sua senha?
                                    </Link>
                                </div>

                                {/* Botão de Submit com estado de Loading */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {isSubmitting ? "Entrando..." : "Entrar"}
                                </button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border/50" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-card px-4 text-muted-foreground">ou</span>
                                    </div>
                                </div>

                                <Link href="/registro" className="block">
                                    <button
                                        type="button"
                                        className="w-full h-12 rounded-2xl border-2 border-border/50 hover:border-primary hover:bg-primary/5 text-foreground text-base font-medium transition-colors"
                                    >
                                        Criar nova conta
                                    </button>
                                </Link>
                            </form>
                            <div className="mt-6">
                                <BackToHome centered />
                            </div>
                        </div>

                        {/* Patinhas decorativas inferiores */}
                        <div className="mt-6 flex justify-center gap-2">
                            <PawPrint className="size-6 text-accent/60" />
                            <PawPrint className="size-5 text-secondary/60" />
                            <PawPrint className="size-4 text-primary/60" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}