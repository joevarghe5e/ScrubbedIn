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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { imageBase64, mediaType, weekStart } = await req.json()
    if (!imageBase64) return json({ error: 'Missing imageBase64' }, 400)

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) return json({ error: 'ANTHROPIC_API_KEY not set' }, 500)

    const prompt = `You are extracting a medical student/junior doctor's weekly timetable from this image.

Extract every session visible and return a JSON array, in chronological order. A single day can have multiple sessions — extract all of them, up to a maximum of 6 per day. Each session should have:
- day_of_week: number (1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday)
- start_time: the session's start time in 24-hour "HH:MM" format (e.g. "08:30", "14:00"). Read the actual time off the timetable if shown; if only a vague slot like "AM"/"PM" is given, estimate a sensible time (e.g. "09:00" for AM, "14:00" for PM).
- session_name: the name/title of the session (e.g. "Acute Medical Ward Round", "Emergency Theatre List", "GP Respiratory Clinic")
- session_type: one of "Ward Round", "Theatre", "Clinic", "Lecture", "Tutorial", "Other"
- specialty: the medical specialty (e.g. "General Medicine", "Surgery", "General Practice", "Emergency Medicine", "Cardiology")
- location: location if visible, otherwise null
- notes: any extra detail visible for this session that isn't captured above — e.g. supervising consultant's name, firm/team name, ward round lead, theatre list type, clinic sub-specialty. Keep it short (under 15 words). Use null if nothing extra is visible.

Return ONLY a valid JSON array, no explanation. Example:
[
  {"day_of_week": 1, "start_time": "08:00", "session_name": "Acute Medical Ward Round", "session_type": "Ward Round", "specialty": "General Medicine", "location": "Ward 4B", "notes": "Led by Dr Patel, Cardiology firm"},
  {"day_of_week": 1, "start_time": "13:30", "session_name": "GP Respiratory Clinic", "session_type": "Clinic", "specialty": "General Practice", "location": "Outpatients B", "notes": null},
  {"day_of_week": 2, "start_time": "09:00", "session_name": "Emergency Theatre List", "session_type": "Theatre", "specialty": "Surgery", "location": "Theatre 2", "notes": "Orthopaedic trauma list"}
]

If you cannot read the timetable clearly, return an empty array [].`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType ?? 'image/jpeg',
                data: imageBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return json({ error: 'AI parsing failed' }, 502)
    }

    const result = await response.json()
    const text = result.content?.[0]?.text ?? '[]'

    let sessions = []
    try {
      const match = text.match(/\[[\s\S]*\]/)
      sessions = JSON.parse(match ? match[0] : text)
    } catch {
      console.error('Failed to parse JSON:', text)
      sessions = []
    }

    return json({ sessions, weekStart }, 200)
  } catch (e) {
    console.error(e)
    return json({ error: 'Internal error' }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
