'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
    AlertCircle,
    CheckCircle,
    Package,
    DollarSign,
    Calendar,
    Plus,
    Trash2
} from 'lucide-react';
import { clientsService } from '@/services/crud';

export default function NovoClientePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        password: '',
        subscriptions: [
            {
                productName: '',
                description: '',
                monthlyFeeCents: 0,
                implementationFeeCents: 0,
                billingDayOfMonth: 10,
                startDate: new Date().toISOString().split('T')[0],
                contractDurationMonths: 12,
            },
        ],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validações
            if (!formData.name || !formData.email || !formData.password) {
                setError('Preencha todos os campos obrigatórios');
                setLoading(false);
                return;
            }

            if (formData.password.length < 8) {
                setError('A senha deve ter no mínimo 8 caracteres');
                setLoading(false);
                return;
            }

            // Validar subscriptions
            const hasEmptyProduct = formData.subscriptions.some(
                (sub) => !sub.productName || sub.monthlyFeeCents <= 0
            );
            if (hasEmptyProduct) {
                setError('Preencha o nome e valor de todos os produtos');
                setLoading(false);
                return;
            }

            const clientData = {
                type: isCompany ? 'pj' : 'pf',
                name: formData.name,
                document: formData.document || undefined,
                email: formData.email,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                notes: formData.notes || undefined,
                password: formData.password,
                subscriptions: formData.subscriptions,
            };

            await clientsService.create(clientData);
            setSuccess(true);

            // Redirecionar após 1.5s
            setTimeout(() => {
                router.push('/admin/clientes');
            }, 1500);
        } catch (error: any) {
            console.error('Error creating client:', error);
            setError(error.response?.data?.message || 'Erro ao criar cliente');
        } finally {
            setLoading(false);
        }
    };

    const addSubscription = () => {
        setFormData({
            ...formData,
            subscriptions: [
                ...formData.subscriptions,
                {
                    productName: '',
                    description: '',
                    monthlyFeeCents: 0,
                    implementationFeeCents: 0,
                    billingDayOfMonth: 10,
                    startDate: new Date().toISOString().split('T')[0],
                    contractDurationMonths: 12,
                },
            ],
        });
    };

    const removeSubscription = (index: number) => {
        if (formData.subscriptions.length > 1) {
            const newSubscriptions = formData.subscriptions.filter((_, i) => i !== index);
            setFormData({ ...formData, subscriptions: newSubscriptions });
        }
    };

    const updateSubscription = (index: number, field: string, value: any) => {
        const newSubscriptions = [...formData.subscriptions];
        (newSubscriptions[index] as any)[field] = value;
        setFormData({ ...formData, subscriptions: newSubscriptions });
    };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-white border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm mt-1"
                        onClick={() => router.push('/admin/clientes')}
                    >
                        <ArrowLeft className="h-5 w-5 text-[#64748B]" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Novo Cliente</h1>
                        <p className="text-[#64748B] text-lg mt-1">
                            Cadastre um novo cliente e configure seus serviços
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-emerald-900">Cliente criado com sucesso!</p>
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
                    {/* Tipo de Cliente */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A]">
                                Tipo de Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="p-5 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <Label className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                                            {isCompany ? (
                                                <Building2 className="h-4 w-4 text-orange-600" />
                                            ) : (
                                                <User className="h-4 w-4 text-purple-600" />
                                            )}
                                            Tipo Selecionado
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
                                        <p className="text-xs text-[#64748B]">
                                            {isCompany
                                                ? 'Empresas, organizações e pessoas jurídicas'
                                                : 'Indivíduos e pessoas físicas'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 pt-1">
                                        <Switch
                                            checked={isCompany}
                                            onCheckedChange={setIsCompany}
                                        />
                                        <span className="text-xs font-medium text-[#64748B]">
                                            {isCompany ? 'PJ' : 'PF'}
                                        </span>
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
                                    <Label
                                        htmlFor="name"
                                        className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2"
                                    >
                                        {isCompany ? 'Razão Social' : 'Nome Completo'}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder={
                                            isCompany ? 'Digite a razão social' : 'Digite o nome completo'
                                        }
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                {/* Documento */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="document"
                                        className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide"
                                    >
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

                    {/* Dados de Acesso */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <User className="h-5 w-5 text-[#0076FF]" />
                                Dados de Acesso ao Portal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2"
                                    >
                                        <Mail className="h-3.5 w-3.5 text-[#0076FF]" />
                                        Email / Login
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="off"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder="Digite o email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                    <p className="text-xs text-[#64748B]">
                                        Será usado para login no portal do cliente
                                    </p>
                                </div>

                                {/* Senha */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide"
                                    >
                                        Senha de Acesso
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder="Mínimo 8 caracteres"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
                                    />
                                    <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                                        <AlertCircle className="h-3 w-3" />
                                        Mínimo de 8 caracteres
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações de Contato */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <Phone className="h-5 w-5 text-[#0076FF]" />
                                Informações de Contato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Telefone */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2"
                                    >
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

                                {/* Endereço */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="address"
                                        className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2"
                                    >
                                        <MapPin className="h-3.5 w-3.5 text-[#0076FF]" />
                                        Endereço
                                    </Label>
                                    <Input
                                        id="address"
                                        className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all placeholder:text-slate-400"
                                        placeholder="Digite o endereço"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Produtos/Serviços */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                    <Package className="h-5 w-5 text-[#0076FF]" />
                                    Produtos e Serviços
                                </CardTitle>
                                <Badge className="bg-[#0076FF] hover:bg-[#0076FF]">
                                    {formData.subscriptions.length}{' '}
                                    {formData.subscriptions.length === 1 ? 'produto' : 'produtos'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {formData.subscriptions.map((sub, index) => (
                                <div
                                    key={index}
                                    className="border-2 border-slate-200 rounded-xl p-5 space-y-4 bg-gradient-to-br from-white to-slate-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-[#1A1A1A]">Produto {index + 1}</h4>
                                        {formData.subscriptions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSubscription(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-semibold text-[#1A1A1A]">
                                                Nome do Produto/Serviço *
                                            </Label>
                                            <Input
                                                className="h-11 border-2 border-slate-200 rounded-lg placeholder:text-slate-400"
                                                placeholder="Ex: Sistema ERP, Consultoria..."
                                                value={sub.productName}
                                                onChange={(e) =>
                                                    updateSubscription(index, 'productName', e.target.value)
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-semibold text-[#1A1A1A]">
                                                Descrição
                                            </Label>
                                            <Input
                                                className="h-11 border-2 border-slate-200 rounded-lg placeholder:text-slate-400"
                                                placeholder="Descrição do produto..."
                                                value={sub.description}
                                                onChange={(e) =>
                                                    updateSubscription(index, 'description', e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Mensalidade (R$) *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-11 border-2 border-slate-200 rounded-lg placeholder:text-slate-400"
                                                placeholder="0.00"
                                                value={sub.monthlyFeeCents / 100}
                                                onChange={(e) =>
                                                    updateSubscription(
                                                        index,
                                                        'monthlyFeeCents',
                                                        Number(e.target.value) * 100
                                                    )
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Taxa de Implementação (R$)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-11 border-2 border-slate-200 rounded-lg placeholder:text-slate-400"
                                                placeholder="0.00"
                                                value={sub.implementationFeeCents / 100}
                                                onChange={(e) =>
                                                    updateSubscription(
                                                        index,
                                                        'implementationFeeCents',
                                                        Number(e.target.value) * 100
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#1A1A1A]">
                                                Dia do Vencimento
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                className="h-11 border-2 border-slate-200 rounded-lg"
                                                value={sub.billingDayOfMonth}
                                                onChange={(e) =>
                                                    updateSubscription(
                                                        index,
                                                        'billingDayOfMonth',
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Data de Início
                                            </Label>
                                            <Input
                                                type="date"
                                                className="h-11 border-2 border-slate-200 rounded-lg"
                                                value={sub.startDate}
                                                onChange={(e) =>
                                                    updateSubscription(index, 'startDate', e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-[#1A1A1A]">
                                                Duração do Contrato (meses)
                                            </Label>
                                            <Input
                                                type="number"
                                                className="h-11 border-2 border-slate-200 rounded-lg"
                                                value={sub.contractDurationMonths}
                                                onChange={(e) =>
                                                    updateSubscription(
                                                        index,
                                                        'contractDurationMonths',
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-[#0076FF] hover:bg-blue-50 rounded-xl"
                                onClick={addSubscription}
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Adicionar Outro Produto
                            </Button>
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
                            <Textarea
                                className="border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 transition-all min-h-[120px] resize-none placeholder:text-slate-400"
                                placeholder="Digite observações sobre o cliente (opcional)"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-2 border-slate-200 hover:bg-slate-50 font-semibold"
                            onClick={() => router.push('/admin/clientes')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 font-semibold min-w-[180px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" />
                                    Criar Cliente
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
