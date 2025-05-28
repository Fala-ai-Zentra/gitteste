
import { useState } from "react";

const personas = ["Sedutora", "Curiosa", "Dominadora", "Profissional", "Mutante"];

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [persona, setPersona] = useState("Sedutora");

  const sendMessage = async () => {
    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId: "admin" }),
    });
    const data = await res.json();
    setResponse(data.response);
  };

  const switchPersona = async (p: string) => {
    setPersona(p);
    await fetch("/api/persona", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "admin", persona: p }),
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-pink-500">Eidos Connect IA</h1>

      <div className="flex gap-3 mb-4">
        {personas.map((p) => (
          <button
            key={p}
            onClick={() => switchPersona(p)}
            className={`px-4 py-2 rounded ${persona === p ? "bg-pink-500" : "bg-gray-700"}`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded shadow mb-4">
        <p className="text-green-400">Modo atual: {persona}</p>
        <p className="mt-2 text-sm text-gray-300">Resposta da IA:</p>
        <p className="italic mt-1">{response}</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
        />
        <button onClick={sendMessage} className="bg-pink-600 px-4 py-2 rounded text-white">
          Enviar
        </button>
      </div>
    </div>
  );
}

export default App;
