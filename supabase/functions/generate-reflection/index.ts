import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { log, framework = 'STARR' } = await req.json()
    if (!log) return json({ error: 'Missing log' }, 400)

    const prompt = buildPrompt(log, framework)

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return json({ error: 'ANTHROPIC_API_KEY not set' }, 500)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return json({ error: 'AI generation failed' }, 502)
    }

    const result = await response.json()
    const reflection = result.content?.[0]?.text ?? ''

    return json({ reflection }, 200)
  } catch (e) {
    console.error(e)
    return json({ error: 'Internal error' }, 500)
  }
})

function buildPrompt(log: Record<string, unknown>, framework: string): string {
  const observed = Array.isArray(log.procedures_observed) ? (log.procedures_observed as string[]).join(', ') : ''
  const performed = Array.isArray(log.procedures_performed) ? (log.procedures_performed as string[]).join(', ') : ''

  if (framework === 'STARR') {
    return `You are helping a UK medical trainee write a structured portfolio reflection using the STARR framework (Situation, Task, Action, Result, Reflection).

Based on the following clinical encounter, write a concise, professional STARR reflection suitable for a UK medical portfolio. Use first-person voice. Be specific and educational. Each section should be 2–4 sentences.

ENCOUNTER DETAILS:
- Date: ${log.encounter_date ?? 'Not specified'}
- Specialty: ${log.specialty ?? 'Not specified'}
- Presentation: ${log.presentation ?? 'Not specified'}
- Procedures observed: ${observed || 'None documented'}
- Procedures performed: ${performed || 'None documented'}
- Learning points: ${log.learning_points ?? 'Not specified'}

Write the reflection in this exact format:

**Situation**
[2-4 sentences describing the clinical situation]

**Task**
[2-4 sentences describing your role and what was expected of you]

**Action**
[2-4 sentences describing what you did and how you approached it]

**Result**
[2-4 sentences describing the outcome for the patient and for your learning]

**Reflection**
[2-4 sentences reflecting on what this means for your future practice and development]`
  }

  // Gibbs
  return `You are helping a UK medical trainee write a structured portfolio reflection using Gibbs' Reflective Cycle (Description, Feelings, Evaluation, Analysis, Conclusion, Action Plan).

Based on the following clinical encounter, write a concise, professional Gibbs reflection suitable for a UK medical portfolio. Use first-person voice. Each section should be 2–4 sentences.

ENCOUNTER DETAILS:
- Date: ${log.encounter_date ?? 'Not specified'}
- Specialty: ${log.specialty ?? 'Not specified'}
- Presentation: ${log.presentation ?? 'Not specified'}
- Procedures observed: ${observed || 'None documented'}
- Procedures performed: ${performed || 'None documented'}
- Learning points: ${log.learning_points ?? 'Not specified'}

Write the reflection in this exact format:

**Description**
[What happened — factual account]

**Feelings**
[What were you thinking and feeling?]

**Evaluation**
[What was good and bad about the experience?]

**Analysis**
[What sense can you make of the situation?]

**Conclusion**
[What else could you have done?]

**Action Plan**
[If it arose again, what would you do? What will you learn or practise?]`
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
