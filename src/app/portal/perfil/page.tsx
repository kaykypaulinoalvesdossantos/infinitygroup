'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    Lock,
    Save,
    Loader2,
    Phone,
    Mail,
    MapPin,
    FileText,
    Building2,
    CheckCircle,
    AlertCircle,
    Calendar,
    Shield,
    X,
} from 'lucide-react';
import { usersService } from '@/services/crud';

export default function ClientProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [userProfile, setUserProfile] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const user = await usersService.getMe();
            setUserProfile(user);
            setFormData((prev) => ({
                ...prev,
                name: user.name,
            }));

            localStorage.setItem('user', JSON.stringify(user));
        } catch (err: any) {
            console.error('Error loading profile:', err);
            if (err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMessage('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setSaving(false);
            return;
        }

        try {
            const updateData: any = { name: formData.name };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const updatedUser = await usersService.updateMe(updateData);

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserProfile(updatedUser);

            setSuccessMessage('Perfil atualizado com sucesso!');
            setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Meu Perfil</h1>
                    <p className="text-[#64748B] text-lg mt-1">
                        Gerencie suas informações pessoais e configurações de segurança
                    </p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-emerald-900">{successMessage}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSuccessMessage('')}
                            className="text-emerald-600 hover:bg-emerald-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-red-900 font-medium flex-1">{error}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError('')}
                            className="text-red-600 hover:bg-red-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Dados de Acesso */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-blue-50 to-white border-b border-blue-100">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <User className="h-5 w-5 text-[#0076FF]" />
                                </div>
                                Dados de Acesso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-[#64748B] uppercase">E-mail</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-[#0076FF]" />
                                    <p className="font-semibold text-[#1A1A1A] break-all">
                                        {userProfile?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-[#64748B] uppercase">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="font-semibold text-emerald-600">
                                        {userProfile?.active ? 'Conta Ativa' : 'Inativa'}
                                    </p>
                                </div>
                            </div>

                            {userProfile?.lastLoginAt && (
                                <div className="space-y-1 pt-3 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-[#64748B] uppercase">
                                        Último Acesso
                                    </p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <p className="text-[#64748B]">
                                            {new Date(userProfile.lastLoginAt).toLocaleDateString('pt-BR')} às{' '}
                                            {new Date(userProfile.lastLoginAt).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                                    <Shield className="h-4 w-4" />
                                    Seus dados estão protegidos
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações da Empresa */}
                    <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 bg-slate-100 rounded-xl">
                                    <Building2 className="h-5 w-5 text-slate-700" />
                                </div>
                                Informações da Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {userProfile?.client ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-[#64748B] uppercase">
                                            Razão Social / Nome
                                        </p>
                                        <p className="font-bold text-[#1A1A1A] text-lg">
                                            {userProfile.client.name}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-[#64748B] uppercase">Tipo</p>
                                        <p className="font-semibold text-[#1A1A1A]">
                                            {userProfile.client.type === 'pj'
                                                ? 'Pessoa Jurídica'
                                                : 'Pessoa Física'}
                                        </p>
                                    </div>

                                    {userProfile.client.document && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase">
                                                {userProfile.client.type === 'pj' ? 'CNPJ' : 'CPF'}
                                            </p>
                                            <p className="font-semibold text-[#1A1A1A]">
                                                {userProfile.client.document}
                                            </p>
                                        </div>
                                    )}

                                    {userProfile.client.email && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                E-mail Empresarial
                                            </p>
                                            <p className="font-semibold text-[#1A1A1A]">
                                                {userProfile.client.email}
                                            </p>
                                        </div>
                                    )}

                                    {userProfile.client.phone && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                Telefone
                                            </p>
                                            <p className="font-semibold text-[#1A1A1A]">
                                                {userProfile.client.phone}
                                            </p>
                                        </div>
                                    )}

                                    {userProfile.client.address && (
                                        <div className="md:col-span-2 space-y-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                Endereço
                                            </p>
                                            <p className="font-semibold text-[#1A1A1A]">
                                                {userProfile.client.address}
                                            </p>
                                        </div>
                                    )}

                                    {userProfile.client.notes && (
                                        <div className="md:col-span-2 bg-blue-50 border-2 border-blue-100 p-4 rounded-xl">
                                            <p className="text-xs font-semibold text-blue-900 mb-1 uppercase flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                Observações
                                            </p>
                                            <p className="text-blue-700 text-sm">{userProfile.client.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl">
                                    <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">
                                        Nenhuma informação empresarial vinculada
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Form de Edição */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <User className="h-5 w-5 text-[#0076FF]" />
                            </div>
                            Editar Informações Pessoais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Informações Básicas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-[#1A1A1A]">Dados Pessoais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold">
                                            Nome Completo <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Seu nome completo"
                                            required
                                            className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold">
                                            E-mail de Login
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            value={userProfile?.email || ''}
                                            disabled
                                            className="h-12 bg-slate-100 cursor-not-allowed border-2 border-slate-200 rounded-xl"
                                        />
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />O e-mail não pode ser alterado
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Segurança */}
                            <div className="pt-6 border-t-2 border-slate-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-orange-50 rounded-xl">
                                        <Lock className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A]">Alterar Senha</h3>
                                </div>
                                <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-xl mb-4">
                                    <p className="text-sm text-orange-700">
                                        💡 Deixe os campos em branco se não quiser alterar sua senha
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-semibold">
                                            Nova Senha
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Digite a nova senha"
                                            className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                                            Confirmar Nova Senha
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirme a nova senha"
                                            className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-6 border-t-2 border-slate-100">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="h-12 px-8 bg-[#0076FF] hover:bg-[#0060D0] text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold min-w-[180px]"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
