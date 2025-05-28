import express, { type Express } from "express";
import { EidosAgent } from "./eidosAgent";
import { getProfile, setProfile } from "./storage";

export function registerRoutes(app: Express) {
  const router = express.Router();

  router.post("/api/message", async (req, res) => {
    const { message, userId } = req.body;
    const response = await EidosAgent(message, userId);
    res.json({ response });
  });

  router.post("/api/persona", async (req, res) => {
    const { userId, persona } = req.body;
    const profile = await getProfile(userId);
    profile.persona_atual = persona;
    await setProfile(userId, profile);
    res.json({ success: true, persona });
  });

  router.get("/api/status", async (req, res) => {
    const { userId } = req.query;
    const profile = await getProfile(userId as string);
    res.json({
      persona: profile?.persona_atual || "Sedutora",
      ultima_interacao: profile?.ultima_interacao || null,
    });
  });

  router.get("/api/script", async (req, res) => {
    const { userId } = req.query;
    const script = `Use essa frase com ${userId}: "Tem algo que eu tava guardando… mas agora não sei se devo te contar."`;
    res.json({ script });
  });

  app.use(router); // ← Aqui registramos o router dentro do app
}
