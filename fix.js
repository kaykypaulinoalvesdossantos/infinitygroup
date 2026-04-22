const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/clientes/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const abaIndex = lines.findIndex(line => line.includes('{/* Aba Financeira */}'));

if (abaIndex === -1) {
    console.error("Aba Financeira não encontrada");
    process.exit(1);
}

const topLines = lines.slice(0, abaIndex);

const abaFinanceira = `                    {/* Aba Financeira */}
                    <TabsContent value="financial" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Assinaturas */}
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Package className="h-5 w-5 text-[#0076FF]" />
                                        Assinaturas e Produtos ({stats.totalSubscriptions})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {client.subscriptions && client.subscriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {client.subscriptions.map((subscription: any) => (
                                                <div key={subscription.id} className="border-2 border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="space-y-1 text-left">
                                                            <p className="font-bold text-[#1A1A1A] flex items-center gap-2">
                                                                {subscription.productName}
                                                                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">{subscription.productType || 'PRODUTO'}</Badge>
                                                            </p>
                                                            {subscription.description && (
                                                                <p className="text-xs text-[#64748B]">{subscription.description}</p>
                                                            )}
                                                        </div>
                                                        <Badge className={subscription.status === 'active' || subscription.status === 'ATIVO' ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-slate-400 hover:bg-slate-400'}>
                                                            {subscription.status === 'active' || subscription.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                                                        <div className="p-2 bg-blue-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Mensalidade</p>
                                                            <p className="font-bold text-[#0076FF]">
                                                                {(subscription.monthlyFeeCents / 100).toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL',
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-orange-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Setup/Imp.</p>
                                                            <p className="font-bold text-orange-700">
                                                                {((subscription.implementationFeeCents || 0) / 100).toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL',
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Vencimento</p>
                                                            <p className="font-bold text-[#1A1A1A]">Dia {subscription.billingDayOfMonth}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-[#64748B] pt-3 border-t border-slate-100 flex flex-col gap-1">
                                                        <p>
                                                            Início: {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                                                            {subscription.isLifetime ? ' • Vitalício' : (subscription.contractDurationMonths ? \` • \${subscription.contractDurationMonths} meses\` : '')}
                                                        </p>
                                                        {subscription.isProrataEnabled && <p className="text-emerald-600 font-semibold">Pró-rata Habilitado</p>}
                                                        {(subscription.responsibleName || subscription.responsibleEmail) && (
                                                            <p className="text-slate-600 flex items-center gap-1">
                                                                <User className="h-3 w-3"/> Responsável: {subscription.responsibleName || 'N/A'} {subscription.responsibleEmail && \`(\${subscription.responsibleEmail})\`}
                                                            </p>
                                                        )}
                                                        {subscription.productType === 'CRM_TELECOM' && (
                                                            <div className="bg-orange-50 text-orange-800 p-3 rounded mt-2 border border-orange-200">
                                                                <p className="font-bold mb-1 flex items-center gap-1">
                                                                    <LinkIcon className="h-3 w-3" /> Integração CRM Telecom
                                                                </p>
                                                                <p>Faturamento: <span className="font-medium">{subscription.crmBillingType}</span></p>
                                                                <p>Tenant ID: <span className="font-mono bg-white/50 px-1 rounded">{subscription.crmTenantId}</span></p>
                                                            </div>
                                                        )}
                                                        <div className="mt-2 flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8"
                                                                onClick={() => handleOpenEditSub(subscription)}
                                                            >
                                                                <Edit className="h-3 w-3 mr-1" />
                                                                Editar
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8"
                                                                onClick={() => handleGenerateMissingInvoice(subscription.id)}
                                                                disabled={processingAction === subscription.id}
                                                            >
                                                                {processingAction === subscription.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-1" />}
                                                                Gerar Fatura Avulsa
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                                            <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                            <p className="text-sm text-[#64748B] font-medium">Nenhuma assinatura ativa</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Faturas */}
                            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <CreditCard className="h-5 w-5 text-[#0076FF]" />
                                        Faturas Recentes ({stats.totalInvoices})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {client.invoices && client.invoices.length > 0 ? (
                                        <div className="space-y-4">
                                            {client.invoices.slice(0, 5).map((invoice: any) => (
                                                <div key={invoice.id} className="border-2 border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-[#1A1A1A]">
                                                                {invoice.description || \`Fatura #\${invoice.id}\`}
                                                            </p>
                                                        </div>
                                                        <Badge className={
                                                            invoice.status === 'paid' || invoice.status === 'PAGA'
                                                                ? 'bg-emerald-500 hover:bg-emerald-500'
                                                                : invoice.status === 'overdue' || invoice.status === 'VENCIDA'
                                                                    ? 'bg-red-500 hover:bg-red-500'
                                                                    : 'bg-orange-500 hover:bg-orange-500'
                                                        }>
                                                            {invoice.status === 'paid' || invoice.status === 'PAGA' ? 'Paga' : invoice.status === 'overdue' || invoice.status === 'VENCIDA' ? 'Vencida' : 'Aberta'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Valor</p>
                                                            <p className="font-bold text-[#1A1A1A]">
                                                                {(invoice.amountCents / 100).toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL',
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            <p className="text-xs text-[#64748B] mb-1">Vencimento</p>
                                                            <p className="font-bold text-[#1A1A1A]">
                                                                {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3">
                                                        {invoice.pixCopyPaste && (
                                                            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PIX Copia e Cola</p>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-6 text-xs text-blue-600 hover:text-blue-700 p-0"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(invoice.pixCopyPaste);
                                                                            alert('PIX Copiado!');
                                                                        }}
                                                                    >
                                                                        <Copy className="h-3 w-3 mr-1" /> Copiar
                                                                    </Button>
                                                                </div>
                                                                <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[10px] break-all mb-2 leading-tight text-slate-600 select-all max-h-20 overflow-y-auto">
                                                                    {invoice.pixCopyPaste}
                                                                </div>
                                                                {invoice.pixQrCodeUrl && (
                                                                    <div className="flex flex-col items-center pt-2 gap-1 border-t border-slate-100">
                                                                        <img src={invoice.pixQrCodeUrl} alt="PIX" className="w-24 h-24 border bg-white p-1 rounded" />
                                                                        <p className="text-[8px] text-slate-400">Escaneie para pagar</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex justify-between items-center">
                                                            {invoice.boletoUrl && (
                                                                <a 
                                                                    href={invoice.boletoUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" /> Ver Boleto
                                                                </a>
                                                            )}
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 rounded-lg shadow-sm font-semibold ml-auto"
                                                                onClick={() => handleGeneratePix(invoice.id)}
                                                                disabled={processingAction === invoice.id || invoice.status === 'paid' || invoice.status === 'PAGA'}
                                                            >
                                                                {processingAction === invoice.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-1" />}
                                                                {invoice.pixCopyPaste ? 'Atualizar PIX' : 'Gerar PIX'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {invoice.paidAt && (
                                                        <div className="mt-3 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg font-semibold flex items-center gap-2">
                                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                                            Pago em {new Date(invoice.paidAt).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                                            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                            <p className="text-sm text-[#64748B] font-medium">Nenhuma fatura encontrada</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Edição de Assinatura */}
            {editingSubscription && (
                <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Editar Assinatura</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="productName" className="text-right text-xs">Produto</Label>
                                <Input
                                    id="productName"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.productName}
                                    onChange={(e) => setSubFormData({ ...subFormData, productName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right text-xs">Descrição</Label>
                                <Input
                                    id="description"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.description}
                                    onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="monthlyFeeCents" className="text-right text-xs">Valor (R$)</Label>
                                <Input
                                    id="monthlyFeeCents"
                                    type="number"
                                    step="0.01"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.monthlyFeeCents}
                                    onChange={(e) => setSubFormData({ ...subFormData, monthlyFeeCents: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="billingDayOfMonth" className="text-right text-xs">Vencimento (Dia)</Label>
                                <Input
                                    id="billingDayOfMonth"
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.billingDayOfMonth}
                                    onChange={(e) => setSubFormData({ ...subFormData, billingDayOfMonth: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="contractDurationMonths" className="text-right text-xs">Prazo (Meses)</Label>
                                <Input
                                    id="contractDurationMonths"
                                    type="number"
                                    placeholder="Ex: 12"
                                    className="col-span-3 h-8 text-sm"
                                    value={subFormData.contractDurationMonths}
                                    onChange={(e) => setSubFormData({ ...subFormData, contractDurationMonths: e.target.value })}
                                />
                            </div>
                            {editingSubscription.productType === 'CRM_TELECOM' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-xs">Tipo (CRM)</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={subFormData.crmBillingType}
                                            onValueChange={(value) => setSubFormData({ ...subFormData, crmBillingType: value })}
                                        >
                                            <SelectTrigger className="h-8 text-sm">
                                                <SelectValue placeholder="Selecione o tipo de faturamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FIXED">Fixo (FIXED)</SelectItem>
                                                <SelectItem value="PER_USER">Por Usuário (PER_USER)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                            <Button variant="outline" size="sm" onClick={() => setEditingSubscription(null)}>
                                Cancelar
                            </Button>
                            <Button className="bg-[#0076FF] hover:bg-[#0076FF]/90" size="sm" onClick={handleSaveSub} disabled={savingSub}>
                                {savingSub ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
}
`;

fs.writeFileSync(filePath, [...topLines, abaFinanceira].join('\n'));
console.log("File reconstructed safely!");
