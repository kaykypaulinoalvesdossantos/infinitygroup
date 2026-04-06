'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
    Eye,
    EyeOff,
    Check,
    AlertTriangle,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { usersService } from '@/services/crud';

export default function ClientProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });

    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const validatePassword = (pass: string) => {
        setPasswordRequirements({
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[@$!%*?&]/.test(pass),
        });
    };

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
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') {
            validatePassword(value);
        }
    };

    const isPasswordValid = 
        !formData.password || 
        (passwordRequirements.length && 
        passwordRequirements.uppercase && 
        passwordRequirements.lowercase && 
        passwordRequirements.number && 
        passwordRequirements.special);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password && !isPasswordValid) {
            setError('A senha não atende aos requisitos mínimos de segurança.');
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('A confirmação de senha não coincide.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const updateData: any = { name: formData.name };
            if (formData.password) {
                updateData.password = formData.password;
            }

            const updatedUser = await usersService.updateMe(updateData);

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserProfile(updatedUser);

            setSuccessMessage('Seu perfil foi atualizado com sucesso!');
            setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
            setPasswordRequirements({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false,
            });

            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: any) {
            setError(err.message || 'Houve um erro ao atualizar seu perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium animate-pulse">Carregando seu perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto bg-[#F8FAFC] min-h-screen font-inter"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                        Meu <span className="text-[#0076FF]">Perfil</span>
                    </h1>
                    <p className="text-[#64748B] text-lg mt-2 font-medium opacity-80">
                        Gerencie suas informações e segurança da conta.
                    </p>
                </div>
            </motion.div>

            <AnimatePresence>
                {(successMessage || error) && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        variants={itemVariants}
                    >
                        {successMessage && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-4 shadow-xl shadow-emerald-200/20">
                                <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <p className="font-bold text-emerald-900 flex-1">{successMessage}</p>
                                <Button variant="ghost" size="icon" onClick={() => setSuccessMessage('')} className="rounded-full hover:bg-emerald-100/50">
                                    <X className="h-5 w-5 text-emerald-600" />
                                </Button>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-center gap-4 shadow-xl shadow-red-200/20">
                                <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-500/20">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <p className="font-bold text-red-900 flex-1">{error}</p>
                                <Button variant="ghost" size="icon" onClick={() => setError('')} className="rounded-full hover:bg-red-100/50">
                                    <X className="h-5 w-5 text-red-600" />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Information Column */}
                <div className="lg:col-span-4 space-y-8">
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
                            <CardHeader className="p-8 bg-gradient-to-br from-blue-50/50 to-white pb-0">
                                <div className="flex flex-col items-center py-6">
                                    <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#0076FF] to-[#0060D0] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-500/30 mb-6">
                                        {formData.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-xl font-black text-[#1A1A1A] text-center">{formData.name}</h2>
                                    <p className="text-[#64748B] font-bold text-xs uppercase tracking-widest mt-1 opacity-60">Cliente Infinity</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-[#0076FF]">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">E-mail de Login</p>
                                            <p className="font-bold text-[#1A1A1A] text-sm truncate">{userProfile?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-emerald-600">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Status da Conta</p>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-emerald-50 text-emerald-600 border-0 font-bold px-2 py-0.5 text-[10px] uppercase tracking-tighter">Ativa</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Último Acesso</p>
                                            <p className="font-bold text-[#1A1A1A] text-sm italic opacity-70">
                                                {userProfile?.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleDateString('pt-BR') : 'Primeiro acesso'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-[#0076FF]" />
                                        <p className="text-[11px] font-bold text-[#64748B] leading-tight">
                                            Seus dados estão protegidos por criptografia de ponta a ponta.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {userProfile?.client && (
                        <motion.div variants={itemVariants}>
                            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden border-t-4 border-[#0076FF]">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-xl text-[#0076FF]">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-lg font-black text-[#1A1A1A]">Dados Contratuais</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    <div className="space-y-5">
                                        <div className="p-4 bg-slate-50/50 rounded-2xl">
                                            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Empresa / Razão Social</p>
                                            <p className="font-black text-[#1A1A1A] text-lg leading-tight">{userProfile.client.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">{userProfile.client.type === 'pj' ? 'CNPJ' : 'CPF'}</p>
                                                <p className="font-bold text-[#1A1A1A] text-sm">{userProfile.client.document}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Tipo</p>
                                                <p className="font-bold text-[#1A1A1A] text-sm uppercase">{userProfile.client.type}</p>
                                            </div>
                                        </div>
                                        {userProfile.client.phone && (
                                            <div>
                                                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Contato</p>
                                                <div className="flex items-center gap-2 font-bold text-[#1A1A1A] text-sm">
                                                    <Phone className="h-3 w-3 text-[#0076FF]" /> {userProfile.client.phone}
                                                </div>
                                            </div>
                                        )}
                                        {userProfile.client.address && (
                                            <div>
                                                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Sede</p>
                                                <div className="flex items-start gap-2 font-bold text-[#1A1A1A] text-xs leading-relaxed opacity-70">
                                                    <MapPin className="h-3 w-3 mt-0.5 text-red-400" /> {userProfile.client.address}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Forms Column */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.div variants={itemVariants}>
                        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white h-full overflow-hidden">
                            <CardHeader className="p-10 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-white">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 rounded-3xl bg-[#0076FF] text-white shadow-xl shadow-blue-500/20">
                                        <User className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black text-[#1A1A1A] tracking-tight">Informações Pessoais</CardTitle>
                                        <p className="text-[#64748B] font-medium text-sm">Mantenha seu perfil sempre atualizado.</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Nome Completo</Label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] group-focus-within:text-[#0076FF] transition-colors" />
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="h-14 pl-12 bg-slate-50/50 border-0 rounded-2xl font-bold text-[#1A1A1A] focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all"
                                                    placeholder="Como quer ser chamado?"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="email_disabled" className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">E-mail de Acesso</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] opacity-40" />
                                                <Input
                                                    id="email_disabled"
                                                    value={userProfile?.email || ''}
                                                    disabled
                                                    className="h-14 pl-12 bg-slate-100/70 border-0 rounded-2xl font-black text-[#1A1A1A] opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest ml-1 flex items-center gap-1.5 pt-1">
                                                <AlertCircle className="h-3 w-3" /> E-mail Gerenciado pelo Administrador
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-slate-100">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="p-3.5 rounded-2xl bg-orange-50 text-orange-600">
                                                <Lock className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">Segurança da Conta</h3>
                                                <p className="text-[#64748B] font-medium text-xs">Alterar senha de acesso ao portal.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="password" className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Nova Senha</Label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] group-focus-within:text-[#0076FF] transition-colors" />
                                                        <Input
                                                            id="password"
                                                            name="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            className="h-14 pl-12 pr-12 bg-slate-50/50 border-0 rounded-2xl font-bold text-[#1A1A1A] focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all"
                                                            placeholder="Mínimo 8 caracteres"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0076FF] transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="confirmPassword" className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Confirmar Senha</Label>
                                                    <div className="relative group">
                                                        <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B] group-focus-within:text-[#0076FF] transition-colors" />
                                                        <Input
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={formData.confirmPassword}
                                                            onChange={handleChange}
                                                            className="h-14 pl-12 bg-slate-50/50 border-0 rounded-2xl font-bold text-[#1A1A1A] focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all"
                                                            placeholder="Repita a nova senha"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Password Requirements Checklist */}
                                            {formData.password && (
                                                <div className="p-8 bg-[#F8FAFC] rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
                                                    <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Shield className="h-3 w-3 text-[#0076FF]" /> Requisitos de Força
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {[
                                                            { label: 'Pelo menos 8 caracteres', met: passwordRequirements.length },
                                                            { label: 'Uma letra maiúscula', met: passwordRequirements.uppercase },
                                                            { label: 'Uma letra minúscula', met: passwordRequirements.lowercase },
                                                            { label: 'Um número', met: passwordRequirements.number },
                                                            { label: 'Um caractere especial (@$!%*?&)', met: passwordRequirements.special },
                                                        ].map((req, i) => (
                                                            <div key={i} className="flex items-center gap-3">
                                                                <div className={`p-1 rounded-full transition-colors ${req.met ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                                    <Check className="h-3 w-3 text-white" />
                                                                </div>
                                                                <span className={`text-xs font-bold transition-colors ${req.met ? 'text-emerald-700' : 'text-[#64748B] opacity-50'}`}>
                                                                    {req.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-10 border-t border-slate-100">
                                        <Button
                                            type="submit"
                                            disabled={saving || !!(formData.password && !isPasswordValid)}
                                            className="h-16 px-12 bg-[#0076FF] hover:bg-[#0060D0] text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 font-black text-sm uppercase tracking-widest group"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    Atualizar Perfil <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
