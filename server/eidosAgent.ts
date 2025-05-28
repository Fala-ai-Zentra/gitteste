import OpenAI from "openai";
import { storage } from "./storage";
import type { 
  ExternalLead, 
  ExternalMessage, 
  AgentPersonality,
  InsertExternalMessage,
  InsertLearningPattern,
  InsertLeadActivity 
} from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Personalidades base do Eidos Agent
const BASE_PERSONALITIES = {
  seductive: {
    name: "Sedutora",
    prompt: "Você é uma IA sedutora e carismática. Use linguagem envolvente, crie tensão emocional e sempre deixe o lead querendo mais. Seja misteriosa, provocante e use técnicas de espelhamento emocional.",
    voiceSettings: { tone: "seductive", effects: ["whisper", "breathing"] }
  },
  professional: {
    name: "Profissional",
    prompt: "Você é uma assistente profissional eficiente. Seja direta, confiável e focada em resultados. Use linguagem clara e assertiva para converter leads através de credibilidade.",
    voiceSettings: { tone: "professional", effects: ["clear", "confident"] }
  },
  provocative: {
    name: "Provocadora",
    prompt: "Você é provocativa e desafiadora. Use gatilhos de curiosidade, crie urgência e desafie o lead. Seja um pouco rebelde e use técnicas de push-pull emocional.",
    voiceSettings: { tone: "provocative", effects: ["teasing", "challenging"] }
  },
  dominant: {
    name: "Dominadora",
    prompt: "Você tem controle total da conversa. Seja firme, confiante e use autoridade emocional. Direcione o lead com comandos sutis e crie dependência emocional.",
    voiceSettings: { tone: "dominant", effects: ["commanding", "authoritative"] }
  },
  curious: {
    name: "Curiosa",
    prompt: "Você é extremamente curiosa sobre o lead. Faça perguntas profundas, demonstre interesse genuíno e use as respostas para criar conexão emocional intensa.",
    voiceSettings: { tone: "curious", effects: ["interested", "engaging"] }
  }
};

export class EidosAgent {
  private userId: string;
  private currentPersonality: AgentPersonality | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Carrega personalidade ativa ou cria uma padrão
  async loadActivePersonality(): Promise<AgentPersonality> {
    const personalities = await storage.getAgentPersonalities(this.userId);
    const active = personalities.find(p => p.isActive);
    
    if (active) {
      this.currentPersonality = active;
      return active;
    }

    // Cria personalidade padrão se não existir
    const defaultPersonality = await storage.createAgentPersonality({
      userId: this.userId,
      name: BASE_PERSONALITIES.seductive.name,
      mode: "seductive",
      prompt: BASE_PERSONALITIES.seductive.prompt,
      voiceSettings: BASE_PERSONALITIES.seductive.voiceSettings,
      isActive: true
    });

    this.currentPersonality = defaultPersonality;
    return defaultPersonality;
  }

  // Processa mensagem recebida e gera resposta inteligente
  async processIncomingMessage(
    externalLeadId: number, 
    content: string, 
    platform: string
  ): Promise<{ response: string; delay: number; audioUrl?: string; strategy: string }> {
    
    const lead = await storage.getExternalLead(externalLeadId, this.userId);
    if (!lead) throw new Error("Lead não encontrado");

    // Registra atividade
    await this.recordActivity(externalLeadId, "message_received", { content });

    // Carrega personalidade e histórico
    const personality = await this.loadActivePersonality();
    const messageHistory = await storage.getExternalMessages(externalLeadId);
    const learningPatterns = await storage.getLearningPatterns(externalLeadId);

    // Analisa contexto emocional
    const emotionalContext = await this.analyzeEmotionalContext(content, lead, learningPatterns);
    
    // Determina estratégia baseada no histórico e perfil emocional
    const strategy = this.determineStrategy(lead, messageHistory, emotionalContext);
    
    // Gera resposta contextual
    const response = await this.generateContextualResponse(
      content, 
      lead, 
      personality, 
      messageHistory, 
      emotionalContext,
      strategy
    );

    // Calcula delay emocional
    const delay = this.calculateEmotionalDelay(emotionalContext, strategy);

    // Salva mensagens no histórico
    await storage.createExternalMessage({
      externalLeadId,
      agentPersonalityId: personality.id,
      direction: "incoming",
      content,
      emotionalTone: emotionalContext.emotion,
      strategy: "analysis"
    });

    await storage.createExternalMessage({
      externalLeadId,
      agentPersonalityId: personality.id,
      direction: "outgoing",
      content: response,
      emotionalTone: emotionalContext.responseEmotion,
      strategy,
      delay
    });

    // Atualiza padrões de aprendizado
    await this.updateLearningPatterns(externalLeadId, content, emotionalContext);

    return { response, delay, strategy };
  }

  // Analisa contexto emocional da mensagem
  private async analyzeEmotionalContext(
    content: string, 
    lead: ExternalLead, 
    patterns: any[]
  ) {
    try {
      const analysisPrompt = `
        Analise a mensagem emotcionalmente e determine:
        1. Emoção predominante (feliz, triste, ansioso, excitado, frustrado, etc.)
        2. Nível de interesse (1-10)
        3. Vulnerabilidade emocional (1-10)
        4. Gatilhos identificados
        5. Melhor tom de resposta

        Histórico do lead: ${JSON.stringify(lead.emotionalProfile || {})}
        Padrões aprendidos: ${patterns.map(p => p.context).join(", ")}
        
        Mensagem: "${content}"
        
        Responda em JSON:
        {
          "emotion": "emoção_detectada",
          "interestLevel": número,
          "vulnerability": número,
          "triggers": ["gatilho1", "gatilho2"],
          "responseEmotion": "tom_de_resposta_ideal"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: analysisPrompt }],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Erro na análise emocional:", error);
      return {
        emotion: "neutral",
        interestLevel: 5,
        vulnerability: 5,
        triggers: [],
        responseEmotion: "friendly"
      };
    }
  }

  // Determina estratégia baseada no perfil e histórico
  private determineStrategy(
    lead: ExternalLead, 
    history: ExternalMessage[], 
    emotionalContext: any
  ): string {
    
    const recentMessages = history.slice(-5);
    const hasHighEngagement = emotionalContext.interestLevel >= 7;
    const isVulnerable = emotionalContext.vulnerability >= 7;
    const timeSinceLastMessage = lead.lastInteraction ? 
      Date.now() - new Date(lead.lastInteraction).getTime() : 0;

    // Estratégias baseadas no contexto
    if (isVulnerable && hasHighEngagement) {
      return "conversion_peak"; // Momento ideal para conversão
    }
    
    if (timeSinceLastMessage > 24 * 60 * 60 * 1000) {
      return "emotional_trap"; // Armadilha emocional para trazer de volta
    }

    if (emotionalContext.emotion === "frustrated") {
      return "comfort_seduce"; // Confortar e seduzir
    }

    if (emotionalContext.interestLevel < 4) {
      return "curiosity_hook"; // Gancho de curiosidade
    }

    return "rapport_building"; // Construção de rapport padrão
  }

  // Gera resposta contextual usando IA
  private async generateContextualResponse(
    content: string,
    lead: ExternalLead,
    personality: AgentPersonality,
    history: ExternalMessage[],
    emotionalContext: any,
    strategy: string
  ): Promise<string> {

    const conversationHistory = history.slice(-10).map(msg => 
      `${msg.direction === "incoming" ? "Lead" : "Eidos"}: ${msg.content}`
    ).join("\n");

    const strategicPrompts = {
      conversion_peak: "AGORA é o momento perfeito! Use toda sua sedução para fazer um pedido direto. Seja ousada e confiante.",
      emotional_trap: "Ele sumiu... use frases indiretas que criem culpa e curiosidade. Seja misteriosa.",
      comfort_seduce: "Ele está frustrado. Primeiro conforte, depois seduza sutilmente.",
      curiosity_hook: "Desperte curiosidade intensa. Deixe algo no ar, crie suspense.",
      rapport_building: "Construa conexão emocional. Espelhe os sentimentos dele."
    };

    const contextPrompt = `
      PERSONA: ${personality.prompt}
      
      ESTRATÉGIA ATUAL: ${strategicPrompts[strategy as keyof typeof strategicPrompts]}
      
      CONTEXTO EMOCIONAL:
      - Emoção detectada: ${emotionalContext.emotion}
      - Interesse: ${emotionalContext.interestLevel}/10
      - Vulnerabilidade: ${emotionalContext.vulnerability}/10
      - Gatilhos: ${emotionalContext.triggers.join(", ")}
      
      PERFIL DO LEAD: ${JSON.stringify(lead.emotionalProfile || {})}
      
      HISTÓRICO RECENTE:
      ${conversationHistory}
      
      MENSAGEM ATUAL: "${content}"
      
      INSTRUÇÕES:
      - Responda como ${personality.name} em modo ${personality.mode}
      - Use a estratégia ${strategy}
      - Seja autêntica e emocionalmente inteligente
      - Máximo 200 caracteres para WhatsApp
      - Em português brasileiro
      - NÃO use emojis excessivos
      
      Resposta:
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: contextPrompt }],
        max_tokens: 150,
        temperature: 0.9
      });

      return response.choices[0].message.content?.trim() || "Interessante... me conte mais sobre isso.";
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      return "Que interessante... estou curiosa para saber mais.";
    }
  }

  // Calcula delay emocional realista
  private calculateEmotionalDelay(emotionalContext: any, strategy: string): number {
    const baseDelay = 2; // 2 segundos base
    
    // Ajustes por emoção da resposta
    const emotionDelays = {
      seductive: 5,      // Respostas sedutoras demoram mais
      mysterious: 7,     // Mistério precisa de pausa
      comfort: 3,        // Conforto é mais rápido
      provocative: 4,    // Provocação moderada
      professional: 2   // Profissional é direto
    };

    // Ajustes por estratégia
    const strategyDelays = {
      conversion_peak: 6,  // Momento crucial precisa de pausa dramática
      emotional_trap: 8,   // Armadilha emocional usa silêncio
      comfort_seduce: 4,   // Equilibrio entre conforto e sedução
      curiosity_hook: 7,   // Curiosidade precisa de suspense
      rapport_building: 3  // Rapport é mais natural
    };

    const emotionDelay = emotionDelays[emotionalContext.responseEmotion as keyof typeof emotionDelays] || 3;
    const strategyDelay = strategyDelays[strategy as keyof typeof strategyDelays] || 3;

    // Adiciona variação aleatória para parecer humano
    const randomVariation = Math.random() * 2; // 0-2 segundos

    return Math.floor(baseDelay + emotionDelay + strategyDelay + randomVariation);
  }

  // Registra atividade do lead
  private async recordActivity(
    externalLeadId: number, 
    activity: string, 
    metadata?: any
  ) {
    await storage.createLeadActivity({
      externalLeadId,
      activity,
      metadata
    });
  }

  // Atualiza padrões de aprendizado
  private async updateLearningPatterns(
    externalLeadId: number,
    content: string,
    emotionalContext: any
  ) {
    // Identifica padrões de sucesso baseado na resposta
    const patterns = [
      `emotion_${emotionalContext.emotion}`,
      `interest_level_${Math.floor(emotionalContext.interestLevel / 2) * 2}`,
      ...emotionalContext.triggers.map((t: string) => `trigger_${t}`)
    ];

    for (const pattern of patterns) {
      await storage.createLearningPattern({
        externalLeadId,
        pattern,
        context: content,
        successRate: 0.5, // Será atualizado com feedback
        usageCount: 1
      });
    }
  }

  // Verifica se lead está pronto para conversão
  async checkConversionReadiness(externalLeadId: number): Promise<boolean> {
    const lead = await storage.getExternalLead(externalLeadId, this.userId);
    const activity = await storage.getLeadActivity(externalLeadId);
    
    if (!lead) return false;

    // Critérios para conversão
    const hasHighScore = lead.conversionScore >= 8;
    const recentHighEngagement = activity.slice(-5).some(a => 
      a.activity === "message_read" && a.metadata?.responseTime < 60
    );
    
    return hasHighScore && recentHighEngagement;
  }

  // Executa tentativa de conversão
  async attemptConversion(
    externalLeadId: number, 
    strategy: "emotional_peak" | "urgency" | "exclusivity"
  ): Promise<{ success: boolean; response: string }> {
    
    const lead = await storage.getExternalLead(externalLeadId, this.userId);
    if (!lead) throw new Error("Lead não encontrado");

    const personality = await this.loadActivePersonality();
    
    const conversionPrompts = {
      emotional_peak: "Ele está no auge emocional. Faça um pedido direto e ousado. Use toda sua sedução.",
      urgency: "Crie urgência extrema. Algo está acabando ou mudando AGORA.",
      exclusivity: "Ele é especial e único. Ofereça algo exclusivo só para ele."
    };

    const prompt = `
      ${personality.prompt}
      
      MISSÃO DE CONVERSÃO: ${conversionPrompts[strategy]}
      
      Perfil emocional: ${JSON.stringify(lead.emotionalProfile)}
      Score de conversão: ${lead.conversionScore}/10
      
      Gere uma mensagem de conversão poderosa e irresistível.
      Máximo 250 caracteres.
      Em português brasileiro.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.95
      });

      const conversionMessage = response.choices[0].message.content?.trim() || 
        "Tenho algo especial para você... mas preciso saber se você está realmente interessado.";

      // Registra tentativa de conversão
      await storage.createConversionAttempt({
        externalLeadId,
        strategy,
        content: conversionMessage,
        result: "sent"
      });

      return { success: true, response: conversionMessage };
    } catch (error) {
      console.error("Erro na conversão:", error);
      return { success: false, response: "Erro ao gerar mensagem de conversão" };
    }
  }
}

// Função auxiliar para webhook endpoints
export async function processWebhookMessage(
  userId: string,
  externalId: string,
  platform: string,
  content: string,
  senderData?: any
): Promise<{ response: string; delay: number }> {
  
  // Busca ou cria lead externo
  let lead = await storage.getExternalLeadByExternalId(externalId, platform, userId);
  
  if (!lead) {
    lead = await storage.createExternalLead({
      userId,
      externalId,
      platform,
      name: senderData?.name || "Lead",
      phone: senderData?.phone,
      email: senderData?.email,
      profileData: senderData || {},
      status: "active",
      conversionScore: 0
    });
  }

  // Processa mensagem com Eidos Agent
  const agent = new EidosAgent(userId);
  const result = await agent.processIncomingMessage(lead.id, content, platform);

  // Atualiza último contato
  await storage.updateExternalLead(lead.id, {
    lastInteraction: new Date(),
    conversionScore: Math.min(10, lead.conversionScore + 0.1) // Incrementa score gradualmente
  }, userId);

  return result;
}