'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertCircle,
    AlertTriangle,
    Check,
    Copy,
    KeyRound,
    Loader2,
    Pencil,
    Plus,
    ShieldAlert,
    UserPlus,
} from 'lucide-react';
import {
    getStoredUser,
    isSupervisorRole,
    teamApi,
    TEAM_ROLE_LABEL,
    type TeamRole,
    type TeamUser,
} from '@/services/crm-leads';
import { cn } from '@/lib/utils';
import { errorMessage, formatDateTime, isValidEmail } from '@/components/admin/crm/format';

const ROLE_ORDER: TeamRole[] = ['SUPER_ADMIN', 'ADMIN', 'VENDEDOR', 'FINANCEIRO'];

function TemporaryPasswordBox({ password }: { password: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Não foi possível copiar. Selecione a senha e copie manualmente.');
        }
    };

    return (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Senha temporária</p>
            <div className="flex items-center gap-2">
                <code className="flex-1 select-all break-all rounded-lg bg-white px-3 py-2 font-mono text-base text-slate-900">{password}</code>
                <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copiar senha">
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <p className="flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                Esta senha é exibida apenas uma vez. Copie e repasse ao usuário agora. Ele deverá trocá-la no primeiro acesso.
            </p>
        </div>
    );
}

function DeviceStatus({ user }: { user: TeamUser }) {
    if (!user.device) return <span className="text-sm text-slate-400">Sem ramal</span>;
    const online = user.device.connected;
    return (
        <div className="space-y-0.5">
            <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', online ? 'text-emerald-600' : 'text-slate-500')}>
                <span className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-500' : 'bg-slate-300')} />
                {online ? 'Online' : 'Offline'}
            </span>
            {user.device.model && <span className="block text-xs text-slate-400">{user.device.model}</span>}
        </div>
    );
}

export default function EquipePage() {
    const [me, setMe] = useState<ReturnType<typeof getStoredUser>>(null);
    const [meReady, setMeReady] = useState(false);
    const canManage = isSupervisorRole(me?.role);
    const isSuperAdmin = String(me?.role ?? '').toUpperCase() === 'SUPER_ADMIN';

    const [users, setUsers] = useState<TeamUser[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // Novo usuario
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'VENDEDOR' as TeamRole, sendEmail: false });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createdUser, setCreatedUser] = useState<{ name: string; password: string } | null>(null);

    // Edicao
    const [editUser, setEditUser] = useState<TeamUser | null>(null);
    const [editForm, setEditForm] = useState({ name: '', role: 'VENDEDOR' as TeamRole });
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    // Desativar
    const [deactivateTarget, setDeactivateTarget] = useState<TeamUser | null>(null);

    // Redefinir senha
    const [resetTarget, setResetTarget] = useState<TeamUser | null>(null);
    const [resetting, setResetting] = useState(false);
    const [resetPassword, setResetPassword] = useState<string | null>(null);

    useEffect(() => {
        setMe(getStoredUser());
        setMeReady(true);
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            setUsers(await teamApi.list());
        } catch (err) {
            setLoadError(errorMessage(err, 'Não foi possível carregar a equipe.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (canManage) load();
    }, [canManage, load]);

    const roleOptions = ROLE_ORDER.filter((r) => r !== 'SUPER_ADMIN' || isSuperAdmin);

    const closeCreate = (open: boolean) => {
        if (creating) return;
        if (!open) {
            setCreateForm({ name: '', email: '', role: 'VENDEDOR', sendEmail: false });
            setCreateError('');
            setCreatedUser(null);
        }
        setCreateOpen(open);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.name.trim()) return setCreateError('Informe o nome do usuário.');
        if (!isValidEmail(createForm.email.trim())) return setCreateError('Informe um e-mail válido.');
        setCreating(true);
        setCreateError('');
        try {
            const created = await teamApi.create({
                name: createForm.name.trim(),
                email: createForm.email.trim(),
                role: createForm.role,
                sendEmail: createForm.sendEmail,
            });
            setCreatedUser({ name: created.name, password: created.temporaryPassword });
            toast.success('Usuário criado.');
            load();
        } catch (err) {
            setCreateError(errorMessage(err, 'Não foi possível criar o usuário.'));
        } finally {
            setCreating(false);
        }
    };

    const openEdit = (user: TeamUser) => {
        setEditUser(user);
        setEditForm({ name: user.name, role: user.role });
        setEditError('');
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;
        if (!editForm.name.trim()) return setEditError('Informe o nome do usuário.');
        setSavingEdit(true);
        setEditError('');
        try {
            await teamApi.update(editUser.id, { name: editForm.name.trim(), role: editForm.role });
            toast.success('Usuário atualizado.');
            setEditUser(null);
            load();
        } catch (err) {
            setEditError(errorMessage(err, 'Não foi possível salvar as alterações.'));
        } finally {
            setSavingEdit(false);
        }
    };

    const setActive = async (user: TeamUser, active: boolean) => {
        setTogglingId(user.id);
        try {
            await teamApi.update(user.id, { active });
            toast.success(active ? `${user.name} foi ativado.` : `${user.name} foi desativado.`);
            setDeactivateTarget(null);
            load();
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível alterar o status do usuário.'));
        } finally {
            setTogglingId(null);
        }
    };

    const handleReset = async () => {
        if (!resetTarget) return;
        setResetting(true);
        try {
            const res = await teamApi.resetPassword(resetTarget.id);
            setResetPassword(res.temporaryPassword);
        } catch (err) {
            toast.error(errorMessage(err, 'Não foi possível redefinir a senha.'));
            setResetTarget(null);
        } finally {
            setResetting(false);
        }
    };

    const closeReset = (open: boolean) => {
        if (resetting) return;
        if (!open) {
            setResetTarget(null);
            setResetPassword(null);
        }
    };

    if (!meReady) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#0076FF]" />
            </div>
        );
    }

    if (!canManage) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <Card className="max-w-md rounded-3xl border-slate-100 p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <ShieldAlert className="h-7 w-7" />
                    </div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Acesso restrito</h1>
                    <p className="mt-2 text-sm text-[#64748B]">Apenas administradores podem gerenciar a equipe.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-full space-y-6 p-4 md:p-8">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">Equipe</h1>
                    <p className="text-sm text-[#64748B]">Usuários internos, cargos e ramais dos vendedores</p>
                </div>
                <Button type="button" onClick={() => setCreateOpen(true)} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                    <UserPlus className="h-4 w-4" />
                    Novo usuário
                </Button>
            </header>

            {loadError && (
                <Alert variant="destructive" role="alert">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                        {loadError}
                        <Button type="button" size="sm" variant="outline" onClick={load}>
                            Tentar de novo
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <Card className="overflow-hidden rounded-2xl border-slate-100 p-0 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/70">
                                <TableHead>Nome</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead>Último acesso</TableHead>
                                <TableHead>Ramal</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(loading || !users) && !loadError &&
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={`sk-${i}`}>
                                        <TableCell colSpan={7}>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {users && users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500">
                                        Nenhum usuário interno cadastrado.
                                    </TableCell>
                                </TableRow>
                            )}
                            {users?.map((u) => {
                                const isSelf = u.id === me?.id;
                                return (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium text-slate-900">
                                            {u.name}
                                            {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(você)</span>}
                                        </TableCell>
                                        <TableCell className="text-slate-600">{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{TEAM_ROLE_LABEL[u.role] ?? u.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    aria-label={`${u.active ? 'Desativar' : 'Ativar'} ${u.name}`}
                                                    checked={u.active}
                                                    disabled={isSelf || togglingId === u.id}
                                                    onCheckedChange={(checked) => (checked ? setActive(u, true) : setDeactivateTarget(u))}
                                                />
                                                <span className="text-xs text-slate-500">{u.active ? 'Ativo' : 'Inativo'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-slate-600">
                                            {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Nunca'}
                                        </TableCell>
                                        <TableCell>
                                            <DeviceStatus user={u} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(u)} className="h-8">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setResetTarget(u)}
                                                    className="h-8"
                                                >
                                                    <KeyRound className="h-3.5 w-3.5" />
                                                    Redefinir senha
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Novo usuario */}
            <Dialog open={createOpen} onOpenChange={closeCreate}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{createdUser ? 'Usuário criado' : 'Novo usuário'}</DialogTitle>
                        <DialogDescription>
                            {createdUser
                                ? `${createdUser.name} já pode acessar o painel com a senha temporária abaixo.`
                                : 'O usuário deverá trocar a senha no primeiro acesso.'}
                        </DialogDescription>
                    </DialogHeader>

                    {createdUser ? (
                        <div className="space-y-5">
                            <TemporaryPasswordBox password={createdUser.password} />
                            <DialogFooter>
                                <Button type="button" onClick={() => closeCreate(false)} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                                    Concluir
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <form onSubmit={handleCreate} className="space-y-4">
                            {createError && (
                                <Alert variant="destructive" role="alert">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{createError}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-1.5">
                                <Label htmlFor="new-user-name">Nome *</Label>
                                <Input
                                    id="new-user-name"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                                    disabled={creating}
                                    maxLength={255}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-user-email">E-mail *</Label>
                                <Input
                                    id="new-user-email"
                                    type="email"
                                    autoComplete="off"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                                    disabled={creating}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-user-role">Cargo *</Label>
                                <Select
                                    value={createForm.role}
                                    onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v as TeamRole }))}
                                    disabled={creating}
                                >
                                    <SelectTrigger id="new-user-role" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {TEAM_ROLE_LABEL[r]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <Checkbox
                                    id="new-user-send"
                                    checked={createForm.sendEmail}
                                    onCheckedChange={(checked) => setCreateForm((f) => ({ ...f, sendEmail: checked === true }))}
                                    disabled={creating}
                                    className="mt-0.5"
                                />
                                <Label htmlFor="new-user-send" className="text-sm font-normal leading-snug text-slate-700">
                                    Enviar e-mail de acesso com a senha temporária
                                </Label>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-2">
                                <Button type="button" variant="outline" onClick={() => closeCreate(false)} disabled={creating}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={creating} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Criar usuário
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Editar */}
            <Dialog open={editUser !== null} onOpenChange={(open) => !open && !savingEdit && setEditUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar usuário</DialogTitle>
                        <DialogDescription>{editUser?.email}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        {editError && (
                            <Alert variant="destructive" role="alert">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{editError}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-user-name">Nome *</Label>
                            <Input
                                id="edit-user-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                disabled={savingEdit}
                                maxLength={255}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-user-role">Cargo</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(v) => setEditForm((f) => ({ ...f, role: v as TeamRole }))}
                                disabled={savingEdit}
                            >
                                <SelectTrigger id="edit-user-role" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {TEAM_ROLE_LABEL[r]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditUser(null)} disabled={savingEdit}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={savingEdit} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                                {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Desativar (confirmacao) */}
            <Dialog open={deactivateTarget !== null} onOpenChange={(open) => !open && togglingId === null && setDeactivateTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Desativar {deactivateTarget?.name}?</DialogTitle>
                        <DialogDescription>
                            O usuário perde o acesso ao painel. Se ele estiver com ramal conectado, o celular é desconectado e a fila de discagem
                            é interrompida imediatamente. Você pode reativá-lo depois.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button type="button" variant="outline" onClick={() => setDeactivateTarget(null)} disabled={togglingId !== null}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={togglingId !== null}
                            onClick={() => deactivateTarget && setActive(deactivateTarget, false)}
                        >
                            {togglingId !== null && <Loader2 className="h-4 w-4 animate-spin" />}
                            Desativar usuário
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Redefinir senha */}
            <Dialog open={resetTarget !== null} onOpenChange={closeReset}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{resetPassword ? 'Nova senha temporária' : `Redefinir senha de ${resetTarget?.name}?`}</DialogTitle>
                        <DialogDescription>
                            {resetPassword
                                ? 'Repasse a senha ao usuário. A senha atual deixou de funcionar.'
                                : 'A senha atual deixará de funcionar. Uma nova senha temporária será gerada e o usuário deverá trocá-la no próximo acesso.'}
                        </DialogDescription>
                    </DialogHeader>
                    {resetPassword ? (
                        <div className="space-y-5">
                            <TemporaryPasswordBox password={resetPassword} />
                            <DialogFooter>
                                <Button type="button" onClick={() => closeReset(false)} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                                    Concluir
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button type="button" variant="outline" onClick={() => closeReset(false)} disabled={resetting}>
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleReset} disabled={resetting} className="bg-[#0076FF] text-white hover:bg-[#0060D0]">
                                {resetting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Gerar nova senha
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
