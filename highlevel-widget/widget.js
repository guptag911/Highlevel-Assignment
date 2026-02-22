/**
 * HighLevel Custom Widget Integration
 * This script can be embedded in HighLevel agency account custom JS section
 * to integrate the Voice AI Performance Optimizer into the HighLevel interface
 */

(function () {
  'use strict';

  // Configuration - Update these with your deployment URL
  const API_BASE_URL = 'https://your-deployment-url.com/api'; // Update this
  const WIDGET_ID = 'voice-ai-optimizer-widget';

  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Creates and injects the optimizer widget into HighLevel UI
   */
  function createWidget() {
    // Check if widget already exists
    if (document.getElementById(WIDGET_ID)) {
      return;
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = WIDGET_ID;
    widgetContainer.innerHTML = `
      <div class="hl-optimizer-widget">
        <div class="hl-optimizer-header">
          <div class="hl-optimizer-header-content">
            <div class="hl-optimizer-icon">
              <!-- Using the same logo as App.vue, but pointing to the API_BASE_URL origin -->
              <img src="${API_BASE_URL.replace('/api', '')}/img/performance.png" alt="Logo" onerror="this.style.display='none'"/>
            </div>
            <div class="hl-logo-text">
              <h3>Voice AI Optimizer</h3>
              <p class="hl-subtitle">Agent Performance Copilot</p>
            </div>
          </div>
          <button class="hl-optimizer-close" onclick="this.closest('#${WIDGET_ID}').remove()" aria-label="Close">×</button>
        </div>
        <div class="hl-optimizer-content">
          <div class="hl-optimizer-step">
            <label for="hl-prompt-input">Step 1: Enter Your Voice AI Agent Prompt</label>
            <textarea id="hl-prompt-input" rows="6" placeholder="Paste your agent prompt/script here..."></textarea>
          </div>
          <button id="hl-optimize-btn" class="hl-optimizer-btn">Start Optimization Cycle</button>
          <div id="hl-results" class="hl-optimizer-results" style="display: none;"></div>
        </div>
      </div>
    `;

    // Inject styles - Modern Dark Glassmorphic Theme
    const styles = document.createElement('style');
    styles.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
      
      #${WIDGET_ID} {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 560px;
        max-height: 90vh;
        overflow-y: auto;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
        color: #f8fafc;
        animation: hl-fadeIn 0.3s ease-out;
      }
      .hl-optimizer-widget {
        padding: 24px 32px;
      }
      .hl-optimizer-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .hl-optimizer-header-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .hl-optimizer-icon {
        width: 48px;
        height: 48px;
        background: white;
        border-radius: 10px;
        padding: 4px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        animation: hl-float 3s ease-in-out infinite;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .hl-optimizer-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .hl-logo-text h3 {
        margin: 0 0 4px 0;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.5px;
        background: linear-gradient(to right, #ffffff, #94a3b8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .hl-subtitle {
        margin: 0;
        font-size: 13px;
        color: #94a3b8;
        font-weight: 400;
      }
      .hl-optimizer-close {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.08);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        font-size: 20px;
        cursor: pointer;
        color: #94a3b8;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .hl-optimizer-close:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #f8fafc;
      }
      .hl-optimizer-step {
        margin-bottom: 20px;
      }
      .hl-optimizer-step label {
        display: block;
        margin-bottom: 12px;
        font-weight: 600;
        font-size: 16px;
        color: #f8fafc;
      }
      #hl-prompt-input {
        width: 100%;
        padding: 16px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        font-size: 14px;
        line-height: 1.6;
        color: #f8fafc;
        resize: vertical;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }
      #hl-prompt-input::placeholder {
        color: #64748b;
      }
      #hl-prompt-input:focus {
        outline: none;
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        background: rgba(15, 23, 42, 0.8);
      }
      .hl-optimizer-btn {
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
      }
      .hl-optimizer-btn:hover {
        box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
        transform: translateY(-1px);
      }
      .hl-optimizer-btn:active {
        transform: scale(0.98);
      }
      .hl-optimizer-btn:disabled {
        background: #334155;
        color: #94a3b8;
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
      }
      .hl-optimizer-results {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .hl-result-section {
        margin-bottom: 20px;
      }
      .hl-result-section h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #f8fafc;
      }
      .hl-result-section p {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #94a3b8;
      }
      .hl-test-result {
        padding: 12px 16px;
        margin-bottom: 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 14px;
        background: rgba(15, 23, 42, 0.4);
      }
      .hl-test-result strong {
        color: #cbd5e1;
      }
      .hl-test-result.passed {
        border-left: 4px solid #10b981;
      }
      .hl-test-result.failed {
        border-left: 4px solid #ef4444;
      }
      .hl-optimized-prompt {
        background: rgba(139, 92, 246, 0.05);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
      }
      .hl-optimized-prompt h4 {
        margin: 0 0 12px 0;
        font-size: 15px;
        font-weight: 600;
        color: #c4b5fd;
      }
      .hl-optimized-prompt textarea {
        width: 100%;
        min-height: 140px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.4);
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        font-size: 14px;
        line-height: 1.6;
        resize: vertical;
        color: #f8fafc;
        box-sizing: border-box;
      }
      .hl-copy-btn {
        margin-top: 16px;
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .hl-copy-btn:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .hl-loading {
        text-align: center;
        padding: 32px;
        font-size: 15px;
        color: #94a3b8;
      }
      @keyframes hl-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes hl-fadeIn {
        from { opacity: 0; transform: translate(-50%, -48%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
    `;
    document.head.appendChild(styles);

    // Append widget to body
    document.body.appendChild(widgetContainer);

    // Attach event listeners
    const optimizeBtn = document.getElementById('hl-optimize-btn');
    optimizeBtn.addEventListener('click', handleOptimize);
  }

  /**
   * Handles the optimization process
   */
  async function handleOptimize() {
    const promptInput = document.getElementById('hl-prompt-input');
    const optimizeBtn = document.getElementById('hl-optimize-btn');
    const resultsDiv = document.getElementById('hl-results');

    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('Please enter a prompt');
      return;
    }

    optimizeBtn.disabled = true;
    optimizeBtn.textContent = 'Processing...';
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<div class="hl-loading">Processing your agent prompt...</div>';

    try {
      const response = await fetch(`${API_BASE_URL}/optimize-cycle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Optimization failed');
      }

      const data = await response.json();

      // Display results
      let resultsHTML = `
        <div class="hl-result-section">
          <h4>Test Results</h4>
          <p><strong>Total Tests:</strong> ${data.summary.totalTests} &middot; 
             <strong>Passed:</strong> ${data.summary.passedTests} &middot; 
             <strong>Failed:</strong> ${data.summary.failedTests}</p>
      `;

      // Show test results
      if (data.testResults && data.testResults.length > 0) {
        data.testResults.forEach(result => {
          resultsHTML += `
            <div class="hl-test-result ${result.passed ? 'passed' : 'failed'}">
              <strong>${escapeHtml(result.testCaseName)}</strong> - 
              ${result.passed ? '✓ Passed' : '✗ Failed'} (Score: ${result.score}%)
            </div>
          `;
        });
      }

      resultsHTML += `</div>`;

      // Show optimized prompt
      if (data.optimizedPrompt) {
        resultsHTML += `
          <div class="hl-optimized-prompt">
            <h4>Optimized Prompt</h4>
            <textarea readonly>${escapeHtml(data.optimizedPrompt)}</textarea>
            <button class="hl-copy-btn" onclick="var btn=this; navigator.clipboard.writeText(this.previousElementSibling.value).then(function(){ var t=btn.textContent; btn.textContent='Copied!'; btn.style.background='#10b981'; btn.style.borderColor='#10b981'; setTimeout(function(){ btn.textContent=t; btn.style.background=''; btn.style.borderColor=''; }, 2000); });">
              Copy Optimized Prompt
            </button>
          </div>
        `;
      }

      resultsDiv.innerHTML = resultsHTML;

    } catch (error) {
      resultsDiv.innerHTML = `
        <div class="hl-loading" style="color: #ef4444;">
          Error: ${error.message}. Please check your API configuration.
        </div>
      `;
    } finally {
      optimizeBtn.disabled = false;
      optimizeBtn.textContent = 'Start Optimization Cycle';
    }
  }

  /**
   * Creates a button in HighLevel UI to open the widget
   */
  function addWidgetButton() {
    // Wait for HighLevel UI to be ready
    const checkInterval = setInterval(() => {
      // Look for a common HighLevel container (adjust selector as needed)
      const hlContainer = document.querySelector('[data-testid="settings"]') ||
        document.querySelector('.settings-container') ||
        document.body;

      if (hlContainer) {
        clearInterval(checkInterval);

        // Create button (adjust placement based on HighLevel UI structure)
        const button = document.createElement('button');
        button.textContent = 'Optimize Voice AI';
        button.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          padding: 14px 24px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
          transition: all 0.2s ease;
        `;
        button.addEventListener('click', () => {
          createWidget();
        });
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
        });
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
        });

        document.body.appendChild(button);
      }
    }, 500);

    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addWidgetButton);
  } else {
    addWidgetButton();
  }

  // Export function for manual invocation
  window.openVoiceAIOptimizer = createWidget;

})();
