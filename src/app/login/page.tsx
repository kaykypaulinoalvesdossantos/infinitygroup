'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth';
import { defaultAdminPath } from '@/lib/admin-access';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Set once a valid session is stored and the hard redirect starts; keeps the button in loading state
        let redirecting = false;

        try {
            const data = await authService.login({ email, password });

            // Validate the role before any session data is persisted
            const role = data?.user?.role?.toUpperCase();
            if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'CLIENTE' && role !== 'VENDEDOR' && role !== 'FINANCEIRO') {
                setError('Papel de usuário inválido. Contate o administrador.');
                return;
            }

            // Store token and user
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role - use window.location for hard redirect
            let destination = defaultAdminPath(role);
            if (role === 'CLIENTE') {
                destination = data.user.mustChangePassword ? '/portal/primeiro-acesso' : '/portal/dashboard';
            } else if (data.user.mustChangePassword) {
                destination = '/admin/primeiro-acesso';
            }

            redirecting = true;
            window.location.href = destination;
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao fazer login');
        } finally {
            if (!redirecting) setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-background flex items-center justify-center py-16 px-4">
            <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
                <ThemeSwitcher className="min-w-11 gap-0 px-2 [&>span]:hidden sm:[&>span]:inline" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Login Card */}
                <div className="bg-card rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-border overflow-hidden">

                    {/* Top Gradient Bar */}
                    <div className="h-2 bg-gradient-to-r from-[#0076FF] to-cyan-400 w-full"></div>

                    <div className="p-8 md:p-10">
                        {/* Logo and Header */}
                        <div className="text-center mb-8">
                            <Link
                                href="/"
                                aria-label="Infinity Groups — página inicial"
                                className="inline-flex items-center gap-3 mb-6 group"
                            >
                                <img
                                    src="/images/logo-Infinity/infinity-symbol.webp"
                                    alt=""
                                    className="h-8 w-auto dark:brightness-0 dark:invert"
                                />
                                <img
                                    src="/images/logo-Infinity/infinity-wordmark.webp"
                                    alt=""
                                    className="h-8 w-auto dark:brightness-0 dark:invert"
                                />
                            </Link>

                            <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-info text-info-foreground flex items-center justify-center">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Área do Cliente
                                </h1>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Entre com suas credenciais para acessar o painel
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                role="alert"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-danger border border-danger-border flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-danger-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-danger-foreground font-medium">{error}</p>
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${email ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    E-mail
                                </Label>
                                <div className="relative">
                                    <Mail
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${email ? 'text-primary' : 'text-muted-foreground'
                                            }`}
                                    />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                        autoComplete="email"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        className={`w-full bg-card border text-foreground placeholder:text-muted-foreground rounded-xl h-14 text-base pl-12 pr-4 transition-all outline-none shadow-sm ${email
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-input hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${password ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Lock
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${password ? 'text-primary' : 'text-muted-foreground'
                                            }`}
                                    />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        autoComplete="current-password"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        className={`w-full bg-card border text-foreground placeholder:text-muted-foreground rounded-xl h-14 text-base pl-12 pr-12 transition-all outline-none shadow-sm ${password
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-input hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        aria-pressed={showPassword}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Entrando...
                                    </span>
                                ) : (
                                    'Entrar no Painel'
                                )}
                            </Button>

                            {/* Footer Info */}
                            <p className="text-center text-xs text-foreground-subtle pt-2">
                                Acesso restrito aos clientes Infinity Groups
                            </p>
                        </form>
                    </div>
                </div>

                {/* Back to Home Link */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors inline-flex items-center gap-1 group"
                    >
                        <svg
                            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar para o site
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
