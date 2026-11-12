'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff, Loader2, LogOut, Smartphone } from 'lucide-react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/hooks/ramal/useNativeTelephony';
import { authService } from '@/services/auth';
import { isSalesRole } from '@/services/crm-leads';

interface RamalUser {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  mustChangePassword?: boolean;
}

interface LoginResponse {
  access_token: string;
  user: RamalUser;
}

type AuthView =
  | { kind: 'loading' }
  | { kind: 'login' }
  | { kind: 'denied' }
  | { kind: 'password' }
  | { kind: 'ready'; user: RamalUser };

/** Mesma regra do login: token/usuario em localStorage ('token' e 'user'). */
function viewForUser(user: RamalUser): AuthView {
  if (!isSalesRole(user.role)) return { kind: 'denied' };
  if (user.mustChangePassword) return { kind: 'password' };
  return { kind: 'ready', user };
}

function readStoredView(): AuthView {
  if (!authService.isAuthenticated()) return { kind: 'login' };
  const user = authService.getCurrentUser() as RamalUser | null;
  if (!user) return { kind: 'login' };
  return viewForUser(user);
}

function clearStoredSession(): void {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    // armazenamento indisponivel: nada a limpar
  }
}

export default function RamalLayout({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AuthView>({ kind: 'loading' });

  // Leitura da sessao so no cliente (evita divergencia de renderizacao no SSR)
  useEffect(() => {
    setView(readStoredView());
  }, []);

  const logout = () => {
    clearStoredSession();
    setView({ kind: 'login' });
  };

  const user = view.kind === 'ready' ? view.user : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0076FF]/10 text-[#0076FF]">
              <Smartphone className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">Infinity Ramal</p>
              {user?.name && <p className="truncate text-xs text-slate-500">{user.name}</p>}
            </div>
          </div>
          {view.kind !== 'login' && view.kind !== 'loading' && (
            <Button variant="ghost" className="h-11 rounded-xl px-3 text-slate-700" onClick={logout}>
              <LogOut className="mr-1.5 h-4 w-4" />
              Sair
            </Button>
          )}
        </div>
      </header>

      <main className="min-w-0">
        {view.kind === 'loading' && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Carregando" />
          </div>
        )}

        {view.kind === 'login' && <RamalLogin onAuthenticated={setView} />}

        {view.kind === 'denied' && (
          <div className="mx-auto max-w-xl px-4 py-10">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <AlertCircle className="h-10 w-10 text-amber-500" />
                <p className="text-base font-semibold">Seu usuário não tem acesso ao ramal</p>
                <p className="text-sm text-slate-600">
                  Peça ao administrador para liberar o perfil de vendedor ou entre com outra conta.
                </p>
                <Button variant="outline" className="h-12 w-full rounded-xl" onClick={logout}>
                  Entrar com outra conta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {view.kind === 'password' && (
          <div className="mx-auto max-w-xl px-4 py-10">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <AlertCircle className="h-10 w-10 text-amber-500" />
                <p className="text-base font-semibold">Troque sua senha para continuar</p>
                <p className="text-sm text-slate-600">
                  Este é o seu primeiro acesso. Defina uma senha pessoal antes de usar o ramal.
                </p>
                <Button asChild className="h-12 w-full rounded-xl">
                  <Link href="/admin/primeiro-acesso">Trocar senha</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {view.kind === 'ready' && children}
      </main>

      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

function RamalLogin({ onAuthenticated }: { onAuthenticated: (view: AuthView) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = (await authService.login({ email, password })) as LoginResponse | null;
      if (!data || !data.access_token || !data.user) {
        setError('Resposta inesperada do servidor. Tente novamente.');
        return;
      }
      // Papel validado antes de salvar qualquer dado da sessão
      if (!isSalesRole(data.user.role)) {
        onAuthenticated({ kind: 'denied' });
        return;
      }
      try {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        setError('Não foi possível salvar sua sessão neste aparelho.');
        return;
      }
      onAuthenticated(viewForUser(data.user));
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível entrar. Verifique e-mail e senha.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Entrar no ramal</CardTitle>
          <CardDescription>Use o mesmo e-mail e senha do painel Infinity Groups.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ramal-email">E-mail</Label>
              <Input
                id="ramal-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ramal-password">Senha</Label>
              <div className="relative">
                <Input
                  id="ramal-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="h-12 rounded-xl pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
