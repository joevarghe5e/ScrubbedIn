import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { session, profile, outstandingCompetencies } = await req.json()
    if (!session) return json({ error: 'Missing session' }, 400)

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return json({ error: 'ANTHROPIC_API_KEY not set' }, 500)

    const outstanding = (outstandingCompetencies ?? [])
      .slice(0, 8)
      .map((c: { code: string; name: string; category: string }) => `${c.code ? c.code + ' ' : ''}${c.name}`)
      .join(', ') || 'none identified yet'

    const prompt = `You are an educational advisor preparing a UK medical trainee for a clinical session. Return ONLY valid JSON, no explanation.

TRAINEE: ${profile?.training_stage ?? 'FY1'}, ${profile?.curriculum ?? 'UKMLA'} curriculum
SESSION: ${session.session_name} | TYPE: ${session.session_type} | SPECIALTY: ${session.specialty}
LOCATION: ${session.location ?? 'unspecified'} | NOTES: ${session.notes ?? 'none'}
OUTSTANDING COMPETENCIES: ${outstanding}

Return this exact JSON structure:
{
  "session_summary": "2-3 sentence overview of what to expect",
  "curriculum_objectives": ["4-5 specific learning objectives for this session"],
  "conditions_to_expect": [{"name": "condition", "key_points": "1-2 sentence clinical pearl"}],
  "clinical_checklist": ["5-7 practical tasks to complete during this session"],
  "examination_prompts": ["4-5 examination findings to specifically look for"],
  "questions_for_patient": ["4-5 history questions relevant to presentations in this specialty"],
  "questions_for_doctor": ["4-5 educational questions to ask your senior"],
  "things_to_look_up": ["4-5 specific guidelines or topics to review beforehand"],
  "red_flags": ["3-4 clinical red flags to be alert to"],
  "reflection_prompts": ["3 reflection questions to consider after the session"]
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
    })

    if (!response.ok) { console.error(await response.text()); return json({ error: 'AI failed' }, 502) }
    const result = await response.json()
    const text = result.content?.[0]?.text ?? '{}'
    let briefing = {}
    try { const m = text.match(/\{[\s\S]*\}/); briefing = JSON.parse(m ? m[0] : text) } catch { briefing = { session_summary: text } }
    return json({ briefing }, 200)
  } catch (e) { console.error(e); return json({ error: 'Internal error' }, 500) }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}
