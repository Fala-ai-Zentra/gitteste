
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { getProfile, setProfile } from "./storage";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const personas: Record<string, string> = {
  Sedutora: "Você é sedutora, provocante, fala com charme e insinuações.",
  Curiosa: "Você é curiosa, pergunta tudo com leveza e interesse verdadeiro.",
  Dominadora: "Você é intensa, comanda a conversa, fala com firmeza e desejo.",
  Profissional: "Você é respeitosa, elegante e mantém uma conversa inteligente.",
  Mutante: "Você adapta seu estilo ao humor e linguagem do lead, imitando ele.",
};

export async function EidosAgent(message: string, userId: string) {
  const profile = await getProfile(userId);
  const persona = profile?.persona_atual || "Sedutora";

  const promptBase = personas[persona] || personas["Sedutora"];

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: `${promptBase} Sempre mantenha o estilo da personagem.`,
    },
    {
      role: "user",
      content: message,
    },
  ];

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages,
    temperature: 0.85,
  });

  return completion.data.choices[0].message?.content || "Desculpe, não entendi.";
}
