// Groq keys — round-robin for higher RPM
const GROQ_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
].filter(Boolean) as string[];

let groqKeyIndex = 0;
function getNextGroqKey(): string {
  if (GROQ_KEYS.length === 0) throw new Error("No Groq API key");
  const key = GROQ_KEYS[groqKeyIndex % GROQ_KEYS.length];
  groqKeyIndex = (groqKeyIndex + 1) % GROQ_KEYS.length;
  return key;
}

const NVIDIA_KEYS = [
  process.env.NVIDIA_API_KEY_1,
  process.env.NVIDIA_API_KEY_2,
  process.env.NVIDIA_API_KEY_3,
  process.env.NVIDIA_API_KEY_4,
].filter(Boolean) as string[];

let nvidiaKeyIndex = 0;
function getNextNvidiaKey(): string {
  const key = NVIDIA_KEYS[nvidiaKeyIndex % NVIDIA_KEYS.length];
  nvidiaKeyIndex = (nvidiaKeyIndex + 1) % NVIDIA_KEYS.length;
  return key;
}

const PROVIDER_TIMEOUT_MS = 15000;

interface ModelProvider {
  name: string;
  call: (messages: { role: string; content: string }[]) => Promise<{ reply: string; tokensUsed: number }>;
}

async function callGroq(messages: { role: string; content: string }[]): Promise<{ reply: string; tokensUsed: number }> {
  const key = getNextGroqKey();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, temperature: 0.7, max_tokens: 4096 }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Groq: ${res.status}`);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty Groq response");
    return { reply, tokensUsed: data.usage?.total_tokens || 0 };
  } finally {
    clearTimeout(timeout);
  }
}

async function callNvidiaSuper(messages: { role: string; content: string }[]): Promise<{ reply: string; tokensUsed: number }> {
  const key = getNextNvidiaKey();
  if (!key) throw new Error("No NVIDIA key");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "nvidia/llama-3.3-nemotron-super-49b-v1.5", messages, temperature: 0.7, max_tokens: 4096 }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`NVIDIA Super: ${res.status}`);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty NVIDIA response");
    return { reply, tokensUsed: data.usage?.total_tokens || 0 };
  } finally {
    clearTimeout(timeout);
  }
}

async function callNvidiaNano(messages: { role: string; content: string }[]): Promise<{ reply: string; tokensUsed: number }> {
  const key = getNextNvidiaKey();
  if (!key) throw new Error("No NVIDIA key");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "nvidia/nemotron-mini-4b-instruct", messages, temperature: 0.7, max_tokens: 4096 }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`NVIDIA Nano: ${res.status}`);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty NVIDIA response");
    return { reply, tokensUsed: data.usage?.total_tokens || 0 };
  } finally {
    clearTimeout(timeout);
  }
}

// Fallback chain: Groq (primary) → NVIDIA Super → NVIDIA Nano
// Add GROQ_API_KEY_2 to .env for higher Groq RPM.
export async function callAI(messages: { role: string; content: string }[]): Promise<{ reply: string; tokensUsed: number; model: string }> {
  const providers: { name: string; fn: ModelProvider["call"] }[] = [];

  if (GROQ_KEYS.length > 0) providers.push({ name: "llama-3.3-70b", fn: callGroq });
  if (NVIDIA_KEYS.length > 0) providers.push({ name: "nemotron-super-49b", fn: callNvidiaSuper });
  if (NVIDIA_KEYS.length > 0) providers.push({ name: "nemotron-mini-4b", fn: callNvidiaNano });

  if (providers.length === 0) throw new Error("No AI providers configured");

  let lastError: Error | null = null;
  for (const provider of providers) {
    try {
      const result = await provider.fn(messages);
      return { ...result, model: provider.name };
    } catch (err) {
      lastError = err as Error;
      console.error(`Provider ${provider.name} failed:`, (err as Error).message);
    }
  }

  throw lastError || new Error("All AI providers failed");
}
