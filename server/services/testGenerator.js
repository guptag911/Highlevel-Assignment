const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: ''
});

/**
 * Generates test cases based on prompt analysis
 */
async function generate(prompt, analysis) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key-for-development') {
    // Mock test cases for development
    return {
      testCases: [
        {
          id: 'test-1',
          name: 'Happy Path - Cooperative User',
          userInput: 'Hello, I\'d like to schedule an appointment',
          expectedBehavior: [
            'Agent greets politely',
            'Agent asks for contact information',
            'Agent confirms appointment details',
            'Agent provides next steps'
          ],
          successCriteria: [
            'Must ask for email address',
            'Must remain polite',
            'Must confirm appointment'
          ],
          scenario: 'Ideal customer interaction'
        },
        {
          id: 'test-2',
          name: 'Interruption Handling',
          userInput: 'Wait, can you tell me more about your services first?',
          expectedBehavior: [
            'Agent handles interruption gracefully',
            'Agent provides requested information',
            'Agent returns to original flow',
            'Agent remains polite'
          ],
          successCriteria: [
            'Must remain polite even when interrupted',
            'Must handle interruption without frustration',
            'Must return to main flow'
          ],
          scenario: 'User interrupts agent mid-script'
        },
        {
          id: 'test-3',
          name: 'Objection Handling',
          userInput: 'I\'m not sure, I need to think about it',
          expectedBehavior: [
            'Agent acknowledges concern',
            'Agent provides reassurance or additional value',
            'Agent attempts to overcome objection',
            'Agent maintains professional tone'
          ],
          successCriteria: [
            'Must handle objections gracefully',
            'Must not be pushy',
            'Must provide value'
          ],
          scenario: 'User expresses hesitation'
        },
        {
          id: 'test-4',
          name: 'Information Request',
          userInput: 'What are your business hours?',
          expectedBehavior: [
            'Agent provides accurate information',
            'Agent continues conversation flow',
            'Agent attempts to move toward goal'
          ],
          successCriteria: [
            'Must provide accurate information',
            'Must maintain conversation flow'
          ],
          scenario: 'User asks for specific information'
        },
        {
          id: 'test-5',
          name: 'Rude/Impatient User',
          userInput: 'Hurry up, I don\'t have all day!',
          expectedBehavior: [
            'Agent remains calm and professional',
            'Agent acknowledges user\'s urgency',
            'Agent speeds up process appropriately',
            'Agent maintains politeness'
          ],
          successCriteria: [
            'Must remain polite even when user is rude',
            'Must adapt to user\'s pace',
            'Must maintain professionalism'
          ],
          scenario: 'User is impatient or rude'
        }
      ]
    };
  }

  const systemPrompt = `You are an expert at generating test cases for Voice AI agents. Based on the prompt analysis, generate comprehensive test cases that cover:
1. Happy path scenarios
2. Edge cases and interruptions
3. Objection handling
4. Error scenarios
5. Boundary conditions

Each test case should include:
- name: Short test name
- scenario: Description of the test scenario
- userInput: Realistic user input
- expectedAgentBehavior: What the agent should do
- successCriteria: Array of strings - specific criteria to evaluate (e.g. ["Agent confirms completion", "Agent reports any issues"])
- description: Optional scenario description

IMPORTANT: successCriteria MUST be an array of strings, not a single string. Example: ["Criterion 1", "Criterion 2"]

Generate 5-8 diverse test cases. Return valid JSON with a "testCases" array.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate test cases for this Voice AI agent prompt:\n\nPrompt: ${prompt}\n\nAnalysis: ${JSON.stringify(analysis, null, 2)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content);
    const testCases = (result.testCases || []).map(c => ({
      ...c,
      successCriteria: Array.isArray(c.successCriteria) ? c.successCriteria : (c.successCriteria ? [c.successCriteria] : [])
    }));
    return { testCases };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate test cases with AI');
  }
}

module.exports = { generate };
