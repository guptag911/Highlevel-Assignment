const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST before requiring any modules that depend on them
dotenv.config();

const promptAnalyzer = require('./services/promptAnalyzer');
const testGenerator = require('./services/testGenerator');
const testExecutor = require('./services/testExecutor');
const promptOptimizer = require('./services/promptOptimizer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Analyze Voice AI agent prompt
app.post('/api/analyze-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const analysis = await promptAnalyzer.analyze(prompt);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing prompt:', error);
    res.status(500).json({ error: 'Failed to analyze prompt', details: error.message });
  }
});

// Generate test cases based on prompt analysis
app.post('/api/generate-tests', async (req, res) => {
  try {
    const { prompt, analysis } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const testCases = await testGenerator.generate(prompt, analysis);
    res.json({ testCases });
  } catch (error) {
    console.error('Error generating test cases:', error);
    res.status(500).json({ error: 'Failed to generate test cases', details: error.message });
  }
});

// Execute test cases against Voice AI agent
app.post('/api/execute-tests', async (req, res) => {
  try {
    const { prompt, testCases } = req.body;
    if (!prompt || !testCases || !Array.isArray(testCases)) {
      return res.status(400).json({ error: 'Prompt and testCases array are required' });
    }

    const results = await testExecutor.execute(prompt, testCases);
    res.json({ results });
  } catch (error) {
    console.error('Error executing tests:', error);
    res.status(500).json({ error: 'Failed to execute tests', details: error.message });
  }
});

// Optimize prompt based on test results
app.post('/api/optimize-prompt', async (req, res) => {
  try {
    const { originalPrompt, testResults } = req.body;
    if (!originalPrompt || !testResults) {
      return res.status(400).json({ error: 'Original prompt and test results are required' });
    }

    const optimizedPrompt = await promptOptimizer.optimize(originalPrompt, testResults);
    res.json({ optimizedPrompt, originalPrompt });
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    res.status(500).json({ error: 'Failed to optimize prompt', details: error.message });
  }
});

// Full optimization cycle (analyze -> generate tests -> execute -> optimize)
app.post('/api/optimize-cycle', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Step 1: Analyze prompt
    const analysis = await promptAnalyzer.analyze(prompt);
    // Step 2: Generate test cases
    const { testCases } = await testGenerator.generate(prompt, analysis);
    // Step 3: Execute tests
    const testExecutionResult = await testExecutor.execute(prompt, testCases);
    const results = testExecutionResult.results;
    // Step 4: Optimize prompt
    const { optimizedPrompt } = await promptOptimizer.optimize(prompt, testExecutionResult);

    res.json({
      originalPrompt: prompt,
      analysis,
      testCases,
      testResults: results,
      optimizedPrompt,
      summary: {
        totalTests: testCases.length,
        passedTests: results.filter(r => r.passed).length,
        failedTests: results.filter(r => !r.passed).length,
        optimizationApplied: optimizedPrompt !== prompt
      }
    });
  } catch (error) {
    console.error('Error in optimization cycle:', error);
    res.status(500).json({ error: 'Failed to complete optimization cycle', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
