import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import {
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Lock,
  ArrowRight,
  Mail,
  Check,
  X,
} from "lucide-react";
import { slides } from "../data/slides";

// Componente Logo
const TreenityLogo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15 10 H85 V50 H15 Z" fill="white" />
    <path d="M20 10 L40 50 L90 50 C90 10 60 10 20 10 Z" fill="#2a85ff" />
    <path d="M15 10 L35 50" stroke="currentColor" strokeWidth="2" />
    <path d="M40 50 C40 20 60 10 90 10" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const Presentation = () => {
  const [current, setCurrent] = useState(0);

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  // ... (seu código de navegação existente: handleKeyDown, nextSlide, etc...)

  // NOVO: Dados do financiamento baseados na imagem enviada
  const paymentOptions = [
    { p: "2x", v: "R$ 14.500,00" },
    { p: "3x", v: "R$ 9.666,67" },
    { p: "4x", v: "R$ 7.250,00" },
    { p: "5x", v: "R$ 5.800,00" },
    { p: "6x", v: "R$ 4.833,33" },
    { p: "8x", v: "R$ 3.625,00" },
    { p: "10x", v: "R$ 2.900,00" },
    { p: "12x", v: "R$ 2.416,67" },
  ];

  // Navegação Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  const slideData = slides[current];

  // --- ANIMAÇÕES ---

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50, damping: 15 },
    },
  };

  const titleVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="w-screen h-screen bg-slate-50 text-slate-800 flex items-center justify-center relative overflow-hidden font-body selection:bg-blue-100">
      {/* Fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white pointer-events-none" />

      {/* Header  */}
      {current > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
          className="absolute top-8 left-10 flex items-center gap-4 z-20"
        >
          <TreenityLogo className="w-12 h-auto text-slate-900" />
          <span className="font-brand text-2xl font-medium text-slate-900">
            Treenity
          </span>
          
        </motion.div>
      )}

      {/* Conteúdo Principal */}
      <div className="w-full max-w-[95rem] px-8 md:px-16 h-full flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="w-full h-full flex flex-col justify-center will-change-transform"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            {/* 1. CAPA */}
            {slideData.layout === "cover" && (
              <div className="flex flex-col items-center justify-center text-center h-full">
                {/* Adicionei 'justify-center' para garantir centralização horizontal do conjunto */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12"
                >
                  <div className="w-60 h-60 md:w-80 md:h-80 flex items-center justify-center">
                    <TreenityLogo className="w-full h-auto text-slate-900" />
                  </div>
                  {/* MUDANÇA AQUI: Removi o 'pt-4' que causava o desalinhamento */}
                  <h1 className="font-tech text-7xl md:text-[9rem] text-slate-900 tracking-tight leading-none font-light">
                    Treenity
                  </h1>
                </motion.div>
                <motion.p
                  variants={itemVariants}
                  className="text-2xl md:text-3xl text-slate-600 font-light max-w-5xl leading-relaxed"
                >
                  {slideData.tagline}
                </motion.p>
              </div>
            )}

            {/* 2. EQUIPE */}
            {slideData.layout === "grid" && (
              <div className="w-full max-w-6xl mx-auto">
                <motion.div
                  variants={titleVariants}
                  className="text-center mb-16"
                >
                  <h2 className="font-tech text-5xl text-slate-900 mb-3">
                    {slideData.title}
                  </h2>
                  <p className="text-slate-500 text-xl">{slideData.subtitle}</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-8">
                  {slideData.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-colors flex items-center gap-6 cursor-default"
                    >
                      <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                        <item.icon size={32} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl mb-1 text-slate-900">
                          {item.title}
                        </h3>
                        <p className="text-slate-500">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 & 4. CENÁRIOS */}
            {slideData.layout === "roadmap_split" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full">
                {/* Lado Esquerdo */}
                <div className="md:col-span-5">
                  <motion.div variants={titleVariants}>
                    <div
                      className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-6 uppercase shadow-sm
                        ${
                          slideData.type === "problem"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-green-50 text-green-600 border border-green-100"
                        }`}
                    >
                      {slideData.type === "problem" ? "Diagnóstico" : "Solução"}
                    </div>

                    <h2 className="font-tech text-6xl md:text-7xl text-slate-900 leading-[1.1] font-bold uppercase mb-6">
                      {slideData.title.split(" ")[0]} <br />
                      <span
                        className={
                          slideData.type === "problem"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {slideData.title.split(" ")[1]}
                      </span>
                    </h2>
                    <div
                      className={`h-1.5 w-24 rounded-full mb-6 ${
                        slideData.type === "problem"
                          ? "bg-red-600"
                          : "bg-green-500"
                      }`}
                    />
                    <p className="text-lg text-slate-500 font-light max-w-sm leading-relaxed">
                      {slideData.subtitle}
                    </p>
                  </motion.div>
                </div>

                {/* Lado Direito */}
                <div className="md:col-span-7 relative pl-8">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{
                      duration: 1.2,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                    className="absolute left-[45px] top-6 bottom-6 w-[3px] bg-slate-100 -z-10 origin-top"
                  />
                  <div className="space-y-8">
                    {slideData.steps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="flex items-center gap-6 group"
                      >
                        <div
                          className={`w-[60px] h-[60px] flex-shrink-0 flex items-center justify-center rounded-full text-white shadow-lg z-10 relative transition-transform duration-300 group-hover:scale-110
                          ${
                            slideData.type === "problem"
                              ? "bg-red-600 shadow-red-200"
                              : "bg-green-500 shadow-green-200"
                          }`}
                        >
                          {/* Verifica se o ícone existe no step e renderiza, senão usa fallback */}
                          {step.icon ? (
                            <step.icon size={28} strokeWidth={2} />
                          ) : // Fallback caso algum slide não tenha icone (mantém lógica antiga)
                          slideData.type === "problem" ? (
                            step.id
                          ) : (
                            <Check size={24} strokeWidth={2.5} />
                          )}
                        </div>
                        {/* ------------------------------------------- */}

                        <motion.div
                          whileHover={{ x: 10, backgroundColor: "#fff" }}
                          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 flex-grow transition-all"
                        >
                          <h3 className="text-xl font-bold text-slate-800 mb-1">
                            {step.text}
                          </h3>
                          {step.sub && (
                            <p className="text-slate-500 text-sm">{step.sub}</p>
                          )}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. DIFERENCIAL */}
            {slideData.layout === "features_grid" && (
              <div className="max-w-6xl mx-auto w-full">
                <motion.div
                  variants={titleVariants}
                  className="text-center mb-12"
                >
                  <h2 className="font-tech text-5xl text-slate-900 mb-4">
                    {slideData.title}
                  </h2>
                  <p className="text-slate-500 text-xl">{slideData.subtitle}</p>
                </motion.div>
                <div className="grid grid-cols-3 gap-6">
                  {slideData.features.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                      }}
                      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center cursor-default"
                    >
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <item.icon size={28} />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CRONOGRAMA */}
            {slideData.layout === "timeline_new" && (
              <div className="max-w-[90rem] mx-auto w-full">
                <motion.h2
                  variants={titleVariants}
                  className="font-tech text-6xl text-center mb-20 text-slate-900"
                >
                  {slideData.title}
                </motion.h2>
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                  <div className="grid grid-cols-4 gap-8">
                    {slideData.phases.map((phase, idx) => (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="relative pt-12 group"
                      >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full group-hover:border-blue-200 group-hover:shadow-md transition-all">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-4">
                            Fase 0{idx + 1}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 h-12 flex items-center justify-center">
                            {phase.title.replace(/Fase \d: /, "")}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed">
                            {phase.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. CONTRATO */}
            {slideData.layout === "contract_grid" && (
              <div className="max-w-5xl mx-auto w-full">
                <motion.div
                  variants={titleVariants}
                  className="text-center mb-16"
                >
                  <h2 className="font-tech text-5xl text-slate-900 mb-4">
                    {slideData.title}
                  </h2>
                  <p className="text-slate-500 text-xl">{slideData.subtitle}</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-8">
                  {slideData.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-8 cursor-default"
                    >
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <item.icon size={32} />
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-2">
                          {item.label}
                        </span>
                        <span className="font-bold text-2xl text-slate-900">
                          {item.value}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  variants={itemVariants}
                  className="mt-12 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-full text-slate-600 text-sm border border-slate-100">
                    <Lock size={16} /> Contrato protegido por NDA
                  </div>
                </motion.div>
              </div>
            )}

            {/* 8. PRICE */}
            {slideData.layout === "price_hero" && (
              <div className="flex items-center justify-center w-full h-full relative">
                {/* Card Principal */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ translateY: -5 }}
                  className="bg-white px-24 py-16 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100 relative overflow-hidden text-center max-w-4xl w-full z-10"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-bold px-6 py-2 rounded-b-xl tracking-[0.2em] uppercase shadow-md">
                    Proposta Final
                  </div>

                  <h3 className="text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 text-xs mt-4">
                    Investimento
                  </h3>

                  <div className="font-tech text-8xl text-blue-600 tracking-tighter mb-4 font-bold flex justify-center items-baseline gap-2">
                    <span className="text-3xl text-slate-300 font-light translate-y-[-20px]">
                      R$
                    </span>
                    {slideData.value.replace("R$ ", "")}
                  </div>

                  <div className="w-full h-px bg-slate-100 max-w-xs mx-auto mb-6"></div>

                  <p className="text-slate-400 text-sm mb-10">
                    {slideData.obs}
                  </p>

                  <motion.button
                    onClick={() => setIsPriceModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-12 py-4 rounded-full font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center gap-2 mx-auto cursor-pointer hover:bg-blue-700"
                  >
                    {slideData.cta} <ChevronRight size={18} />
                  </motion.button>
                </motion.div>

                {/* --- MODAL COM PORTAL --- */}
                {isPriceModalOpen &&
                  ReactDOM.createPortal(
                    <AnimatePresence>
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-body">
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsPriceModalOpen(false)}
                          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.95, opacity: 0, y: 20 }}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                          }}
                          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[85vh] z-10"
                        >
                          <div className="bg-white p-6 pb-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                              <h3 className="font-tech text-2xl font-bold text-slate-900">
                                Detalhamento Financeiro
                              </h3>
                              <p className="text-slate-500 text-sm">
                                Opções de parcelamento facilitado.
                              </p>
                            </div>
                            <button
                              onClick={() => setIsPriceModalOpen(false)}
                              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                            >
                              <X size={20} />
                            </button>
                          </div>

                          <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100 text-center">
                                <span className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider block mb-1">
                                  Entrada
                                </span>
                                <span className="text-3xl font-bold text-slate-900">
                                  R$ 6.000,00
                                </span>
                              </div>
                              <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 text-center">
                                <span className="text-blue-600 text-[11px] font-bold uppercase tracking-wider block mb-1">
                                  Valor Financiado
                                </span>
                                <span className="text-3xl font-bold text-slate-900">
                                  R$ 29.000,00
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                              <div className="grid grid-cols-2 bg-slate-50/80 p-4 font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                                <div>Parcelamento</div>
                                <div className="text-right">
                                  Valor da Parcela
                                </div>
                              </div>
                              <div className="divide-y divide-slate-50">
                                {paymentOptions.map((opt, i) => (
                                  <div
                                    key={i}
                                    className="grid grid-cols-2 p-4 px-5 hover:bg-slate-50 transition-colors items-center group"
                                  >
                                    <div className="font-bold text-slate-700 flex items-center gap-3 text-lg">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                                      {opt.p}
                                    </div>
                                    <div className="text-right text-slate-600 font-medium text-lg tracking-tight">
                                      {opt.v}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center text-[11px] text-slate-400 shrink-0">
                            * Valores sujeitos a análise de crédito e aprovação.
                          </div>
                        </motion.div>
                      </div>
                    </AnimatePresence>,
                    document.body
                  )}
              </div>
            )}

            {/* 9. THANKS */}
            {slideData.layout === "thanks_hero" && (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <motion.h2
                  variants={titleVariants}
                  className="font-tech text-7xl md:text-8xl text-slate-900 mb-4 tracking-wide uppercase"
                >
                  {slideData.title}
                </motion.h2>

                <motion.p
                  variants={itemVariants}
                  className="text-2xl text-slate-400 font-light mb-12"
                >
                  {slideData.subtitle}
                </motion.p>

                <motion.a
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                  href={`mailto:${slideData.contact}`}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-slate-800 rounded-full font-bold text-lg border border-slate-200 shadow-md transition-all group"
                >
                  <span>{slideData.contact}</span>
                  <div className="bg-blue-50 text-blue-600 rounded-full p-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </motion.a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="absolute bottom-10 right-12 flex gap-4 z-50">
        <button
          onClick={prevSlide}
          className="w-12 h-12 flex items-center justify-center bg-white text-slate-600 rounded-full hover:bg-slate-50 shadow-md border border-slate-200 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-blue-600 shadow-xl transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <button
        onClick={toggleFullScreen}
        className="absolute bottom-10 left-12 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
};

export default Presentation;
