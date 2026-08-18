const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY'); if (!apiKey) throw new Error('OPENAI_API_KEY não configurada.');
    const { tcgId, imageBase64, maxCards = 10 } = await request.json();
    if (!imageBase64 || !['magic', 'pokemon', 'riftbound'].includes(tcgId)) return Response.json({ error: 'Imagem ou TCG inválido.' }, { status: 400, headers: cors });
    const prompt = `Identify the ${tcgId} trading cards visible in this overhead photo. There are at most ${Math.min(10, maxCards)} cards. Return JSON only as {"cards":[{"name":"exact printed card name","set":"set if visible","number":"collector number if visible","quantity":1,"confidence":0.0}]}. Do not invent cards; omit uncertain objects and never return more than 10.`;
    const ai = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: Deno.env.get('OPENAI_VISION_MODEL') ?? 'gpt-4.1-mini', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } }] }] }) });
    const result = await ai.json(); if (!ai.ok) throw new Error(result?.error?.message ?? 'Falha no serviço de visão.');
    const parsed = JSON.parse(result.choices?.[0]?.message?.content ?? '{"cards":[]}'); return Response.json({ cards: (parsed.cards ?? []).slice(0, 10) }, { headers: cors });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Falha inesperada.' }, { status: 500, headers: cors }); }
});
