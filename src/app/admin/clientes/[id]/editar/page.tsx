'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Save,
    Loader2,
    Package,
    MapPin,
    AlertCircle,
    CheckCircle,
    Building2,
    User,
    DollarSign,
    Calendar,
    Settings,
    Shield,
    Plus
} from 'lucide-react';
import { clientsService } from '@/services/crud';
import { apiRequest } from '@/services/api';

export default function EditarClientePage() {
    const router = useRouter();
    const params = useParams();
    const clientId = Number(params.id);

    const [loadingData, setLoadingData] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Aba 1: Dados do Cliente
    const [isCompany, setIsCompany] = useState(false);
    const [clientData, setClientData] = useState({
        name: '',
        document: '',
        userId: null as number | null,
        loginEmail: '',
        password: '',
        phone: '',
        address: {
            zipCode: '',
            street: '',
            streetNumber: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: ''
        },
        notes: '',
    });

    // Aba 2: Novo Produto
    const [newProduct, setNewProduct] = useState({
        productName: '',
        description: '',
        monthlyFeeCents: 0,
        implementationFeeCents: 0,
        billingDayOfMonth: 10,
        startDate: new Date().toISOString().split('T')[0],
        contractDurationMonths: 12,
        productType: 'SITE',
        isProrataEnabled: true,
        isLifetime: false,
        crmBillingType: 'FIXED', 
        crmTenantId: '',
        responsibleName: '',
        responsibleEmail: ''
    });

    useEffect(() => {
        if (!isNaN(clientId)) loadClient();
    }, [clientId]);

    const loadClient = async () => {
        try {
            setLoadingData(true);
            const data = await clientsService.getById(clientId);
            setIsCompany(data.type === 'pj');
            
            // Tratamento do endereço
            let addressObj = { zipCode: '', street: '', streetNumber: '', complement: '', neighborhood: '', city: '', state: '' };
            if (data.address && typeof data.address === 'object') {
                addressObj = { ...addressObj, ...data.address };
            } else if (typeof data.address === 'string') {
                // Legacy
                addressObj.street = data.address;
            }

            const masterUser = data.users && data.users.length > 0 ? data.users[0] : null;

            setClientData({
                name: data.name || '',
                document: data.document || '',
                userId: masterUser ? masterUser.id : null,
                loginEmail: masterUser ? masterUser.email : data.email || '',
                password: '',
                phone: data.phone || '',
                address: addressObj,
                notes: data.notes || '',
            });
        } catch (error) {
            console.error('Error', error);
            setError('Não foi possível carregar o cliente.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let cep = e.target.value.replace(/\D/g, '');
        let maskedCep = cep;
        if (cep.length > 5) maskedCep = cep.replace(/^(\d{5})(\d{1,3})/, '$1-$2');

        setClientData(prev => ({ ...prev, address: { ...prev.address, zipCode: maskedCep } }));

        if (cep.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setClientData(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: data.logradouro,
                            neighborhood: data.bairro,
                            city: data.localidade,
                            state: data.uf
                        }
                    }));
                }
            } catch (e) {
                console.error("ViaCEP erro", e);
            }
        }
    };

    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSave(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: any = {
                type: isCompany ? 'pj' : 'pf',
                name: clientData.name,
                document: clientData.document,
                phone: clientData.phone,
                loginEmail: clientData.loginEmail,
                address: clientData.address.zipCode ? {
                    zipCode: clientData.address.zipCode.replace(/\D/g, ''),
                    street: clientData.address.street,
                    streetNumber: clientData.address.streetNumber || 'S/N',
                    complement: clientData.address.complement,
                    neighborhood: clientData.address.neighborhood,
                    city: clientData.address.city,
                    state: clientData.address.state
                } : undefined,
                notes: clientData.notes
            };

            if (clientData.password) {
                payload.password = clientData.password;
            }

            await clientsService.update(clientId, payload);
            setSuccess('Dados cadastrais atualizados com sucesso!');
        } catch (error: any) {
            setError(error.message || 'Erro ao atualizar dados');
        } finally {
            setLoadingSave(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSave(true);
        setError(null);
        setSuccess(null);

        try {
            if (!newProduct.productName || newProduct.monthlyFeeCents <= 0) {
                throw new Error("Nome e Mensalidade são obrigatórios");
            }

            const isCrm = newProduct.productType === 'CRM_TELECOM';
            const payload = {
                productType: newProduct.productType,
                productName: newProduct.productName,
                description: newProduct.description,
                monthlyFeeCents: newProduct.monthlyFeeCents,
                implementationFeeCents: newProduct.implementationFeeCents,
                billingDayOfMonth: newProduct.billingDayOfMonth,
                startDate: newProduct.startDate,
                contractDurationMonths: newProduct.contractDurationMonths,
                isProrataEnabled: newProduct.isProrataEnabled,
                isLifetime: newProduct.isLifetime,
                crmTenantId: isCrm && newProduct.crmTenantId ? newProduct.crmTenantId : undefined,
                crmBillingType: isCrm ? newProduct.crmBillingType : undefined,
                responsibleName: isCrm ? newProduct.responsibleName : undefined,
                responsibleEmail: isCrm ? newProduct.responsibleEmail : undefined,
            };

            await apiRequest(`/clients/${clientId}/products`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setSuccess('Novo produto adicionado e faturado!');
            // Reset
            setNewProduct({
                ...newProduct,
                productName: '',
                monthlyFeeCents: 0,
                crmTenantId: ''
            });
        } catch (error: any) {
            setError(error.message || 'Erro ao adicionar produto');
        } finally {
            setLoadingSave(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0076FF] border-t-transparent"></div>
                    <p className="text-[#64748B] font-medium">Carregando edição...</p>
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
                        className="bg-white border-slate-200 hover:bg-slate-50 rounded-xl mt-1"
                        onClick={() => router.push(`/admin/clientes/${clientId}`)}
                    >
                        <ArrowLeft className="h-5 w-5 text-[#64748B]" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Gerenciar Cliente</h1>
                        <p className="text-[#64748B] text-lg mt-1">Atualize informações ou associe novos serviços</p>
                    </div>
                </div>

                {success && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <p className="font-semibold text-emerald-900">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-900 font-medium">{error}</p>
                    </div>
                )}

                <Tabs defaultValue="dados" className="space-y-6">
                    <TabsList className="bg-white border-0 shadow-lg shadow-slate-200/50 p-1.5 rounded-xl h-auto gap-2">
                        <TabsTrigger value="dados" className="rounded-xl px-6 py-3 font-semibold data-[state=active]:bg-[#0076FF] data-[state=active]:text-white transition-all">
                            Dados Cadastrais
                        </TabsTrigger>
                        <TabsTrigger value="produto" className="rounded-xl px-6 py-3 font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4"/> Adicionar Produto
                        </TabsTrigger>
                    </TabsList>

                    {/* ABA DADOS CADASTRAIS */}
                    <TabsContent value="dados">
                        <form onSubmit={handleSaveClient} className="space-y-6">
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            {isCompany ? <Building2 className="w-5 h-5"/> : <User className="w-5 h-5"/>} 
                                            Informações Pessoais / Empresa
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={isCompany} onCheckedChange={setIsCompany} />
                                            <span className="text-sm font-semibold">{isCompany ? 'PJ' : 'PF'}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold uppercase">{isCompany ? 'Razão Social' : 'Nome Completo'}</Label>
                                        <Input className="h-12 border-2" value={clientData.name} onChange={(e) => setClientData({...clientData, name: e.target.value})} required/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold uppercase">{isCompany ? 'CNPJ' : 'CPF'}</Label>
                                        <Input className="h-12 border-2" value={clientData.document} onChange={(e) => setClientData({...clientData, document: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold uppercase">Email de Login</Label>
                                        <Input className="h-12 border-2" type="email" value={clientData.loginEmail} onChange={(e) => setClientData({...clientData, loginEmail: e.target.value})} required/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold uppercase">Nova Senha (Opcional)</Label>
                                        <Input className="h-12 border-2" type="password" placeholder="Preencha apenas para resetar" value={clientData.password} onChange={(e) => setClientData({...clientData, password: e.target.value})} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <MapPin className="w-5 h-5"/> Contato e Endereço
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-2 max-w-sm">
                                        <Label className="text-sm font-semibold uppercase">Telefone / Whats</Label>
                                        <Input className="h-12 border-2" value={clientData.phone} onChange={(e) => setClientData({...clientData, phone: e.target.value})}/>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase">CEP</Label>
                                            <Input placeholder="00000-000" maxLength={9} value={clientData.address.zipCode} onChange={handleCepChange} className="border-2"/>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-xs font-semibold uppercase">Logradouro</Label>
                                            <Input value={clientData.address.street} onChange={(e) => setClientData({...clientData, address: {...clientData.address, street: e.target.value}})} className="border-2"/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase">Número</Label>
                                            <Input value={clientData.address.streetNumber} onChange={(e) => setClientData({...clientData, address: {...clientData.address, streetNumber: e.target.value}})} className="border-2"/>
                                        </div>
                                        <div className="space-y-2 md:col-span-1">
                                            <Label className="text-xs font-semibold uppercase">Apto/Bloco</Label>
                                            <Input value={clientData.address.complement} onChange={(e) => setClientData({...clientData, address: {...clientData.address, complement: e.target.value}})} className="border-2"/>
                                        </div>
                                        <div className="space-y-2 md:col-span-1">
                                            <Label className="text-xs font-semibold uppercase">Bairro</Label>
                                            <Input value={clientData.address.neighborhood} onChange={(e) => setClientData({...clientData, address: {...clientData.address, neighborhood: e.target.value}})} className="border-2"/>
                                        </div>
                                        <div className="space-y-2 md:col-span-1">
                                            <Label className="text-xs font-semibold uppercase">Cidade</Label>
                                            <Input value={clientData.address.city} onChange={(e) => setClientData({...clientData, address: {...clientData.address, city: e.target.value}})} className="border-2"/>
                                        </div>
                                        <div className="space-y-2 md:col-span-1">
                                            <Label className="text-xs font-semibold uppercase">UF</Label>
                                            <Input maxLength={2} value={clientData.address.state} onChange={(e) => setClientData({...clientData, address: {...clientData.address, state: e.target.value}})} className="border-2 uppercase"/>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <Label className="text-sm font-semibold uppercase">Observações Internas</Label>
                                        <Textarea className="border-2 h-24" value={clientData.notes} onChange={(e) => setClientData({...clientData, notes: e.target.value})}/>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-end">
                                <Button type="submit" disabled={loadingSave} className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                                    {loadingSave ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} Salvar Dados
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* ABA ADD PRODUTO */}
                    <TabsContent value="produto">
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <Card className="border-0 shadow-lg shadow-emerald-200/50 bg-white rounded-2xl border-t-4 border-t-emerald-500">
                                <CardHeader>
                                    <CardTitle className="text-xl flex gap-2"><Package className="w-6 h-6 text-emerald-600"/> Contratar Novo Serviço</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Categoria <span className="text-red-500">*</span></Label>
                                            <Select value={newProduct.productType} onValueChange={(val) => setNewProduct({...newProduct, productType: val})}>
                                                <SelectTrigger className="h-11 border-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SITE">Site</SelectItem>
                                                    <SelectItem value="PROJETOS">Projetos</SelectItem>
                                                    <SelectItem value="SISTEMAS">Sistemas</SelectItem>
                                                    <SelectItem value="AUTOMACAO">Automação</SelectItem>
                                                    <SelectItem value="CELULAR">Aplicativo de Celular</SelectItem>
                                                    <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
                                                    <SelectItem value="CRM_TELECOM">Infinity CRM Telecom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Nome Customizado <span className="text-red-500">*</span></Label>
                                            <Input className="h-11 border-2" placeholder="Ex: Manutenção Mensal ERP" value={newProduct.productName} onChange={(e) => setNewProduct({...newProduct, productName: e.target.value})} required />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold flex"><DollarSign className="w-3 h-3"/> Mensal(R$)</Label>
                                            <Input type="number" step="0.01" className="h-11" value={newProduct.monthlyFeeCents === 0 ? '' : newProduct.monthlyFeeCents / 100} onChange={(e) => setNewProduct({...newProduct, monthlyFeeCents: Number(e.target.value) * 100})} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold flex"><DollarSign className="w-3 h-3"/> Setup(R$)</Label>
                                            <Input type="number" step="0.01" className="h-11" value={newProduct.implementationFeeCents === 0 ? '' : newProduct.implementationFeeCents / 100} onChange={(e) => setNewProduct({...newProduct, implementationFeeCents: Number(e.target.value) * 100})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Dia Venc.</Label>
                                            <Input type="number" min="1" max="31" className="h-11" value={newProduct.billingDayOfMonth} onChange={(e) => setNewProduct({...newProduct, billingDayOfMonth: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold flex"><Calendar className="w-3 h-3"/> Inicio</Label>
                                            <Input type="date" className="h-11" value={newProduct.startDate} onChange={(e) => setNewProduct({...newProduct, startDate: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3 bg-slate-50 p-4 rounded-xl border">
                                        <div className="flex items-center gap-2">
                                            <Switch checked={newProduct.isLifetime} onCheckedChange={(val) => { setNewProduct(prev => ({...prev, isLifetime: val, isProrataEnabled: val ? false : prev.isProrataEnabled})); }} />
                                            <Label className="text-sm font-semibold">Vitalício</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch disabled={newProduct.isLifetime} checked={newProduct.isProrataEnabled} onCheckedChange={(val) => setNewProduct({...newProduct, isProrataEnabled: val})} />
                                            <Label className="text-sm font-semibold">Pró-rata Habilitado</Label>
                                        </div>
                                        {!newProduct.isLifetime && (
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium pl-1">Duração (Meses)</Label>
                                                <Input type="number" className="h-8" value={newProduct.contractDurationMonths} onChange={(e) => setNewProduct({...newProduct, contractDurationMonths: Number(e.target.value)})} />
                                            </div>
                                        )}
                                    </div>

                                    {newProduct.productType === 'CRM_TELECOM' && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                            <div className="flex gap-2 items-center text-orange-800 font-bold mb-3"><Settings className="w-4 h-4"/> Config. CRM Telecom</div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold">Cobrança</Label>
                                                    <Select value={newProduct.crmBillingType} onValueChange={(val) => setNewProduct({...newProduct, crmBillingType: val})}>
                                                        <SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger>
                                                        <SelectContent><SelectItem value="FIXED">Valor Fixo</SelectItem><SelectItem value="PER_USER">Por Usuário Ativo</SelectItem></SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold">Tenant Existente (Opicional)</Label>
                                                    <Input className="h-10 bg-white" placeholder="ID no CRM" value={newProduct.crmTenantId} onChange={(e) => setNewProduct({...newProduct, crmTenantId: e.target.value})}/>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Button type="submit" disabled={loadingSave} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg mt-4">
                                        {loadingSave ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Package className="mr-2 h-5 w-5"/>} Confirmar Assinatura
                                    </Button>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
