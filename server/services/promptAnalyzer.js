const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: ''
});

/**
 * Normalizes AI response to expected format (handles alternative field names)
 */
function normalizeAnalysis(raw) {
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'object' && val !== null) {
      const obj = val;
      if (obj.SuccessfulInteraction) return [obj.SuccessfulInteraction];
      return Object.values(obj).filter(Boolean);
    }
    return val ? [String(val)] : [];
  };

  return {
    intent: raw.intent ?? raw.PrimaryIntent ?? '',
    keyActions: raw.keyActions ?? raw.KeyActions ?? [],
    successCriteria: Array.isArray(raw.successCriteria)
      ? raw.successCriteria
      : toArray(raw.ImplicitSuccessCriteria),
    tone: raw.tone ?? raw.ToneAndStyleRequirements ?? '',
    flow: raw.flow ?? (Array.isArray(raw.ConversationFlowStructure) ? raw.ConversationFlowStructure.join('; ') : raw.ConversationFlowStructure) ?? '',
    estimatedComplexity: raw.estimatedComplexity ?? raw.ComplexityLevel ?? ''
  };
}

/**
 * Analyzes a Voice AI agent prompt to extract key components and requirements
 */
async function analyze(prompt) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key-for-development') {
    // Mock response for development
    return {
      intent: 'Lead qualification and appointment booking',
      keyActions: [
        'Greet the caller',
        'Ask for contact information',
        'Schedule an appointment',
        'Handle objections'
      ],
      successCriteria: [
        'Must ask for email address',
        'Must remain polite even when interrupted',
        'Must confirm appointment details',
        'Must handle common objections gracefully'
      ],
      tone: 'Professional and friendly',
      flow: 'Linear with branching logic for objections',
      estimatedComplexity: 'Medium'
    };
  }

  const systemPrompt = `You are an expert at analyzing Voice AI agent prompts. Analyze the given prompt and extract the following. You MUST return a valid JSON object with EXACTLY these field names (use camelCase):

{
  "intent": "Primary intent/purpose of the agent (string)",
  "keyActions": ["array of key actions the agent should perform"],
  "successCriteria": ["array of implicit success criteria - what makes a successful interaction"],
  "tone": "Tone and style requirements (string, e.g. 'Professional and friendly')",
  "flow": "Conversation flow structure (string)",
  "estimatedComplexity": "Complexity level (string: 'Low', 'Medium', or 'High')"
}

Return only valid JSON with these exact field names. No additional text.`;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this Voice AI agent prompt:\n\n${prompt}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const rawAnalysis = JSON.parse(response.choices[0].message.content);
    return normalizeAnalysis(rawAnalysis);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze prompt with AI');
  }
}

module.exports = { analyze };
