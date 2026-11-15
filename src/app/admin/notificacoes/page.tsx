'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Mail,
    Search,
    Plus,
    Send,
    Users,
    Calendar,
    CheckCircle,
    AlertCircle,
    Loader2,
    TrendingUp,
    XCircle,
    FileText,
} from 'lucide-react';
import { authService } from '@/services/auth';
import { announcementsService, clientsService } from '@/services/crud';

export default function NotificacoesPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sending, setSending] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        emailTitle: '',
        subtitle: '',
        content: '',
        ctaLabel: '',
        ctaUrl: '',
        segment: 'ALL',
        productType: '',
    });

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }
        loadData();
    }, [router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const annData = await announcementsService.getAll();
            setAnnouncements(annData);
        } catch (error) {
            console.error('Error loading announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subject: '',
            emailTitle: '',
            subtitle: '',
            content: '',
            ctaLabel: '',
            ctaUrl: '',
            segment: 'ALL',
            productType: '',
        });
    };

    const handleCreateAnnouncement = async () => {
        if (!formData.title || !formData.subject || !formData.content) {
            alert('Preencha os campos obrigatórios: Nome Interno, Assunto e Mensagem.');
            return;
        }
        try {
            const result = await announcementsService.create({
                ...formData,
                emailTitle: formData.emailTitle || formData.title,
                channel: 'EMAIL',
            });
            setIsCreateModalOpen(false);
            resetForm();
            await loadData();

            if (confirm('Comunicado salvo! Deseja disparar o envio para os destinatários agora?')) {
                handleSendAnnouncement(result.id);
            }
        } catch (error) {
            alert('Erro ao criar comunicado. Verifique os dados e tente novamente.');
        }
    };

    const handleSendAnnouncement = async (id: number) => {
        setSending(id);
        try {
            await announcementsService.send(id);
            await loadData();
        } catch (error) {
            alert('Erro ao disparar e-mails.');
        } finally {
            setSending(null);
        }
    };

    const stats = {
        total: announcements.length,
        sent: announcements.filter((a) => a.sentAt).length,
        pending: announcements.filter((a) => !a.sentAt).length,
        recipients: announcements.reduce((acc, a) => acc + (a.totalRecipients || 0), 0),
    };

    const segmentLabel: Record<string, string> = {
        ALL: 'Todos os Clientes',
        PRODUCT_TYPE: 'Por Serviço',
        CLIENT_LIST: 'Lista Manual',
    };

    const filteredAnnouncements = announcements.filter((a) => {
        const matchesSearch =
            a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.segmentData as any)?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSegment =
            segmentFilter === 'all' ||
            (segmentFilter === 'sent' && a.sentAt) ||
            (segmentFilter === 'pending' && !a.sentAt);
        return matchesSearch && matchesSegment;
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-link" />
                    <p className="text-muted-foreground font-medium">Carregando comunicados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-background min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
                        <p className="text-muted-foreground text-lg mt-1">Envie comunicados por e-mail para seus clientes</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-primary-foreground h-11 px-5 rounded-xl shadow-lg shadow-blue-500/25"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Comunicado
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-info rounded-xl">
                                    <Mail className="h-6 w-6 text-link" />
                                </div>
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.total}</div>
                            <p className="text-sm text-muted-foreground font-medium">Total de Comunicados</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-success rounded-xl">
                                    <CheckCircle className="h-6 w-6 text-success-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.sent}</div>
                            <p className="text-sm text-muted-foreground font-medium">Enviados</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-warning rounded-xl">
                                    <AlertCircle className="h-6 w-6 text-warning-foreground" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.pending}</div>
                            <p className="text-sm text-muted-foreground font-medium">Rascunhos</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl bg-card overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-purple-50 rounded-xl">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-1">{stats.recipients}</div>
                            <p className="text-sm text-muted-foreground font-medium">Total Destinatários</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-card rounded-2xl">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título ou assunto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 border-2 border-input rounded-xl focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-foreground-subtle"
                                />
                            </div>
                            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                                <SelectTrigger className="w-full md:w-56 h-12 border-2 border-input rounded-xl focus:border-ring focus:ring-2 focus:ring-ring/20">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos ({stats.total})</SelectItem>
                                    <SelectItem value="sent">Enviados ({stats.sent})</SelectItem>
                                    <SelectItem value="pending">Rascunhos ({stats.pending})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-card rounded-2xl">
                    <CardHeader className="border-b border-border bg-muted">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-foreground">Histórico de Comunicados</CardTitle>
                            <Badge className="bg-muted text-foreground hover:bg-muted">
                                {filteredAnnouncements.length}{' '}
                                {filteredAnnouncements.length === 1 ? 'comunicado' : 'comunicados'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {filteredAnnouncements.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="font-bold text-foreground">Título</TableHead>
                                            <TableHead className="font-bold text-foreground">Assunto</TableHead>
                                            <TableHead className="font-bold text-foreground">Público</TableHead>
                                            <TableHead className="font-bold text-foreground">Status</TableHead>
                                            <TableHead className="font-bold text-foreground">Entregas</TableHead>
                                            <TableHead className="font-bold text-foreground">Data</TableHead>
                                            <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAnnouncements.map((ann) => (
                                            <TableRow
                                                key={ann.id}
                                                className="hover:bg-muted transition-colors border-border"
                                            >
                                                <TableCell className="font-semibold text-foreground">
                                                    {ann.title}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                    {(ann.segmentData as any)?.subject || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-medium border-border"
                                                    >
                                                        {segmentLabel[ann.segment] || ann.segment}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {ann.sentAt ? (
                                                        <Badge className="bg-success text-success-foreground rounded-full font-semibold shadow-sm">
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                            Enviado
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-warning text-warning-foreground rounded-full font-semibold shadow-sm">
                                                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                            Rascunho
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {ann.sentAt ? (
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <span className="flex items-center text-success-foreground gap-1">
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                {ann.successCount}
                                                            </span>
                                                            <span className="flex items-center text-danger-foreground gap-1">
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                {ann.failureCount}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(ann.createdAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!ann.sentAt && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSendAnnouncement(ann.id)}
                                                            disabled={sending === ann.id}
                                                            className="h-9 hover:bg-success hover:text-success-foreground rounded-lg"
                                                        >
                                                            {sending === ann.id ? (
                                                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                                            ) : (
                                                                <Send className="h-4 w-4 mr-1.5" />
                                                            )}
                                                            Enviar
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 bg-muted rounded-full mb-4">
                                    <Mail className="h-12 w-12 text-foreground-subtle" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    Nenhum comunicado encontrado
                                </h3>
                                <p className="text-muted-foreground">
                                    Crie um novo comunicado para enviar e-mails aos seus clientes
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Announcement Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <div className="p-2 bg-info rounded-full">
                                <Mail className="h-6 w-6 text-link" />
                            </div>
                            Novo Comunicado por E-mail
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Row 1 */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Nome Interno <span className="text-danger-foreground">*</span>
                                </label>
                                <Input
                                    placeholder="Ex: Atualização de Termos Abril/2024"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-12 border-2 border-input rounded-xl focus:border-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Público Alvo <span className="text-danger-foreground">*</span>
                                </label>
                                <Select
                                    value={formData.segment}
                                    onValueChange={(v) => setFormData({ ...formData, segment: v })}
                                >
                                    <SelectTrigger className="h-12 border-2 border-input rounded-xl focus:border-ring">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todos os Clientes Ativos</SelectItem>
                                        <SelectItem value="PRODUCT_TYPE">Por Tipo de Serviço</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Product Type Filter */}
                        {formData.segment === 'PRODUCT_TYPE' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Tipo de Serviço <span className="text-danger-foreground">*</span>
                                </label>
                                <Select
                                    value={formData.productType}
                                    onValueChange={(v) => setFormData({ ...formData, productType: v })}
                                >
                                    <SelectTrigger className="h-12 border-2 border-input rounded-xl focus:border-ring">
                                        <SelectValue placeholder="Selecione o serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CRM_TELECOM">CRM Telecom</SelectItem>
                                        <SelectItem value="SITE">Criação de Sites</SelectItem>
                                        <SelectItem value="SISTEMAS">Sistemas Customizados</SelectItem>
                                        <SelectItem value="AUTOMACAO">Automação</SelectItem>
                                        <SelectItem value="PROJETOS">Projetos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="border-t border-border pt-4 space-y-4">
                            {/* Row 2 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Assunto do E-mail <span className="text-danger-foreground">*</span>
                                </label>
                                <Input
                                    placeholder="O que o cliente verá na caixa de entrada"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="h-12 border-2 border-input rounded-xl focus:border-ring"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Subtítulo (opcional)
                                </label>
                                <Input
                                    placeholder="Texto de apoio abaixo do título"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="h-12 border-2 border-input rounded-xl focus:border-ring"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">
                                    Mensagem <span className="text-danger-foreground">*</span>
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder="Escreva sua mensagem aqui. Você pode usar HTML básico como <p>, <strong> e <br>."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full border-2 border-input rounded-xl p-4 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-foreground-subtle resize-none"
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="border-t border-border pt-4">
                            <p className="text-sm font-semibold text-foreground mb-3">Botão de Ação (opcional)</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Texto do Botão
                                    </label>
                                    <Input
                                        placeholder="Ex: Saiba Mais"
                                        value={formData.ctaLabel}
                                        onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                                        className="h-11 border-2 border-input rounded-xl focus:border-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Link do Botão
                                    </label>
                                    <Input
                                        placeholder="https://..."
                                        value={formData.ctaUrl}
                                        onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                                        className="h-11 border-2 border-input rounded-xl focus:border-ring"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-2"
                            onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-blue-500/25"
                            onClick={handleCreateAnnouncement}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Salvar Comunicado
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
