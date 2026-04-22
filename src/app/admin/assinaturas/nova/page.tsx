'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Loader2,
    User,
    Package,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle2,
    X,
    Users,
    Link as LinkIcon,
    Key,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { clientsService, clientSubscriptionsService } from '@/services/crud';
import { authService } from '@/services/auth';

export default function NovaAssinaturaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [clients, setClients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        clientId: '',
        productName: '',
        description: '',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        contractDurationMonths: '',
        billingType: 'fixed',
        implementationFeeCents: '',
        monthlyFeeCents: '',
        pricePerUnitCents: '',
        includedUnits: '',
        currentUnits: '',
        externalCrmUrl: '',
        externalCrmApiKey: '',
        externalClientId: '',
        autoSyncUsers: false,
        minimumChargeCents: '',
        maximumChargeCents: '',
        billingDayOfMonth: '10',
    });

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadClients();
    }, [router]);

    const loadClients = async () => {
        try {
            setLoadingData(true);
            const data = await clientsService.getAll();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
            setError('Erro ao carregar clientes');
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validações
            if (!formData.clientId || !formData.productName || !formData.billingType) {
                setError('Preencha todos os campos obrigatórios');
                setLoading(false);
                return;
            }

            // Preparar dados para envio
            const payload: any = {
                clientId: Number(formData.clientId),
                productName: formData.productName,
                description: formData.description || null,
                status: formData.status,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                contractDurationMonths: formData.contractDurationMonths
                    ? Number(formData.contractDurationMonths)
                    : null,
                billingType: formData.billingType,
                implementationFeeCents: formData.implementationFeeCents
                    ? Number(formData.implementationFeeCents) * 100
                    : 0,
                monthlyFeeCents: formData.monthlyFeeCents ? Number(formData.monthlyFeeCents) * 100 : 0,
                pricePerUnitCents: formData.pricePerUnitCents
                    ? Number(formData.pricePerUnitCents) * 100
                    : 0,
                includedUnits: formData.includedUnits ? Number(formData.includedUnits) : 0,
                currentUnits: formData.currentUnits ? Number(formData.currentUnits) : 0,
                externalCrmUrl: formData.externalCrmUrl || null,
                externalCrmApiKey: formData.externalCrmApiKey || null,
                externalClientId: formData.externalClientId || null,
                autoSyncUsers: formData.autoSyncUsers,
                minimumChargeCents: formData.minimumChargeCents
                    ? Number(formData.minimumChargeCents) * 100
                    : 0,
                maximumChargeCents: formData.maximumChargeCents
                    ? Number(formData.maximumChargeCents) * 100
                    : 0,
                billingDayOfMonth: Number(formData.billingDayOfMonth),
            };

            await clientSubscriptionsService.create(payload);

            setSuccess(true);

            setTimeout(() => {
                router.push('/admin/clientes');
            }, 1500);
        } catch (error: any) {
            console.error('Error creating subscription:', error);
            setError(error.message || 'Erro ao criar assinatura');
        } finally {
            setLoading(false);
        }
    };

    const billingTypeLabels: Record<string, string> = {
        fixed: 'Fixo',
        per_user: 'Por Usuário',
        per_quantity: 'Por Quantidade',
        one_time: 'Pagamento Único',
        hybrid: 'Híbrido',
    };

    const showPerUnitFields = ['per_user', 'per_quantity', 'hybrid'].includes(formData.billingType);
    const showCrmFields = ['per_user', 'hybrid'].includes(formData.billingType);

    if (loadingData) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
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
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Nova Assinatura</h1>
                        <p className="text-[#64748B] text-lg mt-1">
                            Configure uma nova assinatura com cobrança flexível
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-emerald-900">Assinatura criada com sucesso!</p>
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
                        <p className="text-red-900 font-medium flex-1">{error}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="text-red-600 hover:bg-red-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cliente e Produto */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <User className="h-5 w-5 text-[#0076FF]" />
                                Informações Básicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="client" className="text-sm font-semibold text-[#1A1A1A]">
                                        Cliente <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.clientId}
                                        onValueChange={(value) => handleInputChange('clientId', value)}
                                    >
                                        <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl">
                                            <SelectValue placeholder="Selecione um cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={String(client.id)}>
                                                    {client.name} ({client.type === 'pf' ? 'PF' : 'PJ'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productName" className="text-sm font-semibold text-[#1A1A1A]">
                                        Nome do Produto <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="productName"
                                        value={formData.productName}
                                        onChange={(e) => handleInputChange('productName', e.target.value)}
                                        placeholder="Ex: Plano Pro"
                                        className="h-12 border-2 border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-[#1A1A1A]">
                                    Descrição
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Descrição do produto/serviço"
                                    className="border-2 border-slate-200 rounded-xl min-h-[80px]"
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-semibold text-[#1A1A1A]">
                                        Status
                                    </Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="trial">Trial</SelectItem>
                                            <SelectItem value="active">Ativa</SelectItem>
                                            <SelectItem value="paused">Pausada</SelectItem>
                                            <SelectItem value="canceled">Cancelada</SelectItem>
                                            <SelectItem value="ended">Encerrada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-sm font-semibold text-[#1A1A1A]">
                                        Data de Início <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="h-12 border-2 border-slate-200 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billingDayOfMonth" className="text-sm font-semibold text-[#1A1A1A]">
                                        Dia de Vencimento
                                    </Label>
                                    <Input
                                        id="billingDayOfMonth"
                                        type="number"
                                        min="1"
                                        max="28"
                                        value={formData.billingDayOfMonth}
                                        onChange={(e) => handleInputChange('billingDayOfMonth', e.target.value)}
                                        className="h-12 border-2 border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tipo de Cobrança */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-[#0076FF]" />
                                Modelo de Cobrança
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="billingType" className="text-sm font-semibold text-[#1A1A1A]">
                                    Tipo de Cobrança <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.billingType}
                                    onValueChange={(value) => handleInputChange('billingType', value)}
                                >
                                    <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(billingTypeLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-[#64748B]">
                                    {formData.billingType === 'fixed' && 'Valor mensal fixo'}
                                    {formData.billingType === 'per_user' && 'Cobrança baseada em quantidade de usuários'}
                                    {formData.billingType === 'per_quantity' &&
                                        'Cobrança baseada em quantidade de unidades'}
                                    {formData.billingType === 'one_time' && 'Pagamento único (não recorrente)'}
                                    {formData.billingType === 'hybrid' && 'Valor fixo + cobrança por usuário extra'}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="implementationFeeCents" className="text-sm font-semibold text-[#1A1A1A]">
                                        Taxa de Implementação (R$)
                                    </Label>
                                    <Input
                                        id="implementationFeeCents"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.implementationFeeCents}
                                        onChange={(e) => handleInputChange('implementationFeeCents', e.target.value)}
                                        placeholder="0.00"
                                        className="h-12 border-2 border-slate-200 rounded-xl"
                                    />
                                </div>

                                {formData.billingType !== 'one_time' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="monthlyFeeCents" className="text-sm font-semibold text-[#1A1A1A]">
                                            Mensalidade Base (R$)
                                        </Label>
                                        <Input
                                            id="monthlyFeeCents"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.monthlyFeeCents}
                                            onChange={(e) => handleInputChange('monthlyFeeCents', e.target.value)}
                                            placeholder="0.00"
                                            className="h-12 border-2 border-slate-200 rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>

                            {showPerUnitFields && (
                                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                    <div className="space-y-2">
                                        <Label htmlFor="pricePerUnitCents" className="text-sm font-semibold text-[#1A1A1A]">
                                            Preço por Unidade (R$)
                                        </Label>
                                        <Input
                                            id="pricePerUnitCents"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.pricePerUnitCents}
                                            onChange={(e) => handleInputChange('pricePerUnitCents', e.target.value)}
                                            placeholder="0.00"
                                            className="h-12 border-2 border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="includedUnits" className="text-sm font-semibold text-[#1A1A1A]">
                                            Unidades Inclusas
                                        </Label>
                                        <Input
                                            id="includedUnits"
                                            type="number"
                                            min="0"
                                            value={formData.includedUnits}
                                            onChange={(e) => handleInputChange('includedUnits', e.target.value)}
                                            placeholder="0"
                                            className="h-12 border-2 border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="currentUnits" className="text-sm font-semibold text-[#1A1A1A]">
                                            Quantidade Atual
                                        </Label>
                                        <Input
                                            id="currentUnits"
                                            type="number"
                                            min="0"
                                            value={formData.currentUnits}
                                            onChange={(e) => handleInputChange('currentUnits', e.target.value)}
                                            placeholder="0"
                                            className="h-12 border-2 border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Integração CRM */}
                    {showCrmFields && (
                        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                    <Users className="h-5 w-5 text-[#0076FF]" />
                                    Integração com CRM Externo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                    <div className="flex-1">
                                        <p className="font-semibold text-[#1A1A1A]">Sincronização Automática</p>
                                        <p className="text-sm text-[#64748B]">
                                            Buscar quantidade de usuários do CRM automaticamente
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.autoSyncUsers}
                                        onCheckedChange={(checked) => handleInputChange('autoSyncUsers', checked)}
                                    />
                                </div>

                                {formData.autoSyncUsers && (
                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="externalCrmUrl" className="text-sm font-semibold text-[#1A1A1A]">
                                                URL do CRM
                                            </Label>
                                            <Input
                                                id="externalCrmUrl"
                                                type="url"
                                                value={formData.externalCrmUrl}
                                                onChange={(e) => handleInputChange('externalCrmUrl', e.target.value)}
                                                placeholder="https://crm.example.com"
                                                className="h-12 border-2 border-slate-200 rounded-xl"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="externalClientId" className="text-sm font-semibold text-[#1A1A1A]">
                                                    ID do Cliente no CRM
                                                </Label>
                                                <Input
                                                    id="externalClientId"
                                                    value={formData.externalClientId}
                                                    onChange={(e) => handleInputChange('externalClientId', e.target.value)}
                                                    placeholder="client-123"
                                                    className="h-12 border-2 border-slate-200 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="externalCrmApiKey" className="text-sm font-semibold text-[#1A1A1A]">
                                                    Chave de API
                                                </Label>
                                                <Input
                                                    id="externalCrmApiKey"
                                                    type="password"
                                                    value={formData.externalCrmApiKey}
                                                    onChange={(e) => handleInputChange('externalCrmApiKey', e.target.value)}
                                                    placeholder="Bearer token..."
                                                    className="h-12 border-2 border-slate-200 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Limites de Cobrança */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-[#0076FF]" />
                                Limites de Cobrança (Opcional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minimumChargeCents" className="text-sm font-semibold text-[#1A1A1A]">
                                        Valor Mínimo (R$)
                                    </Label>
                                    <Input
                                        id="minimumChargeCents"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.minimumChargeCents}
                                        onChange={(e) => handleInputChange('minimumChargeCents', e.target.value)}
                                        placeholder="0.00"
                                        className="h-12 border-2 border-slate-200 rounded-xl"
                                    />
                                    <p className="text-xs text-[#64748B]">Valor mínimo a ser cobrado por mês</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maximumChargeCents" className="text-sm font-semibold text-[#1A1A1A]">
                                        Valor Máximo (R$)
                                    </Label>
                                    <Input
                                        id="maximumChargeCents"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.maximumChargeCents}
                                        onChange={(e) => handleInputChange('maximumChargeCents', e.target.value)}
                                        placeholder="0.00"
                                        className="h-12 border-2 border-slate-200 rounded-xl"
                                    />
                                    <p className="text-xs text-[#64748B]">Valor máximo a ser cobrado por mês</p>
                                </div>
                            </div>
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
                            disabled={loading || !formData.clientId || !formData.productName}
                            className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 font-semibold min-w-[180px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Criar Assinatura
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
