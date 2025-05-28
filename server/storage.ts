import {
  users,
  leads,
  conversations,
  messages,
  files,
  integrations,
  metrics,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
