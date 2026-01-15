import { 
  Shield, Users, Layers, Zap, Lock, DollarSign, FileCheck, LayoutGrid, Server, Eye, 
  CalendarX, FileWarning, Database, AlertOctagon, // Ícones de Problema
  CalendarCheck, Clock, FolderCheck, ShieldCheck  // Ícones de Solução
} from 'lucide-react';

export const slides = [
  // 1. INÍCIO
  {
    id: 1,
    layout: "cover",
    title: "Treenity",
    tagline: "Usar a tecnologia para ajudar os outros é a verdadeira essência da inovação.",
  },
  
  // 2. EQUIPE
  {
    id: 2,
    layout: "grid",
    title: "NOSSO TIME",
    subtitle: "Quem faz a mágica acontecer.",
    items: [
      { title: "Tecnologia", desc: "Estabilidade, segurança e infraestrutura.", icon: Shield },
      { title: "Produto & Design", desc: "Foco na experiência do usuário (UX).", icon: Layers },
      { title: "Gestão Ágil", desc: "Organização e cumprimento de prazos.", icon: Users },
      { title: "Integração", desc: "Automação e conectividade de sistemas.", icon: Zap },
    ]
  },

  // 3. CENÁRIO ATUAL (PROBLEMA - Vermelho)
  {
    id: 3,
    layout: "roadmap_split",
    type: "problem",
    title: "CENÁRIO ATUAL",
    subtitle: "Gargalos operacionais identificados hoje.",
    steps: [
      { id: 1, text: "Agendamento Manual", sub: "Dependência de processos humanos.", icon: CalendarX },
      { id: 2, text: "Organização Manual", sub: "Alto consumo de tempo operacional.", icon: FileWarning },
      { id: 3, text: "Dados Descentralizados", sub: "Informações espalhadas e sem padrão.", icon: Database },
      { id: 4, text: "Risco de Perda", sub: "Sem backups automáticos e segurança.", icon: AlertOctagon },
    ]
  },

  // 4. CENÁRIO IDEAL (SOLUÇÃO - Verde)
  {
    id: 4,
    layout: "roadmap_split",
    type: "solution",
    title: "CENÁRIO IDEAL",
    subtitle: "A transformação digital com a Treenity.",
    steps: [
      { id: 1, text: "Agenda Inteligente", sub: "Confirmações automáticas e zero conflitos.", icon: CalendarCheck },
      { id: 2, text: "Automatização", sub: "Mais tempo para atender o paciente.", icon: Clock },
      { id: 3, text: "Prontuário Unificado", sub: "Histórico completo em um clique.", icon: FolderCheck },
      { id: 4, text: "Segurança Total", sub: "Backups na nuvem e conformidade LGPD.", icon: ShieldCheck },
    ]
  },

  // 5. DIFERENCIAL
  {
    id: 5,
    layout: "features_grid",
    title: "DIFERENCIAL TECNOLÓGICO",
    subtitle: "Por que uma solução sob medida supera o genérico.",
    features: [
      { title: "Sem Limites", desc: "Sem restrições de clientes ou fotos.", icon: LayoutGrid },
      { title: "Sem Custos Ocultos", desc: "Fim da cobrança por módulos extras.", icon: DollarSign },
      { title: "Personalização Real", desc: "O sistema se adapta à sua marca.", icon: Layers },
      { title: "Infra Dedicada", desc: "Servidor exclusivo, sem lentidão.", icon: Server },
      { title: "Privacidade", desc: "Banco de dados isolado e seguro.", icon: Lock },
      { title: "Visão 360", desc: "Dashboards gerenciais completos.", icon: Eye },
    ]
  },

  // 6. CRONOGRAMA
  {
    id: 6,
    layout: "timeline_new",
    title: "CRONOGRAMA",
    subtitle: "Implementação em fases para sucesso garantido.",
    phases: [
      { title: "Fase 1: MVP Agenda", desc: "Gestão de atendimentos, rodízio, controle de faltas e avaliações." },
      { title: "Fase 2: Evolução Clínica", desc: "Registro diário, alertas, dashboards e réguas de comunicação." },
      { title: "Fase 3: Financeiro", desc: "Pagamentos integrados, gestão de pacotes e renovação automática." },
      { title: "Fase 4: Universidade", desc: "Área exclusiva para treinamento da equipe e streaming de aulas." },
    ]
  },

  // 7. CONTRATO
  {
    id: 7,
    layout: "contract_grid",
    title: "RESUMO CONTRATUAL",
    subtitle: "Transparência e segurança.",
    items: [
      { label: "Pagamento", value: "30% Entrada + Parcelas", icon: DollarSign },
      { label: "Escopo", value: "Fechado (Garantia de Entrega)", icon: FileCheck },
      { label: "Garantia", value: "3 Meses de Suporte Gratuito", icon: Shield },
      { label: "Propriedade", value: "Código 100% do Cliente", icon: Lock },
    ]
  },

  // 8. VALORES
  {
    id: 8,
    layout: "price_hero",
    title: "INVESTIMENTO",
    value: "R$ XX.000",
    obs: "+ Custo Mensal de Servidor (Infraestrutura)",
    cta: "Iniciar Projeto"
  },

  // 9. AGRADECIMENTO
  {
    id: 9,
    layout: "thanks_hero",
    title: "OBRIGADO",
    subtitle: "Vamos construir o futuro da sua clínica juntos?",
    contact: "contato@treenity.com.br"
  }
];