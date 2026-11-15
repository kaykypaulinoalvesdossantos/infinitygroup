import { useFormContext, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, DollarSign, Calendar, Settings, Info } from "lucide-react";
import { ClientFormData } from "@/app/admin/clientes/novo/schema";

export function StepProducts() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<ClientFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subscriptions"
  });

  const updateSubscription = (index: number, field: any, value: any) => {
    setValue(`subscriptions.${index}.${field}` as any, value, { shouldValidate: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-link" />
          <h3 className="text-lg font-bold text-foreground tracking-tight">Configuração de Assinaturas</h3>
        </div>
        <Badge className="bg-primary hover:bg-primary px-2.5 py-1">
          {fields.length} {fields.length === 1 ? "Produto" : "Produtos"}
        </Badge>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => {
          const productType = watch(`subscriptions.${index}.productType`);
          const isLifetime = watch(`subscriptions.${index}.isLifetime`);
          const monthlyFeeCents = watch(`subscriptions.${index}.monthlyFeeCents`) || 0;
          const implementationFeeCents = watch(`subscriptions.${index}.implementationFeeCents`) || 0;

          return (
            <div 
              key={field.id} 
              className="group relative border-2 border-border rounded-2xl p-6 bg-gradient-to-br from-card to-muted/50 shadow-sm transition-all hover:border-input/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-info border border-info-border flex items-center justify-center text-link font-bold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-bold text-foreground uppercase tracking-wide text-sm">Produto / Serviço</h4>
                </div>
                {fields.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(index)} 
                    className="h-8 w-8 text-red-400 hover:text-danger-foreground hover:bg-danger rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12 pb-6 border-b border-border mb-6">
                <div className="space-y-2 lg:col-span-4">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Tipo do Produto <span className="text-danger-foreground">*</span></Label>
                  <Select value={productType} onValueChange={(val) => updateSubscription(index, 'productType', val)}>
                    <SelectTrigger className="h-11 border-2 border-input rounded-xl focus:ring-0 focus:border-ring">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                        <SelectItem value="SITE">Site Institucional</SelectItem>
                        <SelectItem value="PROJETOS">Projetos Customizados</SelectItem>
                        <SelectItem value="SISTEMAS">Sistemas Web / ERP</SelectItem>
                        <SelectItem value="AUTOMACAO">Automação de Processos</SelectItem>
                        <SelectItem value="CELULAR">APP de Celular</SelectItem>
                        <SelectItem value="ECOMMERCE">E-commerce / Loja Virtual</SelectItem>
                        <SelectItem value="CRM_TELECOM">Infinity CRM Telecom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 lg:col-span-8">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Nome Customizado do Contrato <span className="text-danger-foreground">*</span></Label>
                  <Input 
                    {...register(`subscriptions.${index}.productName`)}
                    className={`h-11 border-2 rounded-xl focus:border-ring ${errors.subscriptions?.[index]?.productName ? "border-danger-border" : "border-input"}`}
                    placeholder="Ex: Desenvolvimento Portal v2" 
                  />
                  {errors.subscriptions?.[index]?.productName && (
                      <p className="text-[10px] text-danger-foreground font-bold">{errors.subscriptions[index]?.productName?.message}</p>
                  )}
                </div>
                
                <div className="space-y-2 lg:col-span-12">
                   <Label className="text-xs font-bold uppercase text-muted-foreground">Descrição Rápida (Exibida no Portal do Cliente)</Label>
                   <Input 
                    {...register(`subscriptions.${index}.description`)}
                    className="h-11 border-2 border-input rounded-xl"
                    placeholder="Breve resumo do escopo do serviço..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#00C853]"/> Mensalidade (R$)
                  </Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    className={`h-11 border-2 rounded-xl font-mono focus:border-success-border ${errors.subscriptions?.[index]?.monthlyFeeCents ? "border-danger-border" : "border-input"}`}
                    value={monthlyFeeCents / 100} 
                    onChange={(e) => updateSubscription(index, 'monthlyFeeCents', Math.round(Number(e.target.value) * 100))} 
                  />
                  {errors.subscriptions?.[index]?.monthlyFeeCents && (
                      <p className="text-[10px] text-danger-foreground font-bold">{errors.subscriptions[index]?.monthlyFeeCents?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-warning-foreground"/> Setup / Impl. (R$)
                  </Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    className="h-11 border-2 border-input rounded-xl font-mono focus:border-warning-border"
                    value={implementationFeeCents / 100} 
                    onChange={(e) => updateSubscription(index, 'implementationFeeCents', Math.round(Number(e.target.value) * 100))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Dia Vencto.</Label>
                  <Input 
                    {...register(`subscriptions.${index}.billingDayOfMonth`)}
                    type="number" 
                    min="1" 
                    max="31" 
                    className="h-11 border-2 border-input rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-info-foreground"/> Início Fatur.
                  </Label>
                  <Input 
                    {...register(`subscriptions.${index}.startDate`)}
                    type="date" 
                    className="h-11 border-2 border-input rounded-xl uppercase text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-2xl border-2 border-border/60 mb-6">
                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-xl border border-border">
                  <Switch 
                    checked={isLifetime} 
                    onCheckedChange={(val) => { 
                      updateSubscription(index, 'isLifetime', val); 
                      if (val) updateSubscription(index, 'isProrataEnabled', false); 
                    }} 
                  />
                  <Label className="text-xs font-bold uppercase text-foreground">Contrato Vitalício</Label>
                </div>
                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-xl border border-border">
                  <Switch 
                    disabled={isLifetime} 
                    checked={watch(`subscriptions.${index}.isProrataEnabled`)} 
                    onCheckedChange={(val) => updateSubscription(index, 'isProrataEnabled', val)} 
                  />
                  <Label className="text-xs font-bold uppercase text-foreground">Pró-rata Ativo</Label>
                </div>
                {!isLifetime && (
                    <div className="flex items-center gap-3 bg-card px-3 py-1.5 rounded-xl border border-border flex-1 min-w-[200px]">
                        <Label className="text-xs font-bold uppercase text-foreground whitespace-nowrap">Ciclo (Meses):</Label>
                        <Input 
                            {...register(`subscriptions.${index}.contractDurationMonths`)}
                            type="number" 
                            className="h-8 text-xs border-0 bg-muted rounded-lg w-16 px-2 text-center font-bold"
                        />
                    </div>
                )}
              </div>

              {/* Regras Especializadas CRM Telecom */}
              {productType === 'CRM_TELECOM' && (
                <div className="bg-warning/50 border-2 border-warning-border rounded-2xl p-6 mt-4 space-y-5 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden group/crm">
                  <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none transition-transform group-hover/crm:scale-110">
                    <Settings className="w-24 h-24 text-warning-foreground" />
                  </div>
                  
                  <div className="flex gap-2 items-center text-warning-foreground font-extrabold text-sm uppercase tracking-wider mb-2">
                    <Settings className="w-4 h-4 text-warning-foreground"/>
                    Configurações Motor CRM
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-warning-foreground">Modelo de Cobrança CRM</Label>
                      <Select 
                        value={watch(`subscriptions.${index}.crmBillingType`) || "FIXED"} 
                        onValueChange={(val) => updateSubscription(index, 'crmBillingType', val)}
                      >
                        <SelectTrigger className="h-11 border-2 border-warning-border bg-card rounded-xl focus:border-orange-500">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-warning-border">
                          <SelectItem value="FIXED">Assinatura Fixa (Valor Mensal)</SelectItem>
                          <SelectItem value="PER_USER">Mensal por Usuário Ativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-warning-foreground">ID da Tenant (Opcional)</Label>
                      <Input 
                        {...register(`subscriptions.${index}.crmTenantId`)}
                        className="h-11 border-2 border-warning-border bg-card rounded-xl placeholder:text-orange-200"
                        placeholder="Ex: e617a213..." 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-warning-foreground">Nome do Gestor (CRM)</Label>
                      <Input 
                        {...register(`subscriptions.${index}.responsibleName`)}
                        className="h-11 border-2 border-warning-border bg-card rounded-xl"
                        placeholder="Nome do administrador da plataforma"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-warning-foreground">Email do Gestor (CRM)</Label>
                      <Input 
                         {...register(`subscriptions.${index}.responsibleEmail`)}
                         type="email"
                         className="h-11 border-2 border-warning-border bg-card rounded-xl"
                         placeholder="email.gestor@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="bg-warning p-4 rounded-xl border border-warning-border flex items-start gap-3">
                    <Info className="h-4 w-4 text-warning-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-warning-foreground font-medium leading-relaxed">
                      Se você <b>não preencher o Tenant ID</b>, a Infinity Groups fará o <b>provisionamento automático</b> de um novo subdominio e admin assim que o cliente for salvo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-14 border-2 border-dashed border-input hover:border-input hover:bg-info/50 rounded-2xl flex items-center justify-center gap-2 group transition-all"
        onClick={() => append({
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
        })}
      >
        <div className="p-1 bg-muted rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Plus className="h-4 w-4" />
        </div>
        <span className="font-bold text-foreground-subtle group-hover:text-link tracking-tight">Adicionar Outro Produto na Mesma Fatura</span>
      </Button>
    </div>
  );
}
