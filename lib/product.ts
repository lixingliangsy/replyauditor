export interface InputField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "ReplyAuditor",
  slug: "replyauditor",
  tagline: "A quality gate for AI-drafted customer support replies.",
  description: "Paste an AI-drafted support reply; get a quality gate that checks hallucination, PII leaks, brand tone, and policy compliance, with a ship/hold verdict. For support team leads deploying AI to draft responses.",
  toolTitle: "Audit this reply",
  resultLabel: "Quality report",
  ctaLabel: "Audit",
  features: [
  "Hallucination guard",
  "PII leak check",
  "Brand/tone rules",
  "QA dashboard (Team)"
],
  inputs: [
  {
    "key": "reply",
    "label": "AI-drafted reply to audit",
    "type": "textarea",
    "placeholder": "Hi Sarah, your refund of $49.99 is processed. Your order #88213 ships Tuesday."
  },
  {
    "key": "rules",
    "label": "Brand / tone / policy rules (one per line, optional)",
    "type": "textarea",
    "placeholder": "Always greet by name\\nNo guarantees on delivery dates\\nNever ask for password"
  },
  {
    "key": "channel",
    "label": "Channel",
    "type": "select",
    "options": [
      "Email",
      "Live Chat",
      "Social",
      "Ticket"
    ]
  }
] as InputField[],
  systemPrompt: "You are a support-quality auditor. Given an AI-drafted reply, brand/tone/policy rules, and a channel, check for hallucination, PII leaks, tone violations, and policy breaches; return a ship/hold verdict.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "50 replies/mo"
  },
  {
    "tier": "Pro",
    "price": "$39/mo",
    "desc": "Unlimited + tone rules"
  },
  {
    "tier": "Team",
    "price": "$99/mo",
    "desc": "QA dashboard + SLA"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const reply = (inputs['reply'] || '').trim()
  const rules = (inputs['rules'] || '').split(/\n/).map(s => s.trim()).filter(Boolean)
  const ch = inputs['channel'] || 'Email'
  if (!reply) return 'Paste the AI reply to audit.'
  const checks = [
    ['No PII leak (no password/SSN/card)', !/(password|ssn|credit card|card number|cvv)/i.test(reply)],
    ['No unverifiable guarantee', !/(guarantee|100%|always|never fail)/i.test(reply)],
    ['No hallucinated facts/numbers', !/(order #?[0-9]{6,}|tracking [a-z0-9]{8,})/i.test(reply) || /your order/i.test(reply)],
    ['Greets by name', /hi |hello |dear /i.test(reply)],
    ['Sign-off present', /regards|thanks|cheers|team/i.test(reply)]
  ]
  let score = 0
  let out = 'SUPPORT REPLY AUDIT - ' + ch + '\n\n'
  checks.forEach(c => { out += (c[1] ? '[PASS] ' : '[FAIL] ') + c[0] + '\n'; if (c[1]) score++ })
  let verdict = score < checks.length - 1 ? 'HOLD: fix failing checks before send.' : 'SHIP: passes the gate.'
  out += '\nScore: ' + score + '/' + checks.length + '\n' + verdict + '\n'
  if (rules.length) out += '\nYour policy rules: ' + rules.length + ' checked (mock matches by keyword).\n'
  out += '\n--- (Mock gate. Pro adds tone-model scoring + SLA dashboards.)'
  return out
}
}
