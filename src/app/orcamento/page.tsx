"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import emailjs from '@emailjs/browser'
import {
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Instagram,
  Linkedin,
  Facebook,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layout
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function OrcamentoPage() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "medium",
    description: ""
  })

  useEffect(() => {
    try {
      emailjs.init("Gf6nsmRD6YFZoAN_M")
    } catch (error) {
      console.error("Erro ao inicializar EmailJS:", error)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, projectType: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, budget: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormState("submitting")

    try {
      const templateParams = {
        name: formData.name,
        time: new Date().toLocaleString('pt-BR'),
        message: `
Nome: ${formData.name}
Email: ${formData.email}
Telefone: ${formData.phone}
Tipo de Projeto: ${formData.projectType}
Orçamento Estimado: ${formData.budget}

Descrição:
${formData.description}
        `
      }

      const result = await emailjs.send(
        'service_dngi441',
        'template_w1a54ha',
        templateParams,
        'Gf6nsmRD6YFZoAN_M'
      )

      if (result.status === 200) {
        setFormState("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          projectType: "",
          budget: "medium",
          description: ""
        })
      } else {
        throw new Error(`Falha ao enviar email: ${result.text}`)
      }
    } catch (error) {
      console.error('Erro detalhado ao enviar e-mail:', error)
      setFormState("error")
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F6F6] text-[#1A1A1A] font-inter pt-32 pb-24 selection:bg-[#0076FF]/20">

      <div className="container mx-auto px-4">

        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-16 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0076FF] font-bold text-xs uppercase tracking-wider mb-6"
          >
            <Zap size={14} fill="currentColor" /> Vamos trabalhar juntos
          </motion.div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-[#1A1A1A] mb-6 tracking-tight">
            Solicite um <span className="text-[#0076FF]">Orçamento</span>
          </h1>
          <p className="text-xl text-[#64748B] max-w-2xl leading-relaxed">
            Preencha o formulário abaixo para receber uma consultoria técnica inicial e uma proposta personalizada para o seu negócio.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">

          {/* Left Column: Contact & Trust (4 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Contact Info Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="font-bold text-xl text-[#1A1A1A] mb-8 flex items-center gap-2">
                Fale com a gente
              </h3>

              <div className="space-y-6">
                <ContactItem icon={<Phone className="w-5 h-5" />} title="Telefone" value="(11) 94533-2464" />
                <ContactItem icon={<MessageSquare className="w-5 h-5" />} title="WhatsApp" value="(11) 94533-2464" action label="Iniciar conversa" link="https://wa.me/5511945332464" />
                <ContactItem icon={<Mail className="w-5 h-5" />} title="E-mail" value="contato@infinitygroup.tech" />
                <ContactItem icon={<MapPin className="w-5 h-5" />} title="Localização" value="São Paulo, SP - Brasil" />
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50">
                <div className="flex justify-center gap-4">
                  <SocialBtn icon={<Instagram size={20} />} />
                  <SocialBtn icon={<Linkedin size={20} />} />
                  <SocialBtn icon={<Facebook size={20} />} />
                </div>
              </div>
            </div>

            {/* Trust/Benefits Card */}
            <div className="bg-[#0076FF] rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

              <ShieldCheck className="w-12 h-12 mb-6 text-white/90" />
              <h3 className="font-bold text-xl mb-4">Garantia Infinity</h3>
              <ul className="space-y-4 text-blue-50">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
                  <span>Retorno em até 24h úteis</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
                  <span>NDA e Sigilo Absoluto</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
                  <span>Especialistas Sênior</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Right Column: Premium Form (8 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

              {/* Form Header Line */}
              <div className="h-2 bg-gradient-to-r from-[#0076FF] to-cyan-400 w-full"></div>

              <div className="p-8 md:p-12">
                {formState === "success" ? (
                  <SuccessState onReset={() => setFormState("idle")} />
                ) : formState === "error" ? (
                  <ErrorState onRetry={() => setFormState("idle")} />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Section 1: Personal Data */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0076FF] flex items-center justify-center font-bold text-sm">1</div>
                        <h2 className="text-xl font-bold text-[#1A1A1A]">Seus Dados</h2>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 pl-0 md:pl-12">
                        <div className="space-y-2 group">
                          <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#0076FF] transition-colors">Nome Completo</Label>
                          <Input
                            name="name" required placeholder="Digite seu nome"
                            value={formData.name} onChange={handleInputChange} disabled={formState === "submitting"}
                            className="bg-white border border-slate-200 text-[#1A1A1A] focus:border-[#0076FF] focus:ring-1 focus:ring-[#0076FF]/20 rounded-xl h-14 text-base transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-2 group">
                          <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#0076FF] transition-colors">E-mail Corporativo</Label>
                          <Input
                            name="email" type="email" required placeholder="nome@empresa.com"
                            value={formData.email} onChange={handleInputChange} disabled={formState === "submitting"}
                            className="bg-white border border-slate-200 text-[#1A1A1A] focus:border-[#0076FF] focus:ring-1 focus:ring-[#0076FF]/20 rounded-xl h-14 text-base transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-2 group">
                          <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#0076FF] transition-colors">WhatsApp / Telefone</Label>
                          <Input
                            name="phone" required placeholder="(11) 99999-9999"
                            value={formData.phone} onChange={handleInputChange} disabled={formState === "submitting"}
                            className="bg-white border border-slate-200 text-[#1A1A1A] focus:border-[#0076FF] focus:ring-1 focus:ring-[#0076FF]/20 rounded-xl h-14 text-base transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-2 group">
                          <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#0076FF] transition-colors">Tipo de Projeto</Label>
                          <Select value={formData.projectType} onValueChange={handleSelectChange} disabled={formState === "submitting"}>
                            <SelectTrigger className="bg-white border border-slate-200 text-[#1A1A1A] focus:border-[#0076FF] focus:ring-1 focus:ring-[#0076FF]/20 rounded-xl h-14 text-base shadow-sm">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website / Landing Page</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="mobile-app">Aplicativo Mobile</SelectItem>
                              <SelectItem value="system">Sistema Web / Dashboard</SelectItem>
                              <SelectItem value="automation">Automação / IA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    {/* Section 2: Project Details */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0076FF] flex items-center justify-center font-bold text-sm">2</div>
                        <h2 className="text-xl font-bold text-[#1A1A1A]">Sobre o Projeto</h2>
                      </div>

                      <div className="pl-0 md:pl-12 space-y-8">
                        {/* Budget Cards */}
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Estimativa de Investimento</Label>
                          <RadioGroup value={formData.budget} onValueChange={handleRadioChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <BudgetCard
                              id="low" value="low"
                              label="Até R$ 5k"
                              desc="Projetos Iniciais"
                              current={formData.budget}
                            />
                            <BudgetCard
                              id="medium" value="medium"
                              label="R$ 5k - R$ 15k"
                              desc="Projetos Robustos"
                              current={formData.budget}
                            />
                            <BudgetCard
                              id="high" value="high"
                              label="Acima de R$ 15k"
                              desc="Grandes Escalas"
                              current={formData.budget}
                            />
                          </RadioGroup>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 group">
                          <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#0076FF] transition-colors">Descrição do Desafio</Label>
                          <Textarea
                            name="description" required placeholder="Descreva os objetivos principais, funcionalidades desejadas e referências..."
                            value={formData.description} onChange={handleInputChange} disabled={formState === "submitting"} rows={6}
                            className="bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-[#0076FF] focus:bg-blue-50/30 focus:ring-0 rounded-t-lg rounded-b-none min-h-[150px] text-base resize-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pl-0 md:pl-12">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={formState === "submitting"}
                        className="w-full h-16 bg-[#0076FF] hover:bg-[#0060D0] text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300"
                      >
                        {formState === "submitting" ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando solicitação...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Solicitar Proposta Gratuita <ArrowRight className="w-5 h-5" />
                          </span>
                        )}
                      </Button>
                      <p className="text-center text-xs text-slate-400 mt-4">
                        Seus dados estão protegidos. Não enviamos spam.
                      </p>
                    </div>

                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </main>
  )
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

function ContactItem({ icon, title, value, action, label, link }: { icon: any, title: string, value: string, action?: boolean, label?: string, link?: string }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0076FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0076FF] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#1A1A1A] mb-0.5">{title}</h4>
        <p className="text-[#64748B] text-sm font-medium">{value}</p>
        {action && link && (
          <Link href={link} target="_blank" className="text-[#0076FF] text-xs font-bold hover:underline mt-1 inline-flex items-center gap-1">
            {label} <ArrowRight size={10} />
          </Link>
        )}
      </div>
    </div>
  )
}

function SocialBtn({ icon }: { icon: any }) {
  return (
    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-[#64748B] hover:bg-[#0076FF] hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer">
      {icon}
    </div>
  )
}

function BudgetCard({ id, value, label, desc, current }: { id: string, value: string, label: string, desc: string, current: string }) {
  const isSelected = current === value
  return (
    <div className="relative">
      <RadioGroupItem value={value} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 h-full ${isSelected
          ? 'bg-[#0076FF]/5 border-[#0076FF] shadow-md'
          : 'bg-white border-slate-100 hover:border-[#0076FF]/30 hover:bg-slate-50'
          }`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`font-bold text-lg ${isSelected ? 'text-[#0076FF]' : 'text-[#1A1A1A]'}`}>{label}</span>
          {isSelected && <CheckCircle2 size={20} className="text-[#0076FF]" />}
        </div>
        <span className="text-xs font-medium text-[#64748B]">{desc}</span>
      </Label>
    </div>
  )
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-sm">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Solicitação Recebida!</h2>
      <p className="text-[#64748B] mb-8 max-w-md mx-auto text-lg">
        Obrigado pelo interesse. Nossa equipe técnica já foi notificada e entrará em contato em breve.
      </p>
      <Button onClick={onReset} variant="outline" className="h-12 border-slate-200 hover:bg-slate-50 hover:text-[#0076FF]">
        Enviar novo orçamento
      </Button>
    </motion.div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-sm">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Erro no envio</h2>
      <p className="text-[#64748B] mb-8 max-w-md mx-auto text-lg">
        Não foi possível enviar sua solicitação no momento. Por favor, verifique sua conexão.
      </p>
      <Button onClick={onRetry} size="lg" className="bg-[#0076FF] hover:bg-[#0060D0]">
        Tentar Novamente
      </Button>
    </motion.div>
  )
}
