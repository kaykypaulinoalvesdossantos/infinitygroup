'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    ArrowLeft,
    Save,
    Loader2,
    User,
    Building2,
    Mail,
    Phone,
    MapPin,
    FileText,
    Power,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { clientsService } from '@/services/crud';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function EditarClientePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [isCompany, setIsCompany] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        active: true,
        login: '',
        password: '',
    });

    useEffect(() => {
        if (params.id) {
            loadClient();
        }
    }, [params.id]);

    const loadClient = async () => {
        try {
            setPageLoading(true);
            const id = Number(params.id);
            if (isNaN(id)) throw new Error('ID inválido');

            const client = await clientsService.getById(id);

            setIsCompany(client.type === 'pj');

            // Pegar login do primeiro usuário vinculado
            const userLogin = client.users && client.users.length > 0 ? client.users[0].email : '';

            setFormData({
                name: client.name || '',
                document: client.document || '',
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                notes: client.notes || '',
                active: client.active,
                login: userLogin,
                password: '', // Nunca preencher senha por segurança
            });
        } catch (error: any) {
            console.error('Error loading client:', error);
            setError('Não foi possível carregar os dados do cliente.');
        } finally {
            setPageLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const clientData: any = {
                type: isCompany ? 'pj' : 'pf',
                name: formData.name,
                document: formData.document || undefined,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                notes: formData.notes || undefined,
                active: formData.active,
                login: formData.login || undefined,
            };

            // Só enviar senha se foi preenchida
            if (formData.password && formData.password.trim() !== '') {
                clientData.password = formData.password;
            }

            await clientsService.update(Number(params.id), clientData);
            setSuccess(true);

            // Redirecionar após 1.5s
            setTimeout(() => {
                router.push(`/admin/clientes/${params.id}`);
            }, 1500);
        } catch (error: any) {
            console.error('Error updating client:', error);
            setError(error.response?.data?.message || 'Erro ao atualizar cliente');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    if (pageLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium">Carregando dados do cliente...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen flex items-center justify-center">
                <Card className="border-0 shadow-xl shadow-red-200/50 max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-red-100 rounded-full mb-4">
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-[#1A1A1A]">Erro ao carregar</h2>
                        <p className="text-[#64748B] mb-6">{error}</p>
                        <Button
                            className="bg-[#0076FF] hover:bg-[#0060D0] text-white rounded-xl shadow-lg"
                            onClick={() => router.push('/admin/clientes')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para Lista de Clientes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-white border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm mt-1"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-5 w-5 text-[#64748B]" />
                        </Button>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                                <AvatarFallback className="bg-gradient-to-br from-[#0076FF] to-[#00D4FF] text-white font-bold text-xl">
                                    {getInitials(formData.name || 'Cliente')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold text-[#1A1A1A]">Editar Cliente</h1>
                                <p className="text-[#64748B] text-lg mt-1">Atualize as informações cadastrais</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-emerald-900">Cliente atualizado com sucesso!</p>
                            <p className="text-sm text-emerald-700">Redirecionando...</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-red-900 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo e Status */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <Power className="h-5 w-5 text-[#0076FF]" />
                                Configurações do Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Tipo de Cliente - Apenas visualização */}
                                <div className="p-5 rounded-xl border-2 border-slate-200 bg-slate-50">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                                            {isCompany ? <Building2 className="h-4 w-4 text-orange-600" /> : <User className="h-4 w-4 text-purple-600" />}
                                            Tipo de Cliente
                                        </Label>
                                        <Badge
                                            variant="outline"
                                            className={`text-sm font-semibold px-3 py-1.5 ${isCompany
                                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                                : 'border-purple-300 bg-purple-50 text-purple-700'
                                                }`}
                                        >
                                            {isCompany ? 'Pessoa Jurídica (CNPJ)' : 'Pessoa Física (CPF)'}
                                        </Badge>
                                        <p className="text-xs text-[#64748B] italic">
                                            O tipo não pode ser alterado após o cadastro
                                        </p>
                                    </div>
                                </div>

                                {/* Status - Com switch funcional */}
                                <div className="p-5 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <Label className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                                                <Power className="h-4 w-4" />
                                                Status do Cadastro
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`font-semibold ${formData.active
                                                    ? 'bg-emerald-500 hover:bg-emerald-500 text-white'
                                                    : 'bg-slate-400 hover:bg-slate-400 text-white'
                                                    }`}>
                                                    {formData.active ? 'ATIVO' : 'INATIVO'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-[#64748B]">
                                                {formData.active ? 'Cliente ativo no sistema' : 'Cliente bloqueado/inativo'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 pt-1">
                                            <Switch
                                                checked={formData.active}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, active: checked })
                                                }
                                            />
                                            <span className="text-xs font-medium text-[#64748B]">
                                                {formData.active ? 'ON' : 'OFF'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados Básicos */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#0076FF]" />
                                Dados Básicos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Nome */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                                        {isCompany ? 'Razão Social' : 'Nome Completo'}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder={isCompany ? 'Digite a razão social' : 'Digite o nome completo'}
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                {/* Documento */}
                                <div className="space-y-2">
                                    <Label htmlFor="document" className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
                                        {isCompany ? 'CNPJ' : 'CPF'}
                                    </Label>
                                    <Input
                                        id="document"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all font-mono placeholder:text-slate-400"
                                        placeholder={isCompany ? 'Digite o CNPJ' : 'Digite o CPF'}
                                        value={formData.document}
                                        onChange={(e) =>
                                            setFormData({ ...formData, document: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações de Contato */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <Mail className="h-5 w-5 text-[#0076FF]" />
                                Informações de Contato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 text-[#0076FF]" />
                                        Email Principal
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder="Digite o email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Telefone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-[#0076FF]" />
                                        Telefone / WhatsApp
                                    </Label>
                                    <Input
                                        id="phone"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder="Digite o telefone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-[#0076FF]" />
                                    Endereço Completo
                                </Label>
                                <Textarea
                                    id="address"
                                    className="border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all min-h-[100px] resize-none placeholder:text-slate-400"
                                    placeholder="Digite o endereço completo"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                />
                                <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                                    <AlertCircle className="h-3 w-3" />
                                    Mantenha o endereço completo para facilitar a localização
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados de Acesso */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <User className="h-5 w-5 text-[#0076FF]" />
                                Dados de Acesso ao Sistema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Login */}
                                <div className="space-y-2">
                                    <Label htmlFor="login" className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
                                        Login / Usuário
                                    </Label>
                                    <Input
                                        id="login"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder="Digite o login"
                                        value={formData.login}
                                        onChange={(e) =>
                                            setFormData({ ...formData, login: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Senha */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">
                                        Nova Senha
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder="Deixe em branco para manter a atual"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                    />
                                    <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                                        <AlertCircle className="h-3 w-3" />
                                        A senha só será alterada se você preencher este campo
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observações */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#0076FF]" />
                                Observações Internas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Textarea
                                    id="notes"
                                    className="border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all min-h-[120px] resize-none placeholder:text-slate-400"
                                    placeholder="Digite observações sobre o cliente"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                />
                                <p className="text-xs text-[#64748B]">
                                    Estas informações são privadas e não serão compartilhadas com o cliente
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-2 border-slate-200 hover:bg-slate-50 font-semibold"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 rounded-xl bg-[#0076FF] hover:bg-[#0060D0] text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold min-w-[180px]"
                        >
                            {loading ? (
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
            </div>
        </div>
    );
}
