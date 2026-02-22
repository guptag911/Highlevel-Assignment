<template>
  <div id="app">
    <div class="background-mesh"></div>
    <header class="app-header">
      <div class="container header-container">
        <div class="logo-area">
          <div class="logo-icon">
            <img src="/img/performance.png" alt="Voice AI Optimizer Logo" />
          </div>
          <div class="logo-text">
            <h1>Voice AI Optimizer</h1>
            <p class="subtitle">Agent Performance Copilot</p>
          </div>
        </div>
        <div class="company-logo">
          <img src="/img/highlevel_logo.jpg" alt="HighLevel Logo" />
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --bg-color: #0d0f1a;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-color: #8b5cf6;
  --accent-glow: rgba(139, 92, 246, 0.4);
  --success-color: #10b981;
  --error-color: #ef4444;
  --glass-bg: rgba(30, 41, 59, 0.4);
  --glass-border: rgba(255, 255, 255, 0.08);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Outfit', -apple-system, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.background-mesh {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: 
    radial-gradient(circle at 15% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 50%);
  z-index: -1;
  pointer-events: none;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(13, 15, 26, 0.7);
  border-bottom: 1px solid var(--glass-border);
  padding: 1rem 0;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-text .subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.company-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.company-logo img {
  height: 80px; /* Increased from 40px */
  max-width: 250px;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  padding: 4px;
}  

.company-logo img:hover {
  transform: scale(1.05);
}

.app-main {
  flex: 1;
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>
