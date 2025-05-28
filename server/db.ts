import dotenv from 'dotenv';
dotenv.config(); // ← ISSO TEM QUE VIR ANTES DE USAR qualquer process.env

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configura o WebSocket para o Neon Serverless
neonConfig.webSocketConstructor = ws;

// Verifica se a variável DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Cria o pool de conexão e instancia o drizzle
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
