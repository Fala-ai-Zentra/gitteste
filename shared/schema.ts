import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  company: varchar("company"),
  status: varchar("status").default("new"), // new, contacted, qualified, converted, lost
  source: varchar("source"), // website, social, referral, etc
  notes: text("notes"),
  score: real("score").default(0), // AI-generated lead score
  lastContact: timestamp("last_contact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  leadId: integer("lead_id").references(() => leads.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  role: varchar("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // for storing additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Uploaded files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  status: varchar("status").default("processing"), // processing, processed, failed
  extractedText: text("extracted_text"),
  summary: text("summary"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Integrations configuration
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // openai, email_marketing, analytics, etc
  name: varchar("name").notNull(),
  config: jsonb("config").notNull(), // encrypted configuration data
  status: varchar("status").default("disconnected"), // connected, disconnected, error
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Metrics and analytics
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // leads_count, ai_interactions, files_processed, revenue
  value: real("value").notNull(),
  date: timestamp("date").defaultNow(),
  metadata: jsonb("metadata"),
});

// AI Agent personalities and training data
export const agentPersonalities = pgTable("agent_personalities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  mode: varchar("mode").notNull(), // seductive, professional, provocative, dominant, curious
  prompt: text("prompt").notNull(),
  voiceSettings: jsonb("voice_settings"), // voice type, tone, effects
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// External leads from webhooks (ManyChat, WhatsApp, etc)
export const externalLeads = pgTable("external_leads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  externalId: varchar("external_id").notNull(), // ID from external platform
  platform: varchar("platform").notNull(), // manychat, whatsapp, telegram
  name: varchar("name"),
  phone: varchar("phone"),
  email: varchar("email"),
  profileData: jsonb("profile_data"), // additional data from platform
  emotionalProfile: jsonb("emotional_profile"), // learned emotional patterns
  preferences: jsonb("preferences"), // learned preferences and triggers
  lastInteraction: timestamp("last_interaction"),
  status: varchar("status").default("active"), // active, paused, converted, blocked
  conversionScore: real("conversion_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI conversation history with external platforms
export const externalMessages = pgTable("external_messages", {
  id: serial("id").primaryKey(),
  externalLeadId: integer("external_lead_id").notNull().references(() => externalLeads.id),
  agentPersonalityId: integer("agent_personality_id").references(() => agentPersonalities.id),
  direction: varchar("direction").notNull(), // incoming, outgoing
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, audio, image, video
  audioUrl: varchar("audio_url"), // generated audio link
  emotionalTone: varchar("emotional_tone"), // detected/applied emotion
  strategy: varchar("strategy"), // applied strategy for this message
  delay: integer("delay"), // simulated typing delay in seconds
  engagement: jsonb("engagement"), // response time, clicks, reactions
  createdAt: timestamp("created_at").defaultNow(),
});

// Emotional and behavioral learning patterns
export const learningPatterns = pgTable("learning_patterns", {
  id: serial("id").primaryKey(),
  externalLeadId: integer("external_lead_id").notNull().references(() => externalLeads.id),
  pattern: varchar("pattern").notNull(), // successful_response, trigger_word, time_preference
  context: text("context").notNull(),
  successRate: real("success_rate").default(0),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhook configurations for external platforms
export const webhookConfigs = pgTable("webhook_configs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(),
  webhookUrl: varchar("webhook_url").notNull(),
  apiKey: varchar("api_key"),
  config: jsonb("config"), // platform-specific settings
  status: varchar("status").default("active"),
  lastReceived: timestamp("last_received"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time lead activity tracking
export const leadActivity = pgTable("lead_activity", {
  id: serial("id").primaryKey(),
  externalLeadId: integer("external_lead_id").notNull().references(() => externalLeads.id),
  activity: varchar("activity").notNull(), // message_read, link_clicked, disappeared, sent_gift
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Conversion attempts and results
export const conversionAttempts = pgTable("conversion_attempts", {
  id: serial("id").primaryKey(),
  externalLeadId: integer("external_lead_id").notNull().references(() => externalLeads.id),
  strategy: varchar("strategy").notNull(), // emotional_peak, urgency, exclusivity
  content: text("content").notNull(),
  result: varchar("result"), // success, ignored, blocked, partial
  value: real("value"), // monetary or engagement value
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  conversations: many(conversations),
  files: many(files),
  integrations: many(integrations),
  metrics: many(metrics),
  agentPersonalities: many(agentPersonalities),
  externalLeads: many(externalLeads),
  webhookConfigs: many(webhookConfigs),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [conversations.leadId],
    references: [leads.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(users, {
    fields: [integrations.userId],
    references: [users.id],
  }),
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  user: one(users, {
    fields: [metrics.userId],
    references: [users.id],
  }),
}));

export const agentPersonalitiesRelations = relations(agentPersonalities, ({ one, many }) => ({
  user: one(users, {
    fields: [agentPersonalities.userId],
    references: [users.id],
  }),
  externalMessages: many(externalMessages),
}));

export const externalLeadsRelations = relations(externalLeads, ({ one, many }) => ({
  user: one(users, {
    fields: [externalLeads.userId],
    references: [users.id],
  }),
  externalMessages: many(externalMessages),
  learningPatterns: many(learningPatterns),
  leadActivity: many(leadActivity),
  conversionAttempts: many(conversionAttempts),
}));

export const externalMessagesRelations = relations(externalMessages, ({ one }) => ({
  externalLead: one(externalLeads, {
    fields: [externalMessages.externalLeadId],
    references: [externalLeads.id],
  }),
  agentPersonality: one(agentPersonalities, {
    fields: [externalMessages.agentPersonalityId],
    references: [agentPersonalities.id],
  }),
}));

export const learningPatternsRelations = relations(learningPatterns, ({ one }) => ({
  externalLead: one(externalLeads, {
    fields: [learningPatterns.externalLeadId],
    references: [externalLeads.id],
  }),
}));

export const webhookConfigsRelations = relations(webhookConfigs, ({ one }) => ({
  user: one(users, {
    fields: [webhookConfigs.userId],
    references: [users.id],
  }),
}));

export const leadActivityRelations = relations(leadActivity, ({ one }) => ({
  externalLead: one(externalLeads, {
    fields: [leadActivity.externalLeadId],
    references: [externalLeads.id],
  }),
}));

export const conversionAttemptsRelations = relations(conversionAttempts, ({ one }) => ({
  externalLead: one(externalLeads, {
    fields: [conversionAttempts.externalLeadId],
    references: [externalLeads.id],
  }),
}));

// Zod schemas
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMetricSchema = createInsertSchema(metrics).omit({
  id: true,
  date: true,
});

export const insertAgentPersonalitySchema = createInsertSchema(agentPersonalities).omit({
  id: true,
  createdAt: true,
});

export const insertExternalLeadSchema = createInsertSchema(externalLeads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExternalMessageSchema = createInsertSchema(externalMessages).omit({
  id: true,
  createdAt: true,
});

export const insertLearningPatternSchema = createInsertSchema(learningPatterns).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookConfigSchema = createInsertSchema(webhookConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertLeadActivitySchema = createInsertSchema(leadActivity).omit({
  id: true,
  timestamp: true,
});

export const insertConversionAttemptSchema = createInsertSchema(conversionAttempts).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;

export type InsertAgentPersonality = z.infer<typeof insertAgentPersonalitySchema>;
export type AgentPersonality = typeof agentPersonalities.$inferSelect;

export type InsertExternalLead = z.infer<typeof insertExternalLeadSchema>;
export type ExternalLead = typeof externalLeads.$inferSelect;

export type InsertExternalMessage = z.infer<typeof insertExternalMessageSchema>;
export type ExternalMessage = typeof externalMessages.$inferSelect;

export type InsertLearningPattern = z.infer<typeof insertLearningPatternSchema>;
export type LearningPattern = typeof learningPatterns.$inferSelect;

export type InsertWebhookConfig = z.infer<typeof insertWebhookConfigSchema>;
export type WebhookConfig = typeof webhookConfigs.$inferSelect;

export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadActivity = typeof leadActivity.$inferSelect;

export type InsertConversionAttempt = z.infer<typeof insertConversionAttemptSchema>;
export type ConversionAttempt = typeof conversionAttempts.$inferSelect;
