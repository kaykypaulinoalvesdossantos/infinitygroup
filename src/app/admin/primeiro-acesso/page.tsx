'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { usersService } from '@/services/users';
import { getStoredUser } from '@/services/crm-leads';
import { defaultAdminPath } from '@/lib/admin-access';

export default function AdminPrimeiroAcessoPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

            // Limpa a flag antes de sair da tela, para o layout nao devolver o usuario para ca
            const role = getStoredUser()?.role;
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.mustChangePassword = false;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch {
                // usuario armazenado ilegivel: o layout trata na proxima navegacao
            }

            setSuccess(true);
            setTimeout(() => {
                router.replace(defaultAdminPath(role));
            }, 2500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar sua senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
                    <Card className="rounded-3xl border-border p-8 shadow-xl shadow-blue-500/5">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-success text-success-foreground">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h1 className="mb-3 text-2xl font-bold text-foreground">Senha alterada!</h1>
                        <p className="mb-8 leading-relaxed text-muted-foreground">
                            Sua nova senha foi configurada com sucesso. Você já pode usar o painel.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Redirecionando...
                        </div>
                    </Card>
                </motion.div>
            </main>
        );
    }

    const rule = (ok: boolean, text: string) => (
        <div className="flex items-center gap-2 text-xs font-medium">
            {ok ? (
                <CheckCircle2 className="h-4 w-4 text-success-foreground" />
            ) : (
                <div className="h-4 w-4 rounded-full border-2 border-border" />
            )}
            <span className={ok ? 'text-success-foreground' : 'text-muted-foreground'}>{text}</span>
        </div>
    );

    return (
        <main className="flex min-h-[70vh] items-center justify-center p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-blue-500/10">
                <div className="h-2 w-full bg-gradient-to-r from-primary to-primary-hover" />
                <div className="p-6 md:p-10">
                    <div className="mb-8 flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-info text-info-foreground">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Configure sua senha</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Este é seu primeiro acesso. Crie uma senha pessoal para continuar.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-start gap-3 rounded-2xl border border-danger-border bg-danger p-4"
                        >
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-foreground" />
                            <p className="text-sm font-medium text-danger-foreground">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Nova senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="new-password"
                                    name="new-password"
                                    autoComplete="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className="h-14 w-full rounded-2xl border border-border bg-muted/50 pl-12 pr-12 text-foreground outline-none transition-all focus:border-ring focus:ring-4 focus:ring-info-border/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {password && (
                                <div className="grid grid-cols-1 gap-2 pt-2">
                                    {rule(hasMinLength, 'Mínimo 8 caracteres')}
                                    {rule(hasNumber, 'Pelo menos um número')}
                                    {rule(hasSpecialChar, 'Um caractere especial (@, #, $, etc.)')}
                                    <div className="mt-1 border-t border-border pt-2">{rule(passwordsMatch, 'As senhas coincidem')}</div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Confirmar senha
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    autoComplete="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className={`h-14 w-full rounded-2xl border bg-muted/50 pl-12 pr-4 text-foreground outline-none transition-all focus:ring-4 ${
                                        confirmPassword && !passwordsMatch
                                            ? 'border-danger-border focus:border-danger-border focus:ring-danger-border/50'
                                            : confirmPassword && passwordsMatch
                                                ? 'border-success-border focus:border-success-border focus:ring-success-border/50'
                                                : 'border-border focus:border-ring focus:ring-info-border/50'
                                    }`}
                                />
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="mt-1 text-xs font-medium text-danger-foreground">As senhas não coincidem.</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={!isFormValid || loading}
                            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-primary-foreground shadow-xl shadow-blue-500/20 transition-all hover:bg-primary-hover"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Salvar nova senha</span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}
