"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Server, Lightbulb, TrendingUp, Shield, Users, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConsultoriaPage() {
  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="w-full py-20 bg-[#212227] text-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FBFBFB]">
                <span className="text-[#5DC0E7]">Consultoria</span> Tecnológica
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Consultoria técnica especializada para otimizar seus processos e sistemas. Nossa equipe de especialistas
                ajuda sua empresa a tomar decisões estratégicas e implementar as melhores soluções tecnológicas para o
                seu negócio.
              </p>
              <Button asChild size="lg" className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-[#FBFBFB]">
                <Link href="/orcamento">
                  Solicitar Orçamento <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Technology Consulting"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-20 bg-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212227]">
              Nossos Serviços de <span className="text-[#5DC0E7]">Consultoria</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Oferecemos uma ampla gama de serviços de consultoria para ajudar sua empresa a alcançar seus objetivos
              tecnológicos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Server className="h-10 w-10" />,
                title: "Infraestrutura de TI",
                description:
                  "Avaliação e recomendações para otimizar sua infraestrutura tecnológica, incluindo servidores, redes e cloud computing.",
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Segurança da Informação",
                description:
                  "Análise de vulnerabilidades, implementação de políticas de segurança e conformidade com regulamentações como LGPD.",
              },
              {
                icon: <Workflow className="h-10 w-10" />,
                title: "Transformação Digital",
                description:
                  "Estratégias para digitalizar processos e implementar novas tecnologias que impulsionem a inovação e competitividade.",
              },
              {
                icon: <TrendingUp className="h-10 w-10" />,
                title: "Análise de Dados",
                description:
                  "Implementação de soluções de Business Intelligence e Analytics para extrair insights valiosos dos seus dados.",
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "Gestão de Projetos",
                description:
                  "Acompanhamento e gerenciamento de projetos tecnológicos, garantindo entregas dentro do prazo e orçamento.",
              },
              {
                icon: <Lightbulb className="h-10 w-10" />,
                title: "Inovação Tecnológica",
                description:
                  "Identificação de oportunidades de inovação e implementação de novas tecnologias como IA, IoT e Blockchain.",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className="text-[#5DC0E7] mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#212227]">{service.title}</h3>
                <p className="text-[#212227]/80">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="w-full py-20 bg-gradient-to-b from-[#FBFBFB] to-[#F0F0F0]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212227]">
              Nossa <span className="text-[#5DC0E7]">Metodologia</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Nossa abordagem de consultoria é baseada em um processo estruturado que garante resultados efetivos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-[#212227]">Processo de Consultoria</h3>
              <p className="text-lg mb-6 text-[#212227]/80">
                Nosso processo de consultoria é estruturado para entender profundamente seu negócio, identificar
                oportunidades de melhoria e implementar soluções que tragam resultados tangíveis.
              </p>

              <ul className="space-y-4">
                {[
                  "Diagnóstico inicial e levantamento de requisitos",
                  "Análise da situação atual e identificação de gargalos",
                  "Desenvolvimento de estratégias e recomendações",
                  "Implementação das soluções propostas",
                  "Monitoramento e ajustes contínuos",
                  "Transferência de conhecimento para sua equipe",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#5DC0E7] mr-2 shrink-0 mt-0.5" />
                    <span className="text-[#212227]/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Consulting Process"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="w-full py-20 bg-[#212227] text-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
              Casos de <span className="text-[#5DC0E7]">Sucesso</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Conheça alguns dos resultados que alcançamos para nossos clientes através de nossa consultoria.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Transformação Digital",
                client: "ACC Telecom",
                description:
                  "Implementação de uma estratégia de transformação digital que resultou em redução de 40% nos custos operacionais e aumento de 25% na produtividade.",
              },
              {
                title: "Segurança da Informação",
                client: "Tech Solutions",
                description:
                  "Desenvolvimento e implementação de políticas de segurança que eliminaram vulnerabilidades críticas e garantiram conformidade com a LGPD.",
              },
              {
                title: "Otimização de Processos",
                client: "Smart Factory",
                description:
                  "Análise e redesenho de processos que resultaram em redução de 30% no tempo de ciclo e aumento de 20% na capacidade produtiva.",
              },
            ].map((case_study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#FBFBFB]/5 p-6 rounded-lg backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold mb-2 text-[#5DC0E7]">{case_study.title}</h3>
                <p className="text-sm text-[#FBFBFB]/60 mb-4">Cliente: {case_study.client}</p>
                <p className="text-[#FBFBFB]/80">{case_study.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-[#212227] to-[#2D2E34] text-[#FBFBFB]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
                Pronto para <span className="text-[#5DC0E7]">transformar</span> seu negócio?
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco e descubra como nossa consultoria pode ajudar sua empresa a alcançar novos
                patamares de eficiência e inovação.
              </p>
              <Button asChild size="lg" className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-[#FBFBFB]">
                <Link href="/orcamento">
                  Solicitar Orçamento <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
