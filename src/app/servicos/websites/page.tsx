"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Globe, Zap, Search, Smartphone, Code, Rocket, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpaceBackground from "@/components/space-background"
import { OptimizedImage } from '@/components/ui/optimized-image'

export default function WebsitesPage() {
  return (
    <main className="flex flex-col items-center justify-center w-full">
      {/* Hero Section - Space Theme */}
      <section className="w-full min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0A0F] text-[#FBFBFB]">
        <SpaceBackground />

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/90 to-[#0A0A0F]/80 z-10"></div>
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full opacity-20">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-[#5DC0E7]/20"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#FBFBFB]">
                Websites <span className="text-[#5DC0E7]">Profissionais</span>
              </h1>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Sites institucionais modernos, rápidos, responsivos e otimizados para SEO. Desenvolvemos websites que
                não apenas impressionam visualmente, mas também geram resultados para o seu negócio.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white relative overflow-hidden group"
              >
                <Link href="/orcamento">
                  <span className="relative z-10 flex items-center">
                    Solicitar Orçamento{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/30">
                <OptimizedImage
                  src="/images/processoatomação.webp"
                  alt="Website Profissional"
                  width={600}
                  height={600}
                  priority={true}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elementos flutuantes */}
              <motion.div
                className="absolute top-1/4 right-1/4 w-12 h-12 z-20"
                animate={{
                  y: [0, -15, 0],
                  rotate: 360,
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <Globe className="text-[#5DC0E7] w-full h-full" />
              </motion.div>

              <motion.div
                className="absolute bottom-1/4 left-1/4 w-10 h-10 z-20"
                animate={{
                  y: [0, 15, 0],
                  rotate: -360,
                }}
                transition={{
                  y: {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 25,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }}
              >
                <Code className="text-[#5DC0E7] w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Orbital Design */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0A0A0F] to-[#141420] text-[#FBFBFB] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#5DC0E7]/30 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#5DC0E7]/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#5DC0E7]/10 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
              Por que ter um <span className="text-[#5DC0E7]">website profissional</span>?
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#FBFBFB]/80">
              Um website bem desenvolvido é essencial para estabelecer sua presença online e conquistar novos clientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-10 w-10" />,
                title: "Presença Online 24/7",
                description:
                  "Seu negócio disponível para clientes potenciais a qualquer hora do dia, todos os dias da semana.",
              },
              {
                icon: <Search className="h-10 w-10" />,
                title: "Visibilidade nos Buscadores",
                description:
                  "Seja encontrado por quem procura pelos seus produtos ou serviços através de otimização para SEO.",
              },
              {
                icon: <Smartphone className="h-10 w-10" />,
                title: "Experiência Responsiva",
                description:
                  "Sites adaptados para todos os dispositivos, garantindo a melhor experiência em smartphones, tablets e desktops.",
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: "Velocidade de Carregamento",
                description:
                  "Páginas rápidas que mantêm os visitantes engajados e melhoram o posicionamento nos buscadores.",
              },
              {
                icon: <Code className="h-10 w-10" />,
                title: "Código Limpo e Otimizado",
                description:
                  "Desenvolvimento com as melhores práticas, garantindo performance, segurança e facilidade de manutenção.",
              },
              {
                icon: <CheckCircle className="h-10 w-10" />,
                title: "Credibilidade e Profissionalismo",
                description:
                  "Um site bem desenvolvido transmite confiança e profissionalismo para seus clientes e parceiros.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="bg-[#FBFBFB]/5 backdrop-blur-sm p-6 rounded-lg border border-[#5DC0E7]/20 hover:border-[#5DC0E7]/50 transition-all duration-300"
              >
                <div className="text-[#5DC0E7] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#FBFBFB]">{feature.title}</h3>
                <p className="text-[#FBFBFB]/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Interactive Timeline */}
      <section className="w-full py-20 bg-[#FBFBFB] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#5DC0E7]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#5DC0E7]/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#212227]">
              Nosso <span className="text-[#5DC0E7]">Processo</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Conheça as etapas do desenvolvimento do seu website, desde a concepção até a entrega final.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="space-y-12">
                {[
                  {
                    number: "01",
                    title: "Briefing e Planejamento",
                    description:
                      "Entendemos suas necessidades, objetivos e público-alvo para planejar a melhor estratégia para seu website.",
                  },
                  {
                    number: "02",
                    title: "Design e Prototipagem",
                    description:
                      "Criamos layouts modernos e intuitivos, alinhados com sua identidade visual e otimizados para conversão.",
                  },
                  {
                    number: "03",
                    title: "Desenvolvimento",
                    description:
                      "Transformamos o design em código, utilizando as tecnologias mais modernas e seguindo as melhores práticas.",
                  },
                  {
                    number: "04",
                    title: "Testes e Otimização",
                    description:
                      "Realizamos testes rigorosos para garantir que tudo funcione perfeitamente em todos os dispositivos e navegadores.",
                  },
                  {
                    number: "05",
                    title: "Lançamento e Suporte",
                    description:
                      "Publicamos seu site e oferecemos suporte contínuo para garantir que ele continue funcionando perfeitamente.",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="mr-6">
                      <motion.div
                        className="h-12 w-12 rounded-full bg-[#5DC0E7]/10 flex items-center justify-center text-[#5DC0E7] font-bold"
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: "rgba(93, 192, 231, 0.2)",
                        }}
                      >
                        {step.number}
                      </motion.div>
                      {index < 4 && (
                        <motion.div
                          className="h-12 w-0.5 bg-[#5DC0E7]/10 mx-auto mt-2"
                          initial={{ height: 0 }}
                          whileInView={{ height: 48 }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                          viewport={{ once: true }}
                        ></motion.div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-[#212227]">{step.title}</h3>
                      <p className="text-[#212227]/80">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl border-4 border-[#5DC0E7]/10">
                <OptimizedImage
                  src="/images/processodedesenvolvimentowebsite.webp"
                  alt="Processo de desenvolvimento de website"
                  width={1920}
                  height={1080}
                  priority={true}
                  className="w-full h-full object-cover"
                />

                {/* Overlay com efeito de código */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 to-transparent opacity-60">
                  <div className="absolute inset-0 text-[#5DC0E7]/30 text-xs overflow-hidden font-mono p-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="my-1">
                        {`<div className="${i % 2 === 0 ? "flex items-center" : "grid grid-cols-2"}">`}
                        {`  <Component data={${i * 10}} />`}
                        {`</div>`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-[#5DC0E7]/10 rounded-full z-0"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#5DC0E7]/20 rounded-full z-0"></div>

              {/* Elemento flutuante */}
              <motion.div
                className="absolute top-10 right-10 z-20"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Rocket className="h-12 w-12 text-[#5DC0E7]" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section - Interactive Cards */}
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
              Nossos <span className="text-[#5DC0E7]">Projetos</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-[#212227]/80">
              Confira alguns dos websites que desenvolvemos para nossos clientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "/images/projetos-home/projeto01.png",
                title: "JH Telecom",
                description: "Site gerador de parcerias",
                tech: ["React", "Node.js", "MongoDB"],
                link: "https://jhtele.com.br",
              },
              {
                image: "/images/projetos-home/projeto03.png",
                title: "ACC Telecom",
                description: "Geração de leads + automações internas",
                tech: ["Next.js", "Firebase", "Tailwind CSS"],
                link: "https://acctelecom.com.br",
              },
              {
                image: "/images/projetos-home/projeto02.png",
                title: "Emilie Banko",
                description: "Site para locação de casas com captação de leads",
                tech: ["React", "PostgreSQL"],
                link: "https://emilie-banko-k2kj4990t-kaykypaulinoalvesdossantos.vercel.app",
              },
            ].map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={600}
                    height={400}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#212227] to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>

                  {/* Overlay com efeito de partículas */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-[#5DC0E7]"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-[#212227]">{project.title}</h3>
                  <p className="text-[#212227]/80 mb-4">{project.description}</p>
                  <Link
                    href={project.link}
                    className="text-[#5DC0E7] font-medium hover:text-[#5DC0E7]/80 flex items-center group"
                  >
                    Ver detalhes <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#5DC0E7] text-[#5DC0E7] hover:bg-[#5DC0E7]/10 relative bg-transparent dark:bg-transparent overflow-hidden group dark:border-[#5DC0E7] dark:text-[#5DC0E7] dark:hover:bg-[#5DC0E7]/10"
            >
              <Link href="/portfolio">
                <span className="relative z-10 flex items-center">
                  Ver todos os projetos{" "}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-[#5DC0E7]/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - Space Theme */}
      <section className="w-full py-20 bg-[#0A0A0F] text-[#FBFBFB] relative overflow-hidden">
        <SpaceBackground />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#FBFBFB]">
                Pronto para lançar seu <span className="text-[#5DC0E7]">website</span> no universo digital?
              </h2>
              <p className="text-lg mb-8 text-[#FBFBFB]/80">
                Entre em contato conosco e vamos transformar sua ideia em um website profissional e eficiente.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#5DC0E7] hover:bg-[#5DC0E7]/80 text-white relative overflow-hidden group"
              >
                <Link href="/orcamento">
                  <span className="relative z-10 flex items-center">
                    Solicitar Orçamento{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Elementos flutuantes */}
        <motion.div
          className="absolute bottom-10 left-10 w-16 h-16 z-10"
          animate={{
            y: [0, -20, 0],
            rotate: 360,
          }}
          transition={{
            y: {
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            rotate: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <Star className="text-[#5DC0E7] w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-10 right-10 w-20 h-20 z-10"
          animate={{
            y: [0, 20, 0],
            rotate: -360,
          }}
          transition={{
            y: {
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            rotate: {
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <Globe className="text-[#5DC0E7]/30 w-full h-full" />
        </motion.div>
      </section>
    </main>
  )
}
