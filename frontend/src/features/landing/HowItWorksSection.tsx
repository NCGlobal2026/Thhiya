import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Target, Handshake } from "lucide-react";
import { Container, BrandMark } from "../../components";
import type { LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  gradient: string;
  image: string;
}

const steps: readonly Step[] = [
  {
    icon: Search,
    title: "Discover & Compare",
    description: "Search services by category and country. View transparent pricing, compliance requirements, and provider comparisons in minutes.",
    color: "from-red-500/20 to-orange-500/20",
    gradient: "bg-gradient-to-br from-red-50 to-orange-50",
    image: "/images/discovercompare.png",
  },
  {
    icon: Target,
    title: "Get Matched",
    description: "Submit your requirements and receive curated matches from trusted providers that fit your budget, timeline, and needs.",
    color: "from-navy-500/20 to-navy-400/20",
    gradient: "bg-gradient-to-br from-navy-50 to-gray-50",
    image: "/images/getmatched.png",
  },
  {
    icon: Handshake,
    title: "Connect & Scale",
    description: "Engage directly with vetted partners through our platform. Control your data, manage requests, and scale with confidence.",
    color: "from-navy-600/20 to-navy-500/20",
    gradient: "bg-gradient-to-br from-navy-50 to-navy-100",
    image: "/images/connectscale.png",
  },
] as const;

export const HowItWorksSection: React.FC = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const iconColors = ["bg-red-500", "bg-navy-500", "bg-navy-600"];
  const textColors = ["text-red-500", "text-navy-500", "text-navy-600"];
  const gradientColors = ["from-red-500/10 via-red-400/10 to-red-500/10", "from-navy-500/10 via-navy-400/10 to-navy-500/10", "from-navy-600/10 via-navy-500/10 to-navy-600/10"];
  const ringColors = ["ring-red-500/20", "ring-navy-500/20", "ring-navy-600/20"];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-liner-to-b from-white via-gray-50 to-white py-12 md:py-16 lg:py-20">
      <Container>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mx-auto mb-8 md:mb-10 lg:mb-12 max-w-3xl text-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-3 md:mb-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-red-50 to-orange-50 px-3 py-1.5 md:px-4 md:py-2 text-xs font-semibold text-red-500 shadow-sm ring-1 ring-red-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </span>
            A guided path to clarity
          </motion.div>
          <h2 className="mb-3 md:mb-4 text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl md:text-4xl lg:text-5xl">How <BrandMark className="inline align-baseline" weight="bold" /> Works</h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">From intelligence to partner activation in three precise moves</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isHovered = hoveredStep === index;
            return (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }} onMouseEnter={() => setHoveredStep(index)} onMouseLeave={() => setHoveredStep(null)} className="relative group cursor-pointer flex">
                <motion.div animate={{ scale: isHovered ? 1.02 : 1, y: isHovered ? -4 : 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} className={`relative overflow-hidden rounded-3xl transition-all duration-300 flex flex-col w-full ${isHovered ? `shadow-2xl ring-2 ${ringColors[index]}` : "shadow-xl ring-1 ring-gray-200/50"}`}>
                  <div className="relative aspect-16/10 overflow-hidden bg-gray-50">
                    <motion.div className="absolute inset-0 opacity-20" animate={{ background: isHovered ? [`radial-gradient(circle at 20% 20%, ${["#ef444420", "#a855f720", "#3b82f620"][index]} 0%, transparent 60%)`, `radial-gradient(circle at 80% 80%, ${["#ef444420", "#a855f720", "#3b82f620"][index]} 0%, transparent 60%)`, `radial-gradient(circle at 20% 20%, ${["#ef444420", "#a855f720", "#3b82f620"][index]} 0%, transparent 60%)`] : "radial-gradient(circle at 50% 50%, transparent 0%, transparent 60%)" }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} aria-hidden="true" />
                    <div className="relative z-10 w-full h-full">
                      <motion.img src={step.image} alt={step.title} className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? "scale-105" : "scale-100"}`} loading="lazy" />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent pointer-events-none" aria-hidden="true" />
                  </div>

                  <div className="relative z-10 p-6 flex-1 flex flex-col bg-white">
                    <div className="mb-3 flex items-start gap-3">
                      <motion.div animate={{ scale: isHovered ? 1.1 : 1 }} transition={{ duration: 0.3 }} className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${isHovered ? `${iconColors[index]} shadow-lg` : "bg-gray-100"}`}>
                        <Icon className={`h-6 w-6 transition-colors duration-300 ${isHovered ? "text-white" : "text-gray-400"}`} aria-hidden="true" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isHovered ? textColors[index] : "text-gray-600"}`}>Step {String(index + 1).padStart(2, "0")}</p>
                        <h3 className={`text-lg lg:text-xl font-bold tracking-tight transition-colors duration-300 mt-0.5 ${isHovered ? "text-navy-950" : "text-gray-800"}`}>{step.title}</h3>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${isHovered ? "text-gray-800" : "text-gray-700"}`}>{step.description}</p>
                  </div>

                  {isHovered && <motion.div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" initial={{ x: "-100%" }} animate={{ x: "200%" }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} aria-hidden="true" />}
                </motion.div>

                <motion.div className={`absolute -inset-4 -z-10 blur-3xl transition-opacity duration-300 rounded-3xl ${index === 0 ? "bg-gray-200" : `bg-linear-to-br ${gradientColors[index]}`} ${isHovered ? "opacity-25" : "opacity-0"}`} aria-hidden="true" animate={{ scale: isHovered ? [1, 1.05, 1] : 1 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
