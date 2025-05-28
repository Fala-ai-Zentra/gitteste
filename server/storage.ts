import {
  users,
  leads,
  conversations,
  messages,
  files,
  integrations,
  metrics,
  agentPersonalities,
  externalLeads,
  externalMessages,
  learningPatterns,
  webhookConfigs,
  leadActivity,
  conversionAttempts,
  type User,
  type UpsertUser,
  type Lead,
  type InsertLead,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type File,
  type InsertFile,
  type Integration,
  type InsertIntegration,
  type Metric,
  type InsertMetric,
  type AgentPersonality,
  type InsertAgentPersonality,
  type ExternalLead,
  type InsertExternalLead,
  type ExternalMessage,
  type InsertExternalMessage,
  type LearningPattern,
  type InsertLearningPattern,
  type WebhookConfig,
  type InsertWebhookConfig,
  type LeadActivity,
  type InsertLeadActivity,
  type ConversionAttempt,
  type InsertConversionAttempt,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export const getProfile = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user || null;
};

export const setProfile = async (userId: string, updates: Partial<UpsertUser>) => {
  const [user] = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user;
};

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Lead operations
  getLeads(userId: string): Promise<Lead[]>;
  getLead(id: number, userId: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>, userId: string): Promise<Lead>;
  deleteLead(id: number, userId: string): Promise<void>;
  
  // Conversation operations
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: number, userId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message operations
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // File operations
  getFiles(userId: string): Promise<File[]>;
  getFile(id: number, userId: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<InsertFile>, userId: string): Promise<File>;
  
  // Integration operations
  getIntegrations(userId: string): Promise<Integration[]>;
  getIntegration(id: number, userId: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<InsertIntegration>, userId: string): Promise<Integration>;
  deleteIntegration(id: number, userId: string): Promise<void>;
  
  // Metrics operations
  getMetrics(userId: string, type?: string): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  
  // Dashboard metrics
  getDashboardMetrics(userId: string): Promise<{
    leadsCount: number;
    aiInteractions: number;
    filesProcessed: number;
    revenue: number;
  }>;

  // Agent Personality operations
  getAgentPersonalities(userId: string): Promise<AgentPersonality[]>;
  getAgentPersonality(id: number, userId: string): Promise<AgentPersonality | undefined>;
  createAgentPersonality(personality: InsertAgentPersonality): Promise<AgentPersonality>;
  updateAgentPersonality(id: number, personality: Partial<InsertAgentPersonality>, userId: string): Promise<AgentPersonality>;
  deleteAgentPersonality(id: number, userId: string): Promise<void>;

  // External Lead operations
  getExternalLeads(userId: string): Promise<ExternalLead[]>;
  getExternalLead(id: number, userId: string): Promise<ExternalLead | undefined>;
  getExternalLeadByExternalId(externalId: string, platform: string, userId: string): Promise<ExternalLead | undefined>;
  createExternalLead(lead: InsertExternalLead): Promise<ExternalLead>;
  updateExternalLead(id: number, lead: Partial<InsertExternalLead>, userId: string): Promise<ExternalLead>;
  deleteExternalLead(id: number, userId: string): Promise<void>;

  // External Message operations
  getExternalMessages(externalLeadId: number): Promise<ExternalMessage[]>;
  createExternalMessage(message: InsertExternalMessage): Promise<ExternalMessage>;

  // Learning Pattern operations
  getLearningPatterns(externalLeadId: number): Promise<LearningPattern[]>;
  createLearningPattern(pattern: InsertLearningPattern): Promise<LearningPattern>;
  updateLearningPattern(id: number, pattern: Partial<InsertLearningPattern>): Promise<LearningPattern>;

  // Webhook Config operations
  getWebhookConfigs(userId: string): Promise<WebhookConfig[]>;
  createWebhookConfig(config: InsertWebhookConfig): Promise<WebhookConfig>;
  updateWebhookConfig(id: number, config: Partial<InsertWebhookConfig>, userId: string): Promise<WebhookConfig>;

  // Lead Activity operations
  getLeadActivity(externalLeadId: number): Promise<LeadActivity[]>;
  createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity>;

  // Conversion Attempt operations
  getConversionAttempts(externalLeadId: number): Promise<ConversionAttempt[]>;
  createConversionAttempt(attempt: InsertConversionAttempt): Promise<ConversionAttempt>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lead operations
  async getLeads(userId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.updatedAt));
  }

  async getLead(id: number, userId: string): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.userId, userId)));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db
      .insert(leads)
      .values(lead)
      .returning();
    return newLead;
  }

  async updateLead(id: number, lead: Partial<InsertLead>, userId: string): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))
      .returning();
    return updatedLead;
  }

  async deleteLead(id: number, userId: string): Promise<void> {
    await db
      .delete(leads)
      .where(and(eq(leads.id, id), eq(leads.userId, userId)));
  }

  // Conversation operations
  async getConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number, userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  // Message operations
  async getMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  // File operations
  async getFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.uploadedAt));
  }

  async getFile(id: number, userId: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
    return file;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async updateFile(id: number, file: Partial<InsertFile>, userId: string): Promise<File> {
    const [updatedFile] = await db
      .update(files)
      .set(file)
      .where(and(eq(files.id, id), eq(files.userId, userId)))
      .returning();
    return updatedFile;
  }

  // Integration operations
  async getIntegrations(userId: string): Promise<Integration[]> {
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, userId))
      .orderBy(desc(integrations.updatedAt));
  }

  async getIntegration(id: number, userId: string): Promise<Integration | undefined> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId)));
    return integration;
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [newIntegration] = await db
      .insert(integrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async updateIntegration(id: number, integration: Partial<InsertIntegration>, userId: string): Promise<Integration> {
    const [updatedIntegration] = await db
      .update(integrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId)))
      .returning();
    return updatedIntegration;
  }

  async deleteIntegration(id: number, userId: string): Promise<void> {
    await db
      .delete(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId)));
  }

  // Metrics operations
  async getMetrics(userId: string, type?: string): Promise<Metric[]> {
    const conditions = [eq(metrics.userId, userId)];
    if (type) {
      conditions.push(eq(metrics.type, type));
    }
    
    return await db
      .select()
      .from(metrics)
      .where(and(...conditions))
      .orderBy(desc(metrics.date));
  }

  async createMetric(metric: InsertMetric): Promise<Metric> {
    const [newMetric] = await db
      .insert(metrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  // Dashboard metrics
  async getDashboardMetrics(userId: string): Promise<{
    leadsCount: number;
    aiInteractions: number;
    filesProcessed: number;
    revenue: number;
  }> {
    const [leadsResult] = await db
      .select({ count: sql`count(*)` })
      .from(leads)
      .where(eq(leads.userId, userId));

    const [filesResult] = await db
      .select({ count: sql`count(*)` })
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.status, "processed")));

    const [interactionsResult] = await db
      .select({ count: sql`count(*)` })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(eq(conversations.userId, userId), eq(messages.role, "assistant")));

    const revenueMetrics = await db
      .select({ value: metrics.value })
      .from(metrics)
      .where(and(eq(metrics.userId, userId), eq(metrics.type, "revenue")))
      .orderBy(desc(metrics.date))
      .limit(1);

    return {
      leadsCount: Number(leadsResult?.count) || 0,
      aiInteractions: Number(interactionsResult?.count) || 0,
      filesProcessed: Number(filesResult?.count) || 0,
      revenue: revenueMetrics[0]?.value || 0,
    };
  }

  // Agent Personality operations
  async getAgentPersonalities(userId: string): Promise<AgentPersonality[]> {
    return await db.select().from(agentPersonalities).where(eq(agentPersonalities.userId, userId));
  }

  async getAgentPersonality(id: number, userId: string): Promise<AgentPersonality | undefined> {
    const [personality] = await db
      .select()
      .from(agentPersonalities)
      .where(and(eq(agentPersonalities.id, id), eq(agentPersonalities.userId, userId)));
    return personality;
  }

  async createAgentPersonality(personality: InsertAgentPersonality): Promise<AgentPersonality> {
    const [newPersonality] = await db
      .insert(agentPersonalities)
      .values(personality)
      .returning();
    return newPersonality;
  }

  async updateAgentPersonality(id: number, personality: Partial<InsertAgentPersonality>, userId: string): Promise<AgentPersonality> {
    const [updated] = await db
      .update(agentPersonalities)
      .set(personality)
      .where(and(eq(agentPersonalities.id, id), eq(agentPersonalities.userId, userId)))
      .returning();
    return updated;
  }

  async deleteAgentPersonality(id: number, userId: string): Promise<void> {
    await db
      .delete(agentPersonalities)
      .where(and(eq(agentPersonalities.id, id), eq(agentPersonalities.userId, userId)));
  }

  // External Lead operations
  async getExternalLeads(userId: string): Promise<ExternalLead[]> {
    return await db.select().from(externalLeads).where(eq(externalLeads.userId, userId)).orderBy(desc(externalLeads.lastInteraction));
  }

  async getExternalLead(id: number, userId: string): Promise<ExternalLead | undefined> {
    const [lead] = await db
      .select()
      .from(externalLeads)
      .where(and(eq(externalLeads.id, id), eq(externalLeads.userId, userId)));
    return lead;
  }

  async getExternalLeadByExternalId(externalId: string, platform: string, userId: string): Promise<ExternalLead | undefined> {
    const [lead] = await db
      .select()
      .from(externalLeads)
      .where(and(
        eq(externalLeads.externalId, externalId), 
        eq(externalLeads.platform, platform),
        eq(externalLeads.userId, userId)
      ));
    return lead;
  }

  async createExternalLead(lead: InsertExternalLead): Promise<ExternalLead> {
    const [newLead] = await db
      .insert(externalLeads)
      .values(lead)
      .returning();
    return newLead;
  }

  async updateExternalLead(id: number, lead: Partial<InsertExternalLead>, userId: string): Promise<ExternalLead> {
    const [updated] = await db
      .update(externalLeads)
      .set({ ...lead, updatedAt: new Date() })
      .where(and(eq(externalLeads.id, id), eq(externalLeads.userId, userId)))
      .returning();
    return updated;
  }

  async deleteExternalLead(id: number, userId: string): Promise<void> {
    await db
      .delete(externalLeads)
      .where(and(eq(externalLeads.id, id), eq(externalLeads.userId, userId)));
  }

  // External Message operations
  async getExternalMessages(externalLeadId: number): Promise<ExternalMessage[]> {
    return await db
      .select()
      .from(externalMessages)
      .where(eq(externalMessages.externalLeadId, externalLeadId))
      .orderBy(desc(externalMessages.createdAt));
  }

  async createExternalMessage(message: InsertExternalMessage): Promise<ExternalMessage> {
    const [newMessage] = await db
      .insert(externalMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Learning Pattern operations
  async getLearningPatterns(externalLeadId: number): Promise<LearningPattern[]> {
    return await db
      .select()
      .from(learningPatterns)
      .where(eq(learningPatterns.externalLeadId, externalLeadId))
      .orderBy(desc(learningPatterns.successRate));
  }

  async createLearningPattern(pattern: InsertLearningPattern): Promise<LearningPattern> {
    const [newPattern] = await db
      .insert(learningPatterns)
      .values(pattern)
      .returning();
    return newPattern;
  }

  async updateLearningPattern(id: number, pattern: Partial<InsertLearningPattern>): Promise<LearningPattern> {
    const [updated] = await db
      .update(learningPatterns)
      .set(pattern)
      .where(eq(learningPatterns.id, id))
      .returning();
    return updated;
  }

  // Webhook Config operations
  async getWebhookConfigs(userId: string): Promise<WebhookConfig[]> {
    return await db.select().from(webhookConfigs).where(eq(webhookConfigs.userId, userId));
  }

  async createWebhookConfig(config: InsertWebhookConfig): Promise<WebhookConfig> {
    const [newConfig] = await db
      .insert(webhookConfigs)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateWebhookConfig(id: number, config: Partial<InsertWebhookConfig>, userId: string): Promise<WebhookConfig> {
    const [updated] = await db
      .update(webhookConfigs)
      .set(config)
      .where(and(eq(webhookConfigs.id, id), eq(webhookConfigs.userId, userId)))
      .returning();
    return updated;
  }

  // Lead Activity operations
  async getLeadActivity(externalLeadId: number): Promise<LeadActivity[]> {
    return await db
      .select()
      .from(leadActivity)
      .where(eq(leadActivity.externalLeadId, externalLeadId))
      .orderBy(desc(leadActivity.timestamp));
  }

  async createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const [newActivity] = await db
      .insert(leadActivity)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Conversion Attempt operations
  async getConversionAttempts(externalLeadId: number): Promise<ConversionAttempt[]> {
    return await db
      .select()
      .from(conversionAttempts)
      .where(eq(conversionAttempts.externalLeadId, externalLeadId))
      .orderBy(desc(conversionAttempts.timestamp));
  }

  async createConversionAttempt(attempt: InsertConversionAttempt): Promise<ConversionAttempt> {
    const [newAttempt] = await db
      .insert(conversionAttempts)
      .values(attempt)
      .returning();
    return newAttempt;
  }
}

export const storage = new DatabaseStorage();
