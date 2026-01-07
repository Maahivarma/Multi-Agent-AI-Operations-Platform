import { Orchestrator } from './core/Orchestrator.js';
import { Dashboard } from './components/Dashboard.js';

class App {
    constructor() {
        this.container = document.getElementById('main-container');
        this.input = document.getElementById('business-problem-input');
        this.startBtn = document.getElementById('start-btn');
        this.apiKeyInput = document.getElementById('api-key-input'); // We'll add this to HTML

        // Restore API Key if saved
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey && this.apiKeyInput) {
            this.apiKeyInput.value = savedKey;
        }

        this.init();
    }

    init() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.handleStart());
        }

        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleStart();
            });
        }
    }

    async handleStart() {
        const problem = this.input.value.trim();
        if (!problem) return;

        const apiKey = this.apiKeyInput ? this.apiKeyInput.value.trim() : null;
        if (apiKey) localStorage.setItem('gemini_api_key', apiKey);

        // Initialize Orchestrator
        // If apiKey is present, it uses GeminiProvider, else MockProvider
        this.orchestrator = new Orchestrator(apiKey);

        // Initialize Dashboard
        const dashboard = new Dashboard(this.container);
        dashboard.render(problem);

        // Wire up events
        this.orchestrator.onTaskDecomposed = (tasks) => dashboard.renderTasks(tasks);
        this.orchestrator.onAgentThinking = (id, msg) => dashboard.addThinking(id, msg);
        this.orchestrator.onAgentResult = (id, result) => dashboard.addResult(id, result);
        this.orchestrator.onFinalDecision = (decision) => dashboard.showDecision(decision);

        // Start processing
        try {
            await this.orchestrator.process(problem);
        } catch (e) {
            console.error(e);
            dashboard.showDecision("Error: " + e.message);
        }
    }
}

// Initialize App
new App();
