'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Loader2, 
    Lock, 
    CheckCircle2, 
    AlertCircle, 
    Eye, 
    EyeOff, 
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { usersService } from '@/services/users';

export default function PrimeiroAcessoPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Password strength indicators
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const passwordsMatch = password === confirmPassword && password !== '';

    const isFormValid = hasMinLength && hasNumber && hasSpecialChar && passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setError('');

        try {
            await usersService.updateMe({ password });
            
            // Update local storage flag
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.mustChangePassword = false;
                localStorage.setItem('user', JSON.stringify(user));
            }

            setSuccess(true);
            
            // Redirect to dashboard after a delay
            setTimeout(() => {
                window.location.href = '/portal/dashboard';
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao atualizar sua senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-[#F6F6F6] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center"
                >
                    <div className="bg-card p-10 rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-border">
                        <div className="w-20 h-20 bg-success text-success-foreground rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-3">Senha Alterada!</h1>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Sua segurança é nossa prioridade. Sua nova senha foi configurada com sucesso e agora você tem acesso total ao portal.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Redirecionando para o painel...
                        </div>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-2xl grid grid-cols-1 lg:grid-cols-5 bg-card rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-border overflow-hidden">
                
                {/* Visual Side (Hidden on mobile) */}
                <div className="hidden lg:flex lg:col-span-2 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] p-10 flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 leading-tight">Sua Segurança em Primeiro Lugar</h2>
                        <p className="text-blue-50 text-sm leading-relaxed opacity-90">
                            Como este é seu primeiro acesso, precisamos que você defina uma senha pessoal e segura para proteger seus dados.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-emerald-400' : 'bg-white/30'}`} />
                            Mínimo 8 caracteres
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${hasNumber ? 'bg-emerald-400' : 'bg-white/30'}`} />
                            Pelo menos um número
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${hasSpecialChar ? 'bg-emerald-400' : 'bg-white/30'}`} />
                            Um caractere especial
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl" />
                </div>

                {/* Form Side */}
                <div className="lg:col-span-3 p-8 md:p-12">
                    <div className="mb-10 text-center lg:text-left">
                        <img src="/images/logo-Infinity/infinity-wordmark.webp" alt="Infinity Group" width="546" height="128" className="h-8 w-auto mb-8 mx-auto lg:mx-0 dark:brightness-0 dark:invert" />
                        <h1 className="text-2xl font-bold text-foreground">Configure sua Senha</h1>
                        <p className="text-muted-foreground text-sm mt-2 font-medium">Crie uma nova senha para continuar seu acesso.</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-danger border border-danger-border rounded-2xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-danger-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-danger-foreground font-medium">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nova Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className="w-full h-14 bg-muted border border-input rounded-2xl pl-12 pr-12 focus:border-primary focus:ring-4 focus:ring-ring/30 outline-none transition-all text-foreground"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Checklist - Realtime Feedback */}
                            {password && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="grid grid-cols-1 gap-2 pt-2 pb-1"
                                >
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        {hasMinLength ? (
                                            <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-input" />
                                        )}
                                        <span className={hasMinLength ? 'text-success-foreground' : 'text-muted-foreground'}>
                                            Mínimo 8 caracteres
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        {hasNumber ? (
                                            <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-input" />
                                        )}
                                        <span className={hasNumber ? 'text-success-foreground' : 'text-muted-foreground'}>
                                            Pelo menos um número
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        {hasSpecialChar ? (
                                            <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-input" />
                                        )}
                                        <span className={hasSpecialChar ? 'text-success-foreground' : 'text-muted-foreground'}>
                                            Um caractere especial (@, #, $, etc.)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium border-t border-border pt-2 mt-1">
                                        {passwordsMatch ? (
                                            <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-input" />
                                        )}
                                        <span className={passwordsMatch ? 'text-success-foreground' : 'text-muted-foreground'}>
                                            As senhas coincidem
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Confirmar Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className={`w-full h-14 bg-muted border rounded-2xl pl-12 pr-4 focus:ring-4 outline-none transition-all text-foreground ${
                                        confirmPassword && !passwordsMatch 
                                        ? 'border-red-200 focus:border-red-400 focus:ring-red-100' 
                                        : confirmPassword && passwordsMatch
                                        ? 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100'
                                        : 'border-slate-200 focus:border-[#0076FF] focus:ring-blue-100'
                                    }`}
                                />
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="text-xs text-danger-foreground font-medium mt-1">As senhas não coincidem.</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            disabled={!isFormValid || loading}
                            className="w-full h-14 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Trocar Minha Senha</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}
