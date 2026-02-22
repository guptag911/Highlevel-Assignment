const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: ''
});

/**
 * Executes test cases against a Voice AI agent prompt
 * In production, this would call the actual HighLevel Voice AI API
 * For now, we simulate the agent's response using LLM
 */
async function execute(prompt, testCases) {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      // Normalize test case structure to handle different formats from AI
      const normalizedTestCase = {
        id: testCase.id || `test-${i + 1}`,
        name: testCase.name || testCase.scenarioDescription || `Test Case ${i + 1}`,
        userInput: testCase.userInput,
        // Handle successCriteria in different formats: array, object with mustAchieve/niceToHave, or flat array
        successCriteria: normalizeSuccessCriteria(testCase.successCriteria),
        scenarioDescription: testCase.scenarioDescription || testCase.scenario || testCase.name
      };
      
      // In production, this would be:
      // const agentResponse = await highLevelVoiceAIAPI.call(prompt, normalizedTestCase.userInput);
      
      // For now, simulate agent response using LLM
      const agentResponse = await simulateAgentResponse(prompt, normalizedTestCase.userInput);
      
      // Evaluate the response against success criteria
      const evaluation = await evaluateResponse(
        prompt,
        normalizedTestCase,
        agentResponse
      );

      results.push({
        testCaseId: normalizedTestCase.id,
        testCaseName: normalizedTestCase.name,
        userInput: normalizedTestCase.userInput,
        agentResponse: agentResponse,
        passed: evaluation.passed,
        score: evaluation.score,
        criteriaResults: evaluation.criteriaResults,
        issues: evaluation.issues,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        testCaseId: testCase.id || `test-${i + 1}`,
        testCaseName: testCase.name || testCase.scenarioDescription || `Test Case ${i + 1}`,
        userInput: testCase.userInput,
        agentResponse: null,
        passed: false,
        score: 0,
        criteriaResults: [],
        issues: [`Test execution failed: ${error.message}`],
        timestamp: new Date().toISOString()
      });
    }
  }

  return { results };
}

/**
 * Normalizes success criteria from different formats to a flat array
 */
function normalizeSuccessCriteria(successCriteria) {
  if (!successCriteria) {
    return [];
  }
  
  // If it's already an array, return it
  if (Array.isArray(successCriteria)) {
    return successCriteria;
  }
  
  // If it's an object with mustAchieve and niceToHave
  if (typeof successCriteria === 'object') {
    const criteria = [];
    if (successCriteria.mustAchieve && Array.isArray(successCriteria.mustAchieve)) {
      criteria.push(...successCriteria.mustAchieve);
    }
    if (successCriteria.niceToHave && Array.isArray(successCriteria.niceToHave)) {
      criteria.push(...successCriteria.niceToHave);
    }
    return criteria;
  }
  
  return [];
}

/**
 * Simulates agent response using LLM (mocked Voice AI API)
 */
async function simulateAgentResponse(prompt, userInput) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key-for-development') {
    // Mock responses based on user input
    if (userInput.includes('schedule') || userInput.includes('appointment')) {
      return "Hello! I'd be happy to help you schedule an appointment. Could I please get your email address to send you a confirmation?";
    }
    if (userInput.includes('think')) {
      return "I completely understand. Let me share some additional information that might help. Our services have helped many clients achieve great results. Would you like to hear more?";
    }
    if (userInput.includes('hours')) {
      return "We're open Monday through Friday, 9 AM to 5 PM. Would you like to schedule something during those hours?";
    }
    if (userInput.includes('Hurry') || userInput.includes('don\'t have')) {
      return "Absolutely, I'll make this quick. Let me get your information right away. What's your email address?";
    }
    return "Thank you for calling. How can I assist you today?";
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a Voice AI agent following this prompt/script:\n\n${prompt}\n\nRespond naturally as the agent would, keeping responses concise for voice interactions.`
        },
        {
          role: 'user',
          content: userInput
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error simulating agent response:', error);
    return "I apologize, but I'm having trouble processing your request right now.";
  }
}

/**
 * Evaluates agent response against test case success criteria
 */
async function evaluateResponse(prompt, testCase, agentResponse) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key-for-development') {
    // Mock evaluation
    const criteriaResults = testCase.successCriteria.map(criterion => {
      const passed = Math.random() > 0.3; // 70% pass rate for mock
      return {
        criterion,
        passed,
        reason: passed ? 'Criterion met' : 'Criterion not fully met'
      };
    });

    const passedCount = criteriaResults.filter(r => r.passed).length;
    const passed = passedCount >= testCase.successCriteria.length * 0.7; // 70% threshold

    return {
      passed,
      score: (passedCount / testCase.successCriteria.length) * 100,
      criteriaResults,
      issues: passed ? [] : ['Some success criteria were not fully met']
    };
  }

  const evaluationPrompt = `Evaluate this Voice AI agent response against the test case success criteria.

Agent Prompt/Script: ${prompt}
Test Case: ${testCase.name || testCase.scenarioDescription || 'Unknown'}
User Input: ${testCase.userInput}
Agent Response: ${agentResponse}
Success Criteria: ${JSON.stringify(testCase.successCriteria, null, 2)}

For each success criterion, determine if it was met and provide reasoning.
You must return your response as a valid JSON object with the following structure:
- passed: boolean (true if at least 70% of criteria met)
- score: number (0-100 percentage)
- criteriaResults: array of {criterion, passed, reason}
- issues: array of strings describing any problems

Return only valid JSON, no additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert at evaluating Voice AI agent performance.' },
        { role: 'user', content: evaluationPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error evaluating response:', error);
    return {
      passed: false,
      score: 0,
      criteriaResults: [],
      issues: ['Evaluation failed']
    };
  }
}

module.exports = { execute };
