import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertLeadSchema, 
  insertConversationSchema, 
  insertMessageSchema,
  insertFileSchema,
  insertIntegrationSchema 
} from "@shared/schema";
import { generateAIResponse, analyzeLeadData } from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await storage.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Leads routes
  app.get("/api/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leads = await storage.getLeads(userId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertLeadSchema.parse({ ...req.body, userId });
      
      // Generate AI lead score
      const score = await analyzeLeadData(validatedData);
      
      const lead = await storage.createLead({ ...validatedData, score });
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(400).json({ message: "Failed to create lead" });
    }
  });

  app.get("/api/leads/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId, userId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.patch("/api/leads/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadId = parseInt(req.params.id);
      const validatedData = insertLeadSchema.partial().parse(req.body);
      
      const lead = await storage.updateLead(leadId, validatedData, userId);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(400).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadId = parseInt(req.params.id);
      
      await storage.deleteLead(leadId, userId);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Conversations routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse({ ...req.body, userId });
      
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Failed to create conversation" });
    }
  });

  // Messages routes
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = parseInt(req.params.id);
      
      // Verify user owns the conversation
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = parseInt(req.params.id);
      
      // Verify user owns the conversation
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const validatedData = insertMessageSchema.parse({ 
        ...req.body, 
        conversationId 
      });
      
      // Save user message
      const userMessage = await storage.createMessage(validatedData);
      
      // Generate AI response if user message
      if (validatedData.role === "user") {
        const messages = await storage.getMessages(conversationId);
        const aiResponse = await generateAIResponse(messages, userId);
        
        const assistantMessage = await storage.createMessage({
          conversationId,
          role: "assistant",
          content: aiResponse,
        });
        
        res.json({ userMessage, assistantMessage });
      } else {
        res.json({ userMessage });
      }
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Failed to create message" });
    }
  });

  // Files routes
  app.get("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/files/upload", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileData = insertFileSchema.parse({
        userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        status: "processing"
      });
      
      const file = await storage.createFile(fileData);
      
      // TODO: Process file in background
      // For now, mark as processed
      setTimeout(async () => {
        try {
          await storage.updateFile(file.id, { 
            status: "processed",
            processedAt: new Date()
          }, userId);
        } catch (error) {
          console.error("Error updating file status:", error);
        }
      }, 2000);
      
      res.json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(400).json({ message: "Failed to upload file" });
    }
  });

  // Integrations routes
  app.get("/api/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const integrations = await storage.getIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertIntegrationSchema.parse({ ...req.body, userId });
      
      const integration = await storage.createIntegration(validatedData);
      res.json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(400).json({ message: "Failed to create integration" });
    }
  });

  app.patch("/api/integrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const integrationId = parseInt(req.params.id);
      const validatedData = insertIntegrationSchema.partial().parse(req.body);
      
      const integration = await storage.updateIntegration(integrationId, validatedData, userId);
      res.json(integration);
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(400).json({ message: "Failed to update integration" });
    }
  });

  app.delete("/api/integrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const integrationId = parseInt(req.params.id);
      
      await storage.deleteIntegration(integrationId, userId);
      res.json({ message: "Integration deleted successfully" });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
