'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { clientSchema, ClientFormData, defaultFormValues, defaultSubscription } from './schema';
import { clientsService } from '@/services/crud';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle,
    User, Shield, MapPin, Package, Plus, Trash2,
    Building2, FileText, Mail, Lock, Phone, Home,
    Navigation, DollarSign, Calendar, Settings, Info,
    Code2, X, Terminal, ClipboardCheck
} from 'lucide-react';

export default function NovoClientePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [searchingCep, setSearchingCep] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema) as any,
        defaultValues: defaultFormValues,
        mode: 'onBlur',
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'subscriptions' });

    // --- Utilitários ---

    const applyPhoneMask = (v: string) => {
        let d = v.replace(/\D/g, '').slice(0, 11);
        if (d.length > 10) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        if (d.length > 5)  return d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        if (d.length > 2)  return d.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        return d;
    };

    const lookupCep = async () => {
        const cep = (watch('address.zipCode') ?? '').replace(/\D/g, '');
        if (cep.length !== 8) return;
        setSearchingCep(true);
        try {
            const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setValue('address.street',       data.logradouro ?? '', { shouldValidate: true });
                setValue('address.neighborhood', data.bairro     ?? '', { shouldValidate: true });
                setValue('address.city',         data.localidade ?? '', { shouldValidate: true });
                setValue('address.state',        data.uf         ?? '', { shouldValidate: true });
            }
        } catch { /* silêncio */ }
        finally { setSearchingCep(false); }
    };

    // --- Submit ---

    const onSubmit = async (data: ClientFormData) => {
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...data,
                document:  data.document  || undefined,
                phone:     data.phone     || undefined,
                notes:     data.notes     || undefined,
                address: {
                    ...data.address,
                    zipCode:    data.address.zipCode.replace(/\D/g, ''),
                    complement: data.address.complement || undefined,
                },
                subscriptions: data.subscriptions.map(s => {
                    const isCrm = s.productType === 'CRM_TELECOM';
                    return {
                        ...s,
                        description:      s.description    || undefined,
                        crmBillingType:   isCrm ? s.crmBillingType   : undefined,
                        crmTenantId:      isCrm && s.crmTenantId      ? s.crmTenantId      : undefined,
                        responsibleName:  isCrm && s.responsibleName  ? s.responsibleName  : undefined,
                        responsibleEmail: isCrm && s.responsibleEmail ? s.responsibleEmail : undefined,
                    };
                }),
            };

            await clientsService.create(payload);
            setSuccess(true);
            setTimeout(() => router.push('/admin/clientes'), 2000);
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || 'Erro ao salvar cliente');
            setSaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // ─── UI ────────────────────────────────────────────────────────────────────

    const isCompany  = watch('type') === 'pj';

    const SectionHeader = ({ icon: Icon, title, number }: { icon: any; title: string; number: number }) => (
        <div className="bg-muted/80 px-8 py-5 border-b border-border flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-link" />
            </div>
            <h2 className="text-base font-bold text-foreground uppercase tracking-wider">{number}. {title}</h2>
        </div>
    );

    const FieldError = ({ msg }: { msg?: string }) =>
        msg ? <p className="text-[11px] text-danger-foreground font-semibold mt-1">{msg}</p> : null;

    const inputCls = (hasErr: boolean) =>
        `h-11 border-2 rounded-xl transition-colors ${hasErr ? 'border-danger-border bg-danger focus:border-danger' : 'border-border focus:border-ring'}`;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon"
                            className="h-11 w-11 rounded-2xl border-input bg-card shadow-sm hover:bg-muted group"
                            onClick={() => router.push('/admin/clientes')}>
                            <ArrowLeft className="h-5 w-5 text-foreground-subtle group-hover:-translate-x-0.5 transition-transform" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Novo Cliente</h1>
                            <p className="text-foreground-subtle font-medium mt-0.5">Preencha as informações abaixo para registrar um novo parceiro.</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${saving ? 'bg-warning-foreground animate-pulse' : 'bg-success-foreground'}`} />
                        <span className="text-xs font-bold text-foreground-subtle uppercase tracking-widest">
                            {saving ? 'Processando' : 'Sistema Ativo'}
                        </span>
                    </div>
                </div>

                {/* ── Alertas globais ─────────────────────────────────────── */}
                {success && (
                    <div className="flex items-center gap-4 p-5 bg-success border-2 border-success-border rounded-2xl animate-in zoom-in-95 duration-300">
                        <CheckCircle2 className="h-7 w-7 text-success-foreground shrink-0" />
                        <div>
                            <p className="font-bold text-success-foreground">Cliente registrado com sucesso!</p>
                            <p className="text-success-foreground text-sm">Redirecionando para a listagem...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-4 p-5 bg-danger border-2 border-danger-border rounded-2xl animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-7 w-7 text-danger-foreground shrink-0" />
                        <div>
                            <p className="font-bold text-danger-foreground">Erro ao salvar</p>
                            <p className="text-danger-foreground text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {Object.keys(errors).length > 0 && !success && (
                    <div className="flex items-center gap-4 p-4 bg-warning border-2 border-warning-border rounded-2xl">
                        <AlertCircle className="h-5 w-5 text-warning-foreground shrink-0" />
                        <p className="text-warning-foreground text-sm font-semibold">
                            Campos obrigatórios estão inválidos — verifique as marcações abaixo antes de salvar.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

                    {/* ═══════════════════════════════════════════════
                        SEÇÃO 1 — IDENTIFICAÇÃO
                    ══════════════════════════════════════════════════ */}
                    <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                        <SectionHeader icon={User} title="Identificação" number={1} />
                        <CardContent className="p-6 md:p-8 space-y-6">

                            {/* Toggle PF / PJ */}
                            <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-border bg-muted/50">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-foreground flex items-center gap-2">
                                        {isCompany ? <Building2 className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                                        {isCompany ? 'Pessoa Jurídica (CNPJ)' : 'Pessoa Física (CPF)'}
                                    </p>
                                    <p className="text-sm text-foreground-subtle">Alterne para mudar o tipo de cadastro</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold ${!isCompany ? 'text-primary' : 'text-muted-foreground'}`}>PF</span>
                                    <Controller name="type" control={control} render={({ field }) => (
                                        <Switch
                                            checked={field.value === 'pj'}
                                            onCheckedChange={v => {
                                                field.onChange(v ? 'pj' : 'pf');
                                                if (!v) setValue('document', '');
                                            }}
                                        />
                                    )} />
                                    <span className={`text-sm font-bold ${isCompany ? 'text-primary' : 'text-muted-foreground'}`}>PJ</span>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                {/* Nome / Razão Social */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex gap-1">
                                        <FileText className="h-3.5 w-3.5 text-link" />
                                        {isCompany ? 'Razão Social' : 'Nome Completo'} <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <Input
                                        {...register('name')}
                                        placeholder={isCompany ? 'Nome da empresa' : 'Nome completo do cliente'}
                                        className={inputCls(!!errors.name)}
                                    />
                                    <FieldError msg={errors.name?.message} />
                                </div>

                                {/* CPF / CNPJ */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        {isCompany ? 'CNPJ' : 'CPF'} (Opcional)
                                    </Label>
                                    <Input
                                        {...register('document')}
                                        placeholder={isCompany ? '00.000.000/0000-00' : '000.000.000-00'}
                                        className="h-11 border-2 border-input rounded-xl font-mono focus:border-ring"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ═══════════════════════════════════════════════
                        SEÇÃO 2 — ACESSO AO PORTAL
                    ══════════════════════════════════════════════════ */}
                    <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                        <SectionHeader icon={Shield} title="Portal e Acesso" number={2} />
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                {/* E-mail */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex gap-1">
                                        <Mail className="h-3.5 w-3.5 text-link" />
                                        E-mail de Login <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <Input
                                        {...register('loginEmail')}
                                        type="email"
                                        placeholder="cliente@exemplo.com"
                                        className={inputCls(!!errors.loginEmail)}
                                    />
                                    <FieldError msg={errors.loginEmail?.message} />
                                </div>

                                {/* Senha */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex gap-1">
                                        <Lock className="h-3.5 w-3.5 text-link" />
                                        Senha Inicial <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <Input
                                        {...register('password')}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Mínimo 8 caracteres"
                                        className={inputCls(!!errors.password)}
                                    />
                                    <FieldError msg={errors.password?.message} />
                                </div>
                            </div>

                            {/* Toggle boas-vindas */}
                            <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-info-border bg-info/40 hover:bg-info transition-colors">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-info-foreground flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4" />E-mail de Boas-vindas
                                    </p>
                                    <p className="text-xs text-info-foreground">Enviar credenciais de acesso automaticamente ao salvar</p>
                                </div>
                                <Controller name="enviarEmailBoasVindas" control={control} render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ═══════════════════════════════════════════════
                        SEÇÃO 3 — ENDEREÇO E CONTATO
                    ══════════════════════════════════════════════════ */}
                    <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                        <SectionHeader icon={MapPin} title="Endereço e Contato" number={3} />
                        <CardContent className="p-6 md:p-8 space-y-6">

                            {/* Telefone */}
                            <div className="max-w-xs space-y-1.5">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex gap-1">
                                    <Phone className="h-3.5 w-3.5 text-link" />
                                    WhatsApp / Telefone
                                </Label>
                                <Input
                                    {...register('phone')}
                                    placeholder="(00) 00000-0000"
                                    className="h-11 border-2 border-input rounded-xl focus:border-ring"
                                    onChange={e => {
                                        const masked = applyPhoneMask(e.target.value);
                                        setValue('phone', masked, { shouldDirty: true });
                                    }}
                                />
                            </div>

                            {/* Endereço */}
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-12">

                                {/* CEP */}
                                <div className="space-y-1.5 md:col-span-3">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        CEP <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            {...register('address.zipCode')}
                                            placeholder="00000-000"
                                            maxLength={9}
                                            className={inputCls(!!errors.address?.zipCode)}
                                            onBlur={lookupCep}
                                        />
                                        {searchingCep && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="h-4 w-4 animate-spin text-link" />
                                            </div>
                                        )}
                                    </div>
                                    <FieldError msg={errors.address?.zipCode?.message} />
                                </div>

                                {/* Rua */}
                                <div className="space-y-1.5 md:col-span-7">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        Rua / Logradouro <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                                        <Input
                                            {...register('address.street')}
                                            placeholder="Nome da rua"
                                            className={`${inputCls(!!errors.address?.street)} pl-9`}
                                        />
                                    </div>
                                    <FieldError msg={errors.address?.street?.message} />
                                </div>

                                {/* Número */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        Número <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <Input
                                        {...register('address.streetNumber')}
                                        placeholder="123"
                                        className={inputCls(!!errors.address?.streetNumber)}
                                    />
                                    <FieldError msg={errors.address?.streetNumber?.message} />
                                </div>

                                {/* Complemento */}
                                <div className="space-y-1.5 md:col-span-3">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Complemento</Label>
                                    <Input
                                        {...register('address.complement')}
                                        placeholder="Apto, Sala..."
                                        className="h-11 border-2 border-input rounded-xl focus:border-ring"
                                    />
                                </div>

                                {/* Bairro */}
                                <div className="space-y-1.5 md:col-span-3">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        Bairro <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <Input
                                        {...register('address.neighborhood')}
                                        className={inputCls(!!errors.address?.neighborhood)}
                                    />
                                    <FieldError msg={errors.address?.neighborhood?.message} />
                                </div>

                                {/* Cidade */}
                                <div className="space-y-1.5 md:col-span-4">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        Cidade <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                                        <Input
                                            {...register('address.city')}
                                            className={`${inputCls(!!errors.address?.city)} pl-9`}
                                        />
                                    </div>
                                    <FieldError msg={errors.address?.city?.message} />
                                </div>

                                {/* UF */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                        UF <span className="text-danger-foreground">*</span>
                                    </Label>
                                    <Input
                                        {...register('address.state')}
                                        placeholder="SP"
                                        maxLength={2}
                                        className={`${inputCls(!!errors.address?.state)} uppercase`}
                                    />
                                    <FieldError msg={errors.address?.state?.message} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ═══════════════════════════════════════════════
                        SEÇÃO 4 — ASSINATURAS E SERVIÇOS
                    ══════════════════════════════════════════════════ */}
                    <Card className="border-0 shadow-md rounded-3xl overflow-hidden">
                        <SectionHeader icon={Package} title="Assinaturas e Serviços" number={4} />
                        <CardContent className="p-6 md:p-8 space-y-6">

                            {fields.map((field, i) => {
                                const productType        = watch(`subscriptions.${i}.productType`);
                                const isLifetime         = watch(`subscriptions.${i}.isLifetime`)         ?? false;
                                const isProrataEnabled   = watch(`subscriptions.${i}.isProrataEnabled`)   ?? true;
                                const crmBillingType     = watch(`subscriptions.${i}.crmBillingType`)     ?? 'FIXED';
                                const monthlyRaw         = watch(`subscriptions.${i}.monthlyFeeCents`)    ?? 0;
                                const implementationRaw  = watch(`subscriptions.${i}.implementationFeeCents`) ?? 0;
                                const isCrm              = productType === 'CRM_TELECOM';

                                return (
                                    <div key={field.id}
                                        className="border-2 border-border rounded-2xl overflow-hidden bg-card shadow-sm hover:border-input/30 transition-colors">

                                        {/* Cabeçalho do Card */}
                                        <div className="flex items-center justify-between px-6 py-4 bg-muted border-b border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-link font-bold text-sm">
                                                    {i + 1}
                                                </div>
                                                <span className="font-bold text-foreground text-sm uppercase tracking-wide">
                                                    Produto / Serviço {fields.length > 1 ? `#${i + 1}` : ''}
                                                </span>
                                            </div>
                                            {fields.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon"
                                                    className="h-8 w-8 text-danger-foreground hover:text-danger-foreground hover:bg-danger rounded-lg"
                                                    onClick={() => remove(i)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Tipo + Nome */}
                                            <div className="grid gap-4 md:grid-cols-12">
                                                <div className="space-y-1.5 md:col-span-4">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                                        Tipo <span className="text-danger-foreground">*</span>
                                                    </Label>
                                                    <Controller
                                                        name={`subscriptions.${i}.productType`}
                                                        control={control}
                                                        render={({ field: f }) => (
                                                            <Select
                                                                value={f.value}
                                                                onValueChange={v => f.onChange(v)}
                                                            >
                                                                <SelectTrigger className="h-11 border-2 border-input rounded-xl focus:border-ring focus:ring-0">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="SITE">Site Institucional</SelectItem>
                                                                    <SelectItem value="PROJETOS">Projetos Customizados</SelectItem>
                                                                    <SelectItem value="SISTEMAS">Sistemas Web / ERP</SelectItem>
                                                                    <SelectItem value="AUTOMACAO">Automação de Processos</SelectItem>
                                                                    <SelectItem value="CELULAR">APP Mobile</SelectItem>
                                                                    <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
                                                                    <SelectItem value="CRM_TELECOM">Infinity CRM Telecom</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-8">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                                        Nome do Contrato <span className="text-danger-foreground">*</span>
                                                    </Label>
                                                    <Input
                                                        {...register(`subscriptions.${i}.productName`)}
                                                        placeholder="Ex: Site Institucional + SEO"
                                                        className={inputCls(!!errors.subscriptions?.[i]?.productName)}
                                                    />
                                                    <FieldError msg={errors.subscriptions?.[i]?.productName?.message} />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-12">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                                        Descrição (exibida no portal)
                                                    </Label>
                                                    <Input
                                                        {...register(`subscriptions.${i}.description`)}
                                                        placeholder="Breve descrição do escopo..."
                                                        className="h-11 border-2 border-input rounded-xl focus:border-ring"
                                                    />
                                                </div>
                                            </div>

                                            {/* Valores + Datas */}
                                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                                                {/* Mensalidade */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex gap-1">
                                                        <DollarSign className="h-3.5 w-3.5 text-success-foreground" />
                                                        Mensalidade (R$) <span className="text-danger-foreground">*</span>
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0,00"
                                                        className={`${inputCls(!!errors.subscriptions?.[i]?.monthlyFeeCents)} font-mono`}
                                                        value={monthlyRaw === 0 ? '' : (monthlyRaw / 100).toFixed(2)}
                                                        onChange={e => {
                                                            const v = parseFloat(e.target.value) || 0;
                                                            setValue(`subscriptions.${i}.monthlyFeeCents`, Math.round(v * 100), { shouldValidate: true });
                                                        }}
                                                    />
                                                    <FieldError msg={errors.subscriptions?.[i]?.monthlyFeeCents?.message} />
                                                </div>

                                                {/* Setup */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex gap-1">
                                                        <DollarSign className="h-3.5 w-3.5 text-warning-foreground" />
                                                        Setup (R$)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0,00"
                                                        className="h-11 border-2 border-input rounded-xl font-mono focus:border-warning-border"
                                                        value={implementationRaw === 0 ? '' : (implementationRaw / 100).toFixed(2)}
                                                        onChange={e => {
                                                            const v = parseFloat(e.target.value) || 0;
                                                            setValue(`subscriptions.${i}.implementationFeeCents`, Math.round(v * 100), { shouldValidate: true });
                                                        }}
                                                    />
                                                </div>

                                                {/* Dia de Vencimento */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Dia Vencto.</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="31"
                                                        placeholder="10"
                                                        className="h-11 border-2 border-input rounded-xl focus:border-ring"
                                                        {...register(`subscriptions.${i}.billingDayOfMonth`)}
                                                    />
                                                </div>

                                                {/* Data de início */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-info-foreground" />Início
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        className="h-11 border-2 border-input rounded-xl focus:border-ring"
                                                        {...register(`subscriptions.${i}.startDate`)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Toggles de contrato */}
                                            <div className="flex flex-wrap gap-3 p-4 bg-muted rounded-2xl border border-border">
                                                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border">
                                                    <Controller name={`subscriptions.${i}.isLifetime`} control={control}
                                                        render={({ field: f }) => (
                                                            <Switch checked={f.value}
                                                                onCheckedChange={v => {
                                                                    f.onChange(v);
                                                                    if (v) setValue(`subscriptions.${i}.isProrataEnabled`, false);
                                                                }}
                                                            />
                                                        )} />
                                                    <Label className="text-xs font-bold uppercase text-foreground">Vitalício</Label>
                                                </div>

                                                <div className={`flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border ${isLifetime ? 'opacity-50' : ''}`}>
                                                    <Controller name={`subscriptions.${i}.isProrataEnabled`} control={control}
                                                        render={({ field: f }) => (
                                                            <Switch checked={f.value} disabled={isLifetime} onCheckedChange={f.onChange} />
                                                        )} />
                                                    <Label className="text-xs font-bold uppercase text-foreground">Pró-rata</Label>
                                                </div>

                                                {!isLifetime && (
                                                    <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border">
                                                        <Label className="text-xs font-bold uppercase text-foreground whitespace-nowrap">Ciclo (meses):</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            {...register(`subscriptions.${i}.contractDurationMonths`)}
                                                            className="h-8 w-16 border border-input rounded-lg text-center text-sm font-bold"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── CRM Telecom ─────────────────── */}
                                            {isCrm && (
                                                <div className="border-2 border-warning-border bg-warning/30 rounded-2xl p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="flex items-center gap-2">
                                                        <Settings className="h-4 w-4 text-warning-foreground" />
                                                        <span className="text-sm font-extrabold text-warning-foreground uppercase tracking-wider">Configurações CRM Telecom</span>
                                                    </div>

                                                    <div className="grid gap-5 md:grid-cols-2">
                                                        {/* Tipo de cobrança CRM */}
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-bold uppercase text-warning-foreground">Modelo de Cobrança</Label>
                                                            <Controller
                                                                name={`subscriptions.${i}.crmBillingType`}
                                                                control={control}
                                                                render={({ field: f }) => (
                                                                    <Select value={f.value} onValueChange={f.onChange}>
                                                                        <SelectTrigger className="h-11 border-2 border-warning-border bg-card rounded-xl focus:border-warning-border focus:ring-0">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="FIXED">Valor Mensal Fixo</SelectItem>
                                                                            <SelectItem value="PER_USER">Mensal por Usuário</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                            <p className="text-[10px] text-warning-foreground font-medium">
                                                                {crmBillingType === 'PER_USER'
                                                                    ? '✓ O sistema consultará o CRM mensalmente e atualizará o valor por usuário.'
                                                                    : '✓ Valor fixo independente do número de usuários.'}
                                                            </p>
                                                        </div>

                                                        {/* Tenant ID */}
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-bold uppercase text-warning-foreground">ID da Tenant (Opcional)</Label>
                                                            <Input
                                                                {...register(`subscriptions.${i}.crmTenantId`)}
                                                                placeholder="Ex: e617a213-..."
                                                                className="h-11 border-2 border-warning-border bg-card rounded-xl focus:border-warning-border"
                                                            />
                                                            <p className="text-[10px] text-warning-foreground">Deixe em branco para provisionar automaticamente.</p>
                                                        </div>

                                                        {/* Nome do Gestor */}
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-bold uppercase text-warning-foreground">Nome do Gestor</Label>
                                                            <Input
                                                                {...register(`subscriptions.${i}.responsibleName`)}
                                                                placeholder="Nome do admin da plataforma"
                                                                className="h-11 border-2 border-warning-border bg-card rounded-xl focus:border-warning-border"
                                                            />
                                                        </div>

                                                        {/* E-mail do Gestor */}
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-bold uppercase text-warning-foreground">E-mail do Gestor</Label>
                                                            <Input
                                                                {...register(`subscriptions.${i}.responsibleEmail`)}
                                                                type="email"
                                                                placeholder="gestor@empresa.com"
                                                                className="h-11 border-2 border-warning-border bg-card rounded-xl focus:border-warning-border"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3 bg-warning/80 border border-warning-border rounded-xl p-4">
                                                        <Info className="h-4 w-4 text-warning-foreground mt-0.5 shrink-0" />
                                                        <p className="text-xs text-warning-foreground font-medium leading-relaxed">
                                                            <b>Provisionamento Automático:</b> Se o Tenant ID estiver vazio, um novo subdomínio e administrador serão criados automaticamente ao salvar o cliente.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Botão adicionar produto */}
                            <Button type="button" variant="outline"
                                className="w-full h-14 border-2 border-dashed border-input hover:border-input hover:bg-info/40 rounded-2xl font-bold text-foreground-subtle hover:text-link gap-2 transition-all group"
                                onClick={() => append({ ...defaultSubscription })}>
                                <div className="h-6 w-6 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                                    <Plus className="h-4 w-4" />
                                </div>
                                Adicionar Outro Produto
                            </Button>
                        </CardContent>
                    </Card>

                    {/* ══════════════════════════════════════════════
                        BARRA DE AÇÃO STICKY
                    ══════════════════════════════════════════════════ */}
                    <div className="sticky bottom-4 z-50">
                        <div className="bg-card/95 text-foreground backdrop-blur-sm rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl border border-border">
                            <div className="hidden sm:block">
                                <p className="text-foreground font-bold">Finalizar cadastro?</p>
                                <p className="text-muted-foreground text-sm">Todos os campos obrigatórios devem estar preenchidos.</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button type="button" variant="outline"
                                    className="border-input bg-background text-foreground hover:bg-muted hover:text-foreground rounded-xl h-12 px-5 font-bold"
                                    onClick={() => setShowDebug(v => !v)}>
                                    <Code2 className="h-4 w-4 mr-2" />
                                    Debug
                                </Button>
                                <Button type="submit" disabled={saving}
                                    className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-lg shadow-blue-900/30 transition-all active:scale-95">
                                    {saving
                                        ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Salvando...</>
                                        : <><ClipboardCheck className="h-5 w-5 mr-2" />Confirmar e Criar</>
                                    }
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ── Debug console ─────────────────────────────── */}
                    {showDebug && (
                        <div className="border-2 border-border rounded-3xl bg-[#1a1a1a] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                            <div className="flex items-center justify-between px-6 py-4 bg-[#2a2a2a] border-b border-[#3a3a3a]">
                                <div className="flex items-center gap-3">
                                    <Terminal className="h-5 w-5 text-amber-400" />
                                    <span className="text-white font-mono font-bold text-sm">Debug Console</span>
                                    {Object.keys(errors).length === 0
                                        ? <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">✓ Sem erros</Badge>
                                        : <Badge className="bg-red-500/20 text-danger-foreground border-0 text-[10px]">{Object.keys(errors).length} erro(s)</Badge>
                                    }
                                </div>
                                <Button type="button" variant="ghost" size="icon"
                                    className="h-8 w-8 text-foreground-subtle hover:text-white"
                                    onClick={() => setShowDebug(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3a3a3a #1a1a1a' }}>
                                <div>
                                    <p className="text-foreground-subtle text-[10px] font-bold uppercase tracking-widest mb-3">Payload atual</p>
                                    <pre className="bg-black/40 border border-[#333] rounded-xl p-4 text-[11px] font-mono text-[#9CDCFE] overflow-x-auto">
                                        {JSON.stringify(getValues(), null, 2)}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-foreground-subtle text-[10px] font-bold uppercase tracking-widest mb-3">Erros de validação</p>
                                    {Object.keys(errors).length > 0
                                        ? <pre className="bg-red-950/30 border border-red-900/30 rounded-xl p-4 text-[11px] font-mono text-red-300 overflow-x-auto">
                                            {JSON.stringify(errors, null, 2)}
                                          </pre>
                                        : <div className="bg-emerald-950/30 border border-emerald-900/20 rounded-xl p-8 flex flex-col items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-success-foreground mb-2" />
                                            <p className="text-emerald-400 font-bold text-xs uppercase">Formulário válido</p>
                                          </div>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                </form>

                {/* Footer */}
                <div className="text-center pb-10">
                    <p className="text-foreground-subtle text-xs">Infinity Groups — Gestão de Clientes v4.1</p>
                </div>
            </div>
        </div>
    );
}
