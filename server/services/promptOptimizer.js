const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: ''
});

/**
 * Optimizes the Voice AI agent prompt based on test results
 */
async function optimize(originalPrompt, testResults) {
  // Handle both formats: { results: [...] } or just the array
  const resultsArray = Array.isArray(testResults) ? testResults : (testResults?.results || []);
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key-for-development') {
    // Mock optimization - add improvements based on common failures
    const failedTests = resultsArray.filter(r => !r.passed);
    
    if (failedTests.length === 0) {
      return { optimizedPrompt: originalPrompt };
    }

    // Simple mock optimization - add instructions for common issues
    let optimized = originalPrompt;
    
    if (failedTests.some(t => t.issues.some(i => i.includes('email')))) {
      optimized += '\n\nIMPORTANT: Always ask for the caller\'s email address before ending the conversation.';
    }
    
    if (failedTests.some(t => t.issues.some(i => i.includes('polite') || i.includes('interrupt')))) {
      optimized += '\n\nCRITICAL: Maintain a polite and professional tone at all times, even when interrupted or dealing with difficult callers.';
    }
    
    if (failedTests.some(t => t.issues.some(i => i.includes('objection')))) {
      optimized += '\n\nWhen handling objections, acknowledge the concern, provide value, and gently guide back to the main goal without being pushy.';
    }

    return { optimizedPrompt: optimized };
  }

  // Analyze failures and generate optimized prompt
  const failedTests = resultsArray.filter(r => !r.passed);
  const passedTests = resultsArray.filter(r => r.passed);

  const optimizationPrompt = `You are an expert at optimizing Voice AI agent prompts. 

Original Prompt:
${originalPrompt}

Test Results Summary:
- Total Tests: ${resultsArray.length}
- Passed: ${passedTests.length}
- Failed: ${failedTests.length}

Failed Test Details:
${failedTests.map(t => `
Test: ${t.testCaseName}
User Input: ${t.userInput}
Agent Response: ${t.agentResponse}
Issues: ${t.issues.join(', ')}
Criteria Failed: ${t.criteriaResults.filter(c => !c.passed).map(c => c.criterion).join(', ')}
`).join('\n')}

Your task:
1. Analyze why the agent failed these tests
2. Identify gaps or weaknesses in the original prompt
3. Generate an optimized version that addresses these failures
4. Maintain the original intent and structure
5. Add specific instructions to handle the failure scenarios
6. Ensure the optimized prompt is clear, actionable, and will improve test pass rates

Return ONLY the optimized prompt text, without any additional commentary or explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at prompt engineering for Voice AI agents. Generate optimized prompts that improve agent performance.'
        },
        {
          role: 'user',
          content: optimizationPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });

    const optimizedPrompt = response.choices[0].message.content.trim();
    
    return { optimizedPrompt };
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    throw new Error('Failed to optimize prompt with AI');
  }
}

module.exports = { optimize };
