<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="dashboard-header-content">
        <img src="/img/customer-service.png" alt="Customer Service Logo" class="dashboard-icon" />
        <div>
          <h2>Agent Performance Copilot</h2>
          <p>Automate testing and optimization for your Voice AI agents</p>
        </div>
      </div>
    </div>

    <!-- Step 1: Prompt Input -->
    <div class="card">
      <h3>Step 1: Enter Your Voice AI Agent Prompt</h3>
      <textarea
        v-model="prompt"
        placeholder="Paste your Voice AI agent prompt/script here..."
        class="prompt-input"
        rows="8"
      ></textarea>
      <button 
        @click="startOptimization" 
        :disabled="!prompt.trim() || loading"
        class="btn btn-primary"
      >
        {{ loading ? 'Processing...' : 'Start Optimization Cycle' }}
      </button>
    </div>

    <!-- Step 2: Analysis Results -->
    <div v-if="analysis" class="card">
      <h3>Prompt Analysis</h3>
      <div class="analysis-grid">
        <div v-if="analysis.intent" class="analysis-item">
          <strong>Intent:</strong> {{ analysis.intent }}
        </div>
        <div v-if="analysis.tone" class="analysis-item">
          <strong>Tone:</strong> {{ analysis.tone }}
        </div>
        <div v-if="analysis.estimatedComplexity" class="analysis-item">
          <strong>Complexity:</strong> {{ analysis.estimatedComplexity }}
        </div>
      </div>
      <div v-if="analysis.keyActions && analysis.keyActions.length > 0" class="analysis-section">
        <strong>Key Actions:</strong>
        <ul>
          <li v-for="action in analysis.keyActions" :key="action">{{ action }}</li>
        </ul>
      </div>
      <div v-if="analysis.successCriteria && analysis.successCriteria.length > 0" class="analysis-section">
        <strong>Success Criteria:</strong>
        <ul>
          <li v-for="criterion in analysis.successCriteria" :key="criterion">{{ criterion }}</li>
        </ul>
      </div>
    </div>

    <!-- Step 3: Test Cases -->
    <div v-if="testCases.length > 0" class="card">
      <h3>Generated Test Cases</h3>
      <div class="test-cases">
        <div 
          v-for="(testCase, index) in testCases" 
          :key="testCase.id || index"
          class="test-case-card"
        >
          <div class="test-case-header">
            <span class="test-number">Test {{ index + 1 }}</span>
            <span class="test-name">{{ testCase.name }}</span>
          </div>
          <div class="test-case-content">
            <p><strong>Scenario:</strong> {{ testCase.scenario }}</p>
            <p><strong>User Input:</strong> "{{ testCase.userInput }}"</p>
            <div v-if="getSuccessCriteriaArray(testCase.successCriteria).length" class="success-criteria">
              <strong>Success Criteria:</strong>
              <ul>
                <li v-for="(criterion, idx) in getSuccessCriteriaArray(testCase.successCriteria)" :key="idx">
                  {{ criterion }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Test Results -->
    <div v-if="testResults.length > 0" class="card">
      <h3>Test Execution Results</h3>
      <div class="results-summary">
        <div class="summary-stat">
          <div class="stat-value">{{ testResults.length }}</div>
          <div class="stat-label">Total Tests</div>
        </div>
        <div class="summary-stat success">
          <div class="stat-value">{{ passedCount }}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="summary-stat error">
          <div class="stat-value">{{ failedCount }}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="summary-stat">
          <div class="stat-value">{{ Math.round((passedCount / testResults.length) * 100) }}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
      
      <div class="test-results">
        <div 
          v-for="result in testResults" 
          :key="result.testCaseId"
          class="result-card"
          :class="{ 'passed': result.passed, 'failed': !result.passed }"
        >
          <div class="result-header">
            <span class="result-status" :class="result.passed ? 'success' : 'error'">
              {{ result.passed ? '✓ Passed' : '✗ Failed' }}
            </span>
            <span class="result-name">{{ result.testCaseName }}</span>
            <span class="result-score">Score: {{ result.score }}%</span>
          </div>
          <div class="result-content">
            <p><strong>User Input:</strong> "{{ result.userInput }}"</p>
            <p><strong>Agent Response:</strong> "{{ result.agentResponse }}"</p>
            <div v-if="result.criteriaResults" class="criteria-results">
              <strong>Criteria Evaluation:</strong>
              <ul>
                <li 
                  v-for="(criteria, idx) in result.criteriaResults" 
                  :key="idx"
                  :class="{ 'passed': criteria.passed, 'failed': !criteria.passed }"
                >
                  {{ criteria.passed ? '✓' : '✗' }} {{ criteria.criterion }}
                  <span class="criteria-reason">{{ criteria.reason }}</span>
                </li>
              </ul>
            </div>
            <div v-if="result.issues && result.issues.length > 0" class="issues">
              <strong>Issues:</strong>
              <ul>
                <li v-for="(issue, idx) in result.issues" :key="idx">{{ issue }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 5: Optimized Prompt -->
    <div v-if="optimizedPrompt" class="card">
      <h3>Optimized Prompt</h3>
      <div class="prompt-comparison">
        <div class="prompt-section">
          <h4>Original Prompt</h4>
          <textarea 
            :value="originalPrompt" 
            readonly 
            class="prompt-display"
            rows="6"
          ></textarea>
        </div>
        <div class="prompt-section">
          <h4>Optimized Prompt</h4>
          <textarea 
            v-model="optimizedPrompt" 
            class="prompt-display optimized"
            rows="6"
          ></textarea>
        </div>
      </div>
      <div class="optimization-actions">
        <button @click="copyOptimizedPrompt" class="btn btn-secondary" :class="{ 'btn-copied': copying }">
          {{ copying ? 'Copied!' : 'Copy Optimized Prompt' }}
        </button>
        <button @click="reset" class="btn btn-outline">
          Start New Optimization
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="card error-card">
      <h3>Error</h3>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

export default {
  name: 'Dashboard',
  data() {
    return {
      prompt: '',
      loading: false,
      copying: false,
      analysis: null,
      testCases: [],
      testResults: [],
      originalPrompt: '',
      optimizedPrompt: '',
      error: null
    };
  },
  computed: {
    passedCount() {
      return this.testResults.filter(r => r.passed).length;
    },
    failedCount() {
      return this.testResults.filter(r => !r.passed).length;
    }
  },
  methods: {
    async startOptimization() {
      if (!this.prompt.trim()) {
        this.error = 'Please enter a prompt';
        return;
      }

      this.loading = true;
      this.error = null;
      this.originalPrompt = this.prompt;

      try {
        const response = await axios.post(`${API_BASE_URL}/optimize-cycle`, {
          prompt: this.prompt
        });

        this.analysis = response.data.analysis;
        this.testCases = response.data.testCases || [];
        this.testResults = response.data.testResults || [];
        this.optimizedPrompt = response.data.optimizedPrompt;
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to run optimization cycle';
        console.error('Optimization error:', err);
      } finally {
        this.loading = false;
      }
    },
    copyOptimizedPrompt() {
      navigator.clipboard.writeText(this.optimizedPrompt).then(() => {
        this.copying = true;
        setTimeout(() => { this.copying = false; }, 2000);
      });
    },
    reset() {
      this.prompt = '';
      this.analysis = null;
      this.testCases = [];
      this.testResults = [];
      this.originalPrompt = '';
      this.optimizedPrompt = '';
      this.error = null;
    },
    getSuccessCriteriaArray(successCriteria) {
      if (!successCriteria) return [];
      if (Array.isArray(successCriteria)) return successCriteria;
      if (typeof successCriteria === 'string') return [successCriteria];
      return [];
    }
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 100%;
  animation: fadeIn 0.5s ease-out;
}

.dashboard-header {
  margin-bottom: 2.5rem;
}

.dashboard-header-content {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.dashboard-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background: rgba(15, 23, 42, 0.4);
  padding: 4px;
}

.dashboard-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.dashboard-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.card {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--glass-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: slideUp 0.4s ease-out backwards;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
}

.card h3 {
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prompt-input {
  width: 100%;
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-primary);
  resize: vertical;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
}

.prompt-input::placeholder {
  color: #64748b;
}

.prompt-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--accent-glow);
  background: rgba(15, 23, 42, 0.8);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-color), #6d28d9);
  color: #ffffff;
  box-shadow: 0 4px 15px var(--accent-glow);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px var(--accent-glow);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #334155;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-copied {
  background: var(--success-color) !important;
  color: #fff !important;
  border-color: var(--success-color) !important;
}

.btn-outline {
  background: transparent;
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
}

.btn-outline:hover {
  background: var(--accent-glow);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.analysis-item {
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: border-color 0.2s;
}
.analysis-item:hover {
  border-color: rgba(255,255,255,0.2);
}
.analysis-item strong {
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.analysis-section {
  margin-top: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.analysis-section strong {
  color: var(--text-primary);
}

.analysis-section ul {
  margin-top: 0.75rem;
  margin-left: 1.5rem;
}

.analysis-section li {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.test-cases {
  display: grid;
  gap: 1.25rem;
}

.test-case-card {
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 20px;
  background: rgba(15, 23, 42, 0.4);
  transition: border-color 0.2s;
}
.test-case-card:hover {
  border-color: rgba(255,255,255,0.2);
}

.test-case-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.test-number {
  background: var(--accent-color);
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
  box-shadow: 0 2px 10px var(--accent-glow);
}

.test-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.test-case-content p {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}
.test-case-content strong {
  color: #cbd5e1;
}

.success-criteria {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.success-criteria ul {
  margin-top: 0.5rem;
  margin-left: 1.5rem;
}

.success-criteria li {
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.summary-stat {
  text-align: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  transition: transform 0.2s;
}
.summary-stat:hover {
  transform: translateY(-2px);
}

.summary-stat.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}

.summary-stat.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-stat.success .stat-value {
  color: var(--success-color);
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.summary-stat.error .stat-value {
  color: var(--error-color);
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.test-results {
  display: grid;
  gap: 1.25rem;
}

.result-card {
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 20px;
  background: rgba(15, 23, 42, 0.4);
}

.result-card.passed {
  border-left: 4px solid var(--success-color);
}

.result-card.failed {
  border-left: 4px solid var(--error-color);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.result-status {
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.result-status.success {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.result-status.error {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.result-name {
  font-weight: 600;
  flex: 1;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.result-score {
  color: var(--accent-color);
  font-weight: 600;
  font-size: 0.9rem;
  background: var(--accent-glow);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.result-content p {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}
.result-content strong {
  color: #cbd5e1;
}

.criteria-results {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.criteria-results ul {
  margin-top: 0.75rem;
  list-style: none;
}

.criteria-results li {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid transparent;
}

.criteria-results li.passed {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.2);
}

.criteria-results li.failed {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.2);
}

.criteria-reason {
  display: block;
  font-size: 0.8125rem;
  opacity: 0.85;
  margin-top: 0.35rem;
  color: var(--text-secondary);
}

.issues {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}

.issues strong {
  color: #f87171;
}

.issues ul {
  margin-top: 0.5rem;
  margin-left: 1.5rem;
}

.issues li {
  color: #fca5a5;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
}

.prompt-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.prompt-section h4 {
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 600;
}

.prompt-display {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  background: rgba(15, 23, 42, 0.4);
  color: var(--text-secondary);
  transition: all 0.2s;
}

.prompt-display.optimized {
  border-color: var(--accent-color);
  background: rgba(139, 92, 246, 0.05);
  color: var(--text-primary);
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05);
}

.prompt-display:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-glow);
  background: rgba(15, 23, 42, 0.8);
}

.optimization-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.error-card {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.error-card h3 {
  color: #f87171;
}

.error-card p {
  color: #fca5a5;
  font-size: 0.9375rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stagger card animations */
.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }
.card:nth-child(5) { animation-delay: 0.5s; }

@media (max-width: 768px) {
  .prompt-comparison {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .results-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
