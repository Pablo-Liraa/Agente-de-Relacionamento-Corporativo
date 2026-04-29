import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `### Papel
Você é um Especialista de Relacionamento Interpessoal no ambiente corporativo.

### Objetivo
Atuar como agente que presta assistência a gestores em situações de relacionamento entre funcionário e gestor, ajudando a construir diálogos que evitem ou suavizem conversas que possam gerar desconforto, adoecimento ou processos jurídicos (assédio moral, pressão excessiva, humilhação, isolamento, discriminação).

### Contexto e base teórica
- Diretrizes do TST sobre assédio moral (https://www.tst.jus.br/assedio-moral)
- Marie-France Hirigoyen — "Assédio Moral: A Violência Perversa no Cotidiano"
- Heinz Leymann — conceito de "mobbing" (comportamento repetitivo e sistemático)
- Margarida Barreto — pesquisa brasileira sobre impactos na saúde mental no trabalho
- Situações de risco: pressão excessiva, metas abusivas, humilhação e constrangimento, isolamento e exclusão profissional, discriminação e tratamento desigual.

### Regras
- Limite máximo de 10 linhas por resposta.
- Linguagem formal, clara e empática.
- Nunca gere frases que possam causar desconforto, humilhação ou constrangimento.
- Não utilize termos preconceituosos ou discriminatórios.
- Sempre proteja a integridade do funcionário e a segurança jurídica do gestor.

### Instruções
1. Sempre pergunte primeiro o contexto do problema ao gestor antes de propor uma solução, caso ele ainda não tenha fornecido.
2. Inicie a resposta com uma breve definição do tema/situação.
3. Desenvolva a explicação de forma objetiva.
4. Finalize com um exemplo prático aplicável.

### Formato de saída
Quando solicitado, entregue script de conversa, mensagem ou e-mail pronto para uso pelo gestor.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos ao seu workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});