"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import emailjs from '@emailjs/browser'
import {
  CheckCircle,
  Rocket,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Instagram,
  Linkedin,
  Facebook,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OrcamentoPage() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "",
    description: ""
  })

  useEffect(() => {
    try {
      // Inicializa o EmailJS com sua chave pública
      emailjs.init("Gf6nsmRD6YFZoAN_M")
    } catch (error) {
      console.error("Erro ao inicializar EmailJS:", error)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      projectType: value
    }))
  }

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      budget: value
    }))
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

      console.log("Enviando email com parâmetros:", templateParams)

      const result = await emailjs.send(
        'service_dngi441',
        'template_w1a54ha',
        templateParams,
        'Gf6nsmRD6YFZoAN_M'
      )

      console.log("Resultado do envio:", result)

      if (result.status === 200) {
        setFormState("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          projectType: "",
          budget: "",
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
    <main className="min-h-screen bg-[#0B0B13] text-white">
      {/* Background Stars */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover opacity-30"></div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(93, 192, 231, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(156, 93, 231, 0.1) 0%, transparent 40%)",
          }}
        ></div>
      </div>

      {/* Header Section */}
      <section className="relative z-10 w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block mb-6">
              <div className="w-16 h-16 mx-auto bg-[#0F0F1A] rounded-full flex items-center justify-center border border-[#5DC0E7] shadow-[0_0_15px_rgba(93,192,231,0.5)]">
                <Rocket className="h-8 w-8 text-[#5DC0E7]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Solicite um <span className="text-[#5DC0E7]">Orçamento</span>
            </h1>
            <p className="text-lg mb-8 text-white/80">
              Transforme suas ideias em realidade digital. Preencha o formulário abaixo e nossa equipe entrará em
              contato para discutir seu projeto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form and Contact Section */}
      <section className="relative z-10 w-full py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info Column */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-1"
              >
                <div className="bg-[#12121E] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] p-8 border border-[#5DC0E7]/20 h-full">
                  <h2 className="text-2xl font-bold mb-6 text-white">Fale Conosco</h2>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-[#5DC0E7]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Telefone</h3>
                        <p className="text-white/80">(11) 94533-2464</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-[#5DC0E7]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Email</h3>
                        <p className="text-white/80">gerenciainfinitygroup@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-[#5DC0E7]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">WhatsApp</h3>
                        <p className="text-white/80">(11) 94533-2464</p>
                        <Button 
                          className="mt-2 bg-[#25D366] hover:bg-[#25D366]/80 text-white" 
                          size="sm"
                          onClick={() => window.open('https://wa.me/5511945332464', '_blank')}
                        >
                          Iniciar conversa
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-[#5DC0E7]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Endereço</h3>
                        <p className="text-white/80">São Paulo, SP - Brasil</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-[#5DC0E7]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Horário</h3>
                        <p className="text-white/80">Segunda - Sexta: 9h às 18h</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-white mb-4">Redes Sociais</h3>
                    <div className="flex space-x-4">
                      <a
                        href="#"
                        className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center hover:bg-[#5DC0E7]/20 transition-colors"
                      >
                        <Instagram className="h-5 w-5 text-[#5DC0E7]" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center hover:bg-[#5DC0E7]/20 transition-colors"
                      >
                        <Facebook className="h-5 w-5 text-[#5DC0E7]" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center hover:bg-[#5DC0E7]/20 transition-colors"
                      >
                        <Linkedin className="h-5 w-5 text-[#5DC0E7]" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Form Column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <div className="bg-[#12121E] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] p-8 border border-[#5DC0E7]/20">
                  {formState === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="mx-auto w-20 h-20 bg-[#5DC0E7]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(93,192,231,0.3)]">
                        <CheckCircle className="h-10 w-10 text-[#5DC0E7]" />
                      </div>
                      <h2 className="text-2xl font-bold mb-4 text-white">Solicitação Enviada!</h2>
                      <p className="text-white/80 mb-8">
                        Recebemos sua solicitação de orçamento. Nossa equipe entrará em contato em breve para
                        transformar suas ideias em realidade digital.
                      </p>
                      <Button
                        onClick={() => setFormState("idle")}
                        className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white shadow-[0_0_10px_rgba(93,192,231,0.3)]"
                      >
                        Enviar Outro Orçamento
                      </Button>
                    </motion.div>
                  ) : formState === "error" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="h-10 w-10 text-red-500" />
                      </div>
                      <h2 className="text-2xl font-bold mb-4 text-white">Erro ao Enviar</h2>
                      <p className="text-white/80 mb-8">
                        Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente mais tarde.
                      </p>
                      <Button
                        onClick={() => setFormState("idle")}
                        className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white shadow-[0_0_10px_rgba(93,192,231,0.3)]"
                      >
                        Tentar Novamente
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-6 text-white">Preencha os Detalhes do Projeto</h2>
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-white">
                              Nome
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Seu nome completo"
                              required
                              disabled={formState === "submitting"}
                              className="bg-[#1A1A2E] border-[#5DC0E7]/30 text-white placeholder:text-white/50 focus:border-[#5DC0E7] focus:ring-[#5DC0E7]/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">
                              E-mail
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              type="email"
                              placeholder="seu@email.com"
                              required
                              disabled={formState === "submitting"}
                              className="bg-[#1A1A2E] border-[#5DC0E7]/30 text-white placeholder:text-white/50 focus:border-[#5DC0E7] focus:ring-[#5DC0E7]/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white">
                              Telefone / WhatsApp
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="(00) 00000-0000"
                              required
                              disabled={formState === "submitting"}
                              className="bg-[#1A1A2E] border-[#5DC0E7]/30 text-white placeholder:text-white/50 focus:border-[#5DC0E7] focus:ring-[#5DC0E7]/20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="project-type" className="text-white">
                              Tipo de Projeto
                            </Label>
                            <Select 
                              disabled={formState === "submitting"}
                              onValueChange={handleSelectChange}
                              value={formData.projectType}
                            >
                              <SelectTrigger className="bg-[#1A1A2E] border-[#5DC0E7]/30 text-white focus:ring-[#5DC0E7]/20">
                                <SelectValue placeholder="Selecione o tipo de projeto" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1A1A2E] border-[#5DC0E7]/30 text-white">
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="ecommerce">E-commerce</SelectItem>
                                <SelectItem value="mobile-app">Aplicativo para Celular</SelectItem>
                                <SelectItem value="desktop-app">Aplicativo para Computador</SelectItem>
                                <SelectItem value="automation">Automação</SelectItem>
                                <SelectItem value="consulting">Consultoria</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          <Label className="text-white">Orçamento Estimado</Label>
                          <RadioGroup 
                            defaultValue="medium" 
                            disabled={formState === "submitting"} 
                            className="mt-2"
                            onValueChange={handleRadioChange}
                            value={formData.budget}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center space-x-2 bg-[#1A1A2E] p-3 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-colors">
                                <RadioGroupItem value="low" id="low" className="text-[#5DC0E7]" />
                                <Label htmlFor="low" className="text-white cursor-pointer">
                                  Até R$ 5.000
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-[#1A1A2E] p-3 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-colors">
                                <RadioGroupItem value="medium" id="medium" className="text-[#5DC0E7]" />
                                <Label htmlFor="medium" className="text-white cursor-pointer">
                                  R$ 5.000 a R$ 15.000
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2 bg-[#1A1A2E] p-3 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-colors">
                                <RadioGroupItem value="high" id="high" className="text-[#5DC0E7]" />
                                <Label htmlFor="high" className="text-white cursor-pointer">
                                  Acima de R$ 15.000
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2 mb-8">
                          <Label htmlFor="description" className="text-white">
                            Descrição da Ideia
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Descreva seu projeto ou ideia em detalhes..."
                            rows={6}
                            required
                            disabled={formState === "submitting"}
                            className="bg-[#1A1A2E] border-[#5DC0E7]/30 text-white placeholder:text-white/50 focus:border-[#5DC0E7] focus:ring-[#5DC0E7]/20"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white shadow-[0_0_10px_rgba(93,192,231,0.3)]"
                          disabled={formState === "submitting"}
                        >
                          {formState === "submitting" ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Enviando...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              Solicitar orçamento <Rocket className="ml-2 h-4 w-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Benefits Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Clock className="h-6 w-6 text-[#5DC0E7]" />,
                  title: "Resposta Rápida",
                  description: "Retornamos em até 24 horas com uma proposta personalizada para seu projeto.",
                },
                {
                  icon: <CheckCircle className="h-6 w-6 text-[#5DC0E7]" />,
                  title: "Orçamento Gratuito",
                  description: "Primeira análise e orçamento sem compromisso e totalmente gratuito.",
                },
                {
                  icon: <Rocket className="h-6 w-6 text-[#5DC0E7]" />,
                  title: "Suporte Contínuo",
                  description: "Acompanhamento durante todo o processo de desenvolvimento e após a entrega.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#12121E] p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/40 transition-all duration-300"
                >
                  <div className="mx-auto w-12 h-12 bg-[#5DC0E7]/10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(93,192,231,0.2)]">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white text-center">{benefit.title}</h3>
                  <p className="text-white/80 text-center">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-[#12121E] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] p-8 border border-[#5DC0E7]/20 text-center"
            style={{
              background: "linear-gradient(to bottom right, rgba(18, 18, 30, 0.9), rgba(11, 11, 19, 0.9))",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(93, 192, 231, 0.1)",
            }}
          >
            <h2 className="text-3xl font-bold mb-4 text-white">
              Pronto para <span className="text-[#5DC0E7]">transformar</span> suas ideias em realidade?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Entre em contato conosco e vamos transformar suas ideias em soluções digitais inovadoras que impulsionarão
              seu negócio para o infinito.
            </p>
            <Button className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white shadow-[0_0_10px_rgba(93,192,231,0.3)]">
              Solicitar orçamento agora <Rocket className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Animated Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
        <style jsx global>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    </main>
  )
}
