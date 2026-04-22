'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login({ email, password });

            console.log('🔐 Login Response:', data);
            console.log('👤 User Role:', data.user.role);

            // Store token and user
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role - use window.location for hard redirect
            const role = data.user.role?.toUpperCase();
            if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
                console.log('✅ Redirecting to ADMIN dashboard');
                window.location.href = '/admin/dashboard';
            } else if (role === 'CLIENTE') {
                console.log('✅ Redirecting to CLIENT portal');
                if (data.user.mustChangePassword) {
                    console.log('🔄 First access required, redirecting to password change');
                    window.location.href = '/portal/primeiro-acesso';
                } else {
                    window.location.href = '/portal/dashboard';
                }
            } else {
                console.error('❌ Unknown role:', data.user.role);
                setError('Papel de usuário inválido. Contate o administrador.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F6F6F6] flex items-center justify-center py-16 px-4 font-inter">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                    {/* Top Gradient Bar */}
                    <div className="h-2 bg-gradient-to-r from-[#0076FF] to-cyan-400 w-full"></div>

                    <div className="p-8 md:p-10">
                        {/* Logo and Header */}
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                                <img
                                    src="/images/logo-Infinity/logo-sem-escrita.svg"
                                    alt="Infinity Group Icon"
                                    className="h-12 w-auto"
                                />
                                <img
                                    src="/images/logo-Infinity/So-escrita.svg"
                                    alt="Infinity Group"
                                    className="h-14 w-auto"
                                />
                            </Link>

                            <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0076FF] flex items-center justify-center">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <h1 className="text-2xl font-bold text-[#1A1A1A]">
                                    Área do Cliente
                                </h1>
                            </div>

                            <p className="text-sm text-[#64748B]">
                                Entre com suas credenciais para acessar o painel
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${email ? 'text-[#0076FF]' : 'text-[#64748B]'
                                        }`}
                                >
                                    E-mail
                                </Label>
                                <div className="relative">
                                    <Mail
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${email ? 'text-[#0076FF]' : 'text-[#64748B]'
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
                                        className={`w-full bg-white border text-[#1A1A1A] placeholder:text-slate-400 rounded-xl h-14 text-base pl-12 pr-4 transition-all outline-none shadow-sm ${email
                                                ? 'border-[#0076FF] ring-2 ring-[#0076FF]/20'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20'
                                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${password ? 'text-[#0076FF]' : 'text-[#64748B]'
                                        }`}
                                >
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Lock
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${password ? 'text-[#0076FF]' : 'text-[#64748B]'
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
                                        className={`w-full bg-white border text-[#1A1A1A] placeholder:text-slate-400 rounded-xl h-14 text-base pl-12 pr-12 transition-all outline-none shadow-sm ${password
                                                ? 'border-[#0076FF] ring-2 ring-[#0076FF]/20'
                                                : 'border-slate-200 hover:border-slate-300 focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20'
                                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    {password && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0076FF] transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                            <p className="text-center text-xs text-slate-400 pt-2">
                                Acesso restrito aos clientes Infinity Groups
                            </p>
                        </form>
                    </div>
                </div>

                {/* Back to Home Link */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-sm text-[#64748B] hover:text-[#0076FF] font-medium transition-colors inline-flex items-center gap-1 group"
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
