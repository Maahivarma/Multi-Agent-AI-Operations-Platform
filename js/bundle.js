/**
 * COO.AI - SINGLE BUNDLE
 * Contains all logic to run without ES Modules (bypassing CORS on local file://)
 */

/* =========================================
   1. CORE: LLM Provider
   ========================================= */
class LLMProvider {
    async generate(prompt, systemPrompt = "") {
        throw new Error("generate() must be implemented by subclass");
    }
}

// === SYSTEM LOGGER UTILITY ===
const SystemLogger = {
    log: (msg) => {
        try {
            // Emitting to console for now, Orchestrator can hook this later if needed
            console.log(`[SYS] ${msg}`);
            // If running in browser, dispatch custom event for UI debugging
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('sys-log', { detail: msg }));
            }
        } catch (e) {
            // Swallow error to prevent system crash
        }
    }
};

class MockProvider extends LLMProvider {
    async generate(prompt, systemPrompt = "") {
        // Reduced delay for faster "Speed up response" request
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

        // === SCENARIO DETECTION ===
        const p = prompt.toLowerCase();
        let scenario = 'generic';
        if (p.includes('profit') || p.includes('revenue') || p.includes('margin')) scenario = 'profit';
        else if (p.includes('attrition') || p.includes('turnover') || p.includes('hiring') || p.includes('employee')) scenario = 'attrition';
        else if (p.includes('scale') || p.includes('growing') || p.includes('startup')) scenario = 'scale';
        else if (p.includes('simulate') || p.includes('what if') || p.includes('scenario')) scenario = 'simulation';

        // === 1. DECOMPOSITION ===
        if (systemPrompt.includes('Manager Agent') && systemPrompt.includes('Decompose')) {
            if (scenario === 'profit') {
                return JSON.stringify([
                    { agentId: 'finance', task: 'Audit recent P&L and cost structures', priority: 'CRITICAL' },
                    { agentId: 'market', task: 'Analyze competitor pricing pressure', priority: 'HIGH' },
                    { agentId: 'ops', task: 'Identify efficiency leaks in supply chain', priority: 'MEDIUM' }
                ]);
            } else if (scenario === 'attrition') {
                return JSON.stringify([
                    { agentId: 'hr', task: 'Analyze exit interview data & cultural sentiment', priority: 'CRITICAL' },
                    { agentId: 'finance', task: 'Calculate cost of turnover replacement', priority: 'HIGH' },
                    { agentId: 'ops', task: 'Assess impact on project delivery timelines', priority: 'HIGH' }
                ]);
            } else if (scenario === 'scale') {
                return JSON.stringify([
                    { agentId: 'ops', task: 'Stress test infrastructure for 10x growth', priority: 'CRITICAL' },
                    { agentId: 'hr', task: 'Plan mass-hiring onboarding pipeline', priority: 'HIGH' },
                    { agentId: 'finance', task: 'Model burn rate for aggressive expansion', priority: 'MEDIUM' }
                ]);
            } else if (scenario === 'simulation') {
                return JSON.stringify([
                    { agentId: 'finance', task: 'Simulate financial outcome (Baseline vs Scenario)', priority: 'CRITICAL' },
                    { agentId: 'market', task: 'Project customer churn delta', priority: 'HIGH' },
                    { agentId: 'ops', task: 'Assess volume impact on logistics', priority: 'MEDIUM' }
                ]);
            }
            // Fallback
            return JSON.stringify([
                { agentId: 'finance', task: 'Analyze fiscal impact', priority: 'CRITICAL' },
                { agentId: 'market', task: 'Assess market conditions', priority: 'HIGH' },
                { agentId: 'ops', task: 'Review operational capability', priority: 'MEDIUM' }
            ]);

            // === 2. AGENT EXECUTION ===
        } else if (systemPrompt.includes('Finance Agent')) {
            if (scenario === 'attrition') return JSON.stringify({ thought: "Reviewing payroll...", analysis: "Replacing 15% staff costs $1.2M annually.", data: { "Replacement Cost": "$1.2M", "Training Loss": "$400k" }, recommendation: "Increase retention budget by 10%.", confidence: 95 });
            if (scenario === 'scale') return JSON.stringify({ thought: "Modeling Series B runway...", analysis: "Current cash flow supports 6 months of hyper-growth.", data: { "Runway": "6 Months", "Burn Rate": "+200%" }, recommendation: "Secure bridge financing immediately.", confidence: 88 });
            if (scenario === 'simulation') return JSON.stringify({ thought: "Running Monte Carlo sim...", analysis: "Price hike increases revenue but drops volume.", data: { "Revenue": "+15%", "Volume": "-10%" }, recommendation: "Proceed with 10% price hike.", confidence: 85 });
            // Default (Profit)
            return JSON.stringify({ thought: "Auditing ledgers...", analysis: "Margins down 8% due to supplier hikes.", data: { "Margin": "-8%", "Supplier Cost": "+15%" }, recommendation: "Renegotiate vendor contracts.", confidence: 92 });

        } else if (systemPrompt.includes('Ops Agent')) {
            if (scenario === 'attrition') return JSON.stringify({ thought: "Checking velocity...", analysis: "Feature delivery slowed by 40% due to brain drain.", data: { "Velocity": "-40%", "Missed DLs": "5" }, recommendation: "Slow down roadmap until stabilized.", confidence: 85 });
            if (scenario === 'scale') return JSON.stringify({ thought: "Stress testing servers...", analysis: "Current architecture fails at 50k concurrent users.", data: { "Max Load": "50k Users", "Upgrade Cost": "$50k" }, recommendation: "Migrate to Kubernetes cluster.", confidence: 98 });
            // Default
            return JSON.stringify({ thought: "Scanning logistics...", analysis: "Shipping delays causing 12% cancellations.", data: { "Latency": "4 Days", "Cancel Rate": "12%" }, recommendation: "Switch logistics partner.", confidence: 78 });

        } else if (systemPrompt.includes('Market Agent')) {
            // Default
            return JSON.stringify({ thought: "Analyzing trends...", analysis: "Competitors slashed prices by 10%.", data: { "Comp Price": "-10%" }, recommendation: "Launch loyalty program.", confidence: 82 });

        } else if (systemPrompt.includes('HR Agent')) {
            if (scenario === 'attrition') return JSON.stringify({ thought: "Scanning surveys...", analysis: "Employees cite 'Lack of Growth' (65%) as top reason.", data: { "Sentiment": "Negative", "Top Issue": "Growth" }, recommendation: "Implement mentorship program.", confidence: 94 });
            if (scenario === 'scale') return JSON.stringify({ thought: "Checking pipeline...", analysis: "Need to hire 20 engineers in Q3.", data: { "Open Roles": "20", "Time-to-Fill": "45 Days" }, recommendation: "Engage external recruiters.", confidence: 80 });
            return JSON.stringify({ thought: "Analyzing staff...", analysis: "Headcount valid.", data: { "HC": "OK" }, recommendation: "Maintain.", confidence: 99 });

            // === 3. SYNTHESIS (EXECUTIVE REPORT) ===
        } else if (systemPrompt.includes('Synthesize')) {
            if (scenario === 'profit') {
                return JSON.stringify({
                    overall_confidence: 87,
                    executive_summary: ["Margins declined 8% driven by supplier hikes and shipping delays.", "Competitor price cuts are exacerbating the issue."],
                    department_insights: { "Finance": "Vendor costs up 15%.", "Ops": "Shipping latency causing cancellations.", "Market": "Price sensitivity is high." },
                    risks_constraints: ["Cash flow crunch in Q3", "Loss of market share to cheaper rival"],
                    "recommended_action_plan": { "Short_Term": "Renegotiate vendor contracts & switch logistics provider.", "Long_Term": "Invest in vertical integration." },
                    "kpis_to_monitor": [
                        { "name": "Gross Margin %", "target": "> 45%", "rationale": "Primary indicator of pricing power retention." },
                        { "name": "Vendor Cost Index", "target": "-15%", "rationale": "Measures success of contract renegotiations." },
                        { "name": "Order Cancel Rate", "target": "< 2%", "rationale": "Tracks logistics cleanup impact." },
                        { "name": "Shipping Latency", "target": "< 3 Days", "rationale": "Critical for customer retention." },
                        { "name": "Competitor Price Gap", "target": "< 5%", "rationale": "Early warning for market share loss." }
                    ],
                    "risk_score": 45,
                    "plain_language_explanation": {
                        "findings": "We found that while sales are up, our profit margins are shrinking because vendor costs have increased silently.",
                        "root_cause": "Old supplier contracts expired and auto-renewed at higher market rates without negotiation.",
                        "meaning": "We need to immediately renegotiate these contracts or we will lose money on every sale."
                    }
                });
            } else if (scenario === 'attrition') {
                return JSON.stringify({
                    overall_confidence: 92,
                    executive_summary: ["Critical 'Brain Drain' detected. Delivery velocity down 40%.", "Root cause is lack of career growth, not salary."],
                    department_insights: { "HR": "65% exit due to growth lack.", "Finance": "Turnover costing $1.6M/yr.", "Ops": "Roadmap delayed by 2 sprints." },
                    risks_constraints: ["Product launch delay (High Risk)", "Loss of institutional knowledge"],
                    recommended_action_plan: { "Short_Term": "Launch internal mentorship & freeze non-essential projects.", "Long_Term": "Overhaul compensation & career ladder." },
                    "kpis_to_monitor": [
                        { "name": "Voluntary Turnover", "target": "< 8%", "rationale": "Core metric for retention success." },
                        { "name": "Employee NPS", "target": "> 40", "rationale": "Leading indicator of cultural health." },
                        { "name": "Sprint Velocity", "target": "Recover to 100pts", "rationale": "Measures operational recovery." },
                        { "name": "Time-to-Fill", "target": "< 30 Days", "rationale": "Recruiting pipeline efficiency." },
                        { "name": "Internal Promo Rate", "target": "> 15%", "rationale": "Validates career growth paths." }
                    ],
                    "risk_score": 85,
                    "plain_language_explanation": {
                        "findings": "Employees are leaving in high numbers because they feel stuck in their roles, not because of low pay.",
                        "root_cause": "We haven't promoted anyone internally in 18 months, causing a feeling of stagnation.",
                        "meaning": "Raising salaries won't fix this. We must launch a clear career growth plan immediately to keep our best people."
                    }
                });
            } else if (scenario === 'scale') {
                return JSON.stringify({
                    overall_confidence: 89,
                    executive_summary: ["Infrastructure limits reached at 50k users.", "Runway is tight (6 months) for this aggressive hiring plan."],
                    department_insights: { "Ops": "Server crash imminent at 60k users.", "HR": "Need 20 engineers ASAP.", "Finance": "Burn rate tripling." },
                    risks_constraints: ["System outage during launch", "Running out of cash before Series B"],
                    recommended_action_plan: { "Short_Term": "Migrate to Kubernetes & engage recruiters.", "Long_Term": "Secure bridge financing round." },
                    "kpis_to_monitor": [
                        { "name": "Concurrent Users", "target": "100k Cap", "rationale": "Hard limit for infrastructure scaling." },
                        { "name": "Monthly Burn Rate", "target": "< $200k", "rationale": "Survival metric until Series B." },
                        { "name": "System Uptime", "target": "99.99%", "rationale": "Non-negotiable for user trust." },
                        { "name": "Hiring Velocity", "target": "4 Hires/Mo", "rationale": "Required to build features." },
                        { "name": "CAC Payback", "target": "< 9 Months", "rationale": "Efficiency check for aggressive spend." }
                    ],
                    "risk_score": 70,
                    "plain_language_explanation": {
                        "findings": "Our servers will crash if we add just 10,000 more users. We are growing faster than our tech can handle.",
                        "root_cause": "The current code structure was built for a startup, not a large scale enterprise.",
                        "meaning": "We have to pause non-essential features and focus entirely on upgrading our infrastructure for the next 4 weeks."
                    }
                });
            } else if (scenario === 'simulation') {
                return JSON.stringify({
                    overall_confidence: 85,
                    executive_summary: ["Simulation: 10% Price Increase vs Status Quo.", "Revenue projected to rise 12% despite 8% churn."],
                    department_insights: { "Finance": "Net positive impact on EBITDA.", "Market": "Churn risk in low-tier segment.", "Ops": "Lower volume eases shipping load." },
                    risks_constraints: ["Loss of price-sensitive customers", "Competitor undercut response"],
                    recommended_action_plan: { "Short_Term": "Implement price hike with grandfathering for loyalists.", "Long_Term": "Re-invest profits into premium features." },
                    "kpis_to_monitor": [
                        { "name": "Revenue Per User", "target": "+12%", "rationale": "Projected lift." },
                        { "name": "Churn Rate", "target": "< 5%", "rationale": "Critical risk monitor." }
                    ],
                    "scenario_comparison": [
                        { "metric": "Projected Revenue", "baseline": "$10M", "simulated": "$11.2M", "delta": "+12%" },
                        { "metric": "Active Users", "baseline": "50k", "simulated": "46k", "delta": "-8%" },
                        { "metric": "Gross Margin", "baseline": "40%", "simulated": "45%", "delta": "+5%" }
                    ],
                    "risk_score": 60
                });
            }
            // Default Fallback
            return JSON.stringify({
                overall_confidence: 95,
                executive_summary: ["Standard cycle complete. No anomalies detected."],
                department_insights: { "System": "Nominal" },
                risks_constraints: ["None"],
                recommended_action_plan: { "Short_Term": "Maintain course.", "Long_Term": "Monitor." },
                "kpis_to_monitor": [
                    { "name": "System Uptime", "target": "100%", "rationale": "Baseline." }
                ],
                "risk_score": 10
            });
        }


        return "Process complete.";
    }
}

class GeminiProvider extends LLMProvider {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    }

    async generate(prompt, systemPrompt = "") {
        if (!this.apiKey) throw new Error("API Key required");
        const fullPrompt = `System: ${systemPrompt}\n\nUser: ${prompt}\n\nPlease output ONLY JSON where applicable.`;
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
            });
            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            return text.replace(/```json/g, '').replace(/```/g, '').trim();
        } catch (error) {
            console.error(error);
            return JSON.stringify({ error: "Neural Link Failed." });
        }
    }
}

/* =========================================
   2. CORE: Memory
   ========================================= */
class Memory {
    constructor() {
        this.sharedContext = new Map();
        this.trace = [];
    }
    addToTrace(agentId, action, content) {
        this.trace.push({ timestamp: new Date(), agentId, action, content });
    }
    setContext(key, value) { this.sharedContext.set(key, value); }
    getAllContext() { return Object.fromEntries(this.sharedContext); }
}

/* =========================================
   3. AGENTS
   ========================================= */
class BaseAgent {
    constructor(id, name, role, color, llmProvider) {
        Object.assign(this, { id, name, role, color, llmProvider });
    }
}

class ManagerAgent extends BaseAgent {
    constructor(provider) {
        super('manager', 'Prime Orchestrator', 'Brain', '#ffffff', provider);
    }
    async decompose(userInput) {
        SystemLogger.log("Accessing Manager Core...");
        const prompt = `Break down: "${userInput}". Return JSON array of tasks with 'agentId' (finance, ops, market), 'task', 'priority'.`;
        const res = await this.llmProvider.generate(userInput, "You are the System Core. Decompose complex tasks.");
        try { return JSON.parse(res); } catch { return []; }
    }
    async synthesize(problem, results) {
        // Read learned weights
        const weights = JSON.parse(localStorage.getItem('coo_agent_weights') || '{"finance":1, "ops":1, "market":1, "hr":1}');

        const prompt = `Synthesize results: ${JSON.stringify(results)}. 
        
        CONFLICT RESOLUTION PROTOCOL (With User-Reinforced Weights):
        - Finance Weight: ${weights.finance}
        - Ops Weight: ${weights.ops}
        - Market Weight: ${weights.market}
        - HR Weight: ${weights.hr}
        (Higher weight = Prefer this department's advice in conflicts).

        1. Safety/Reliability (Ops) > Budget (Finance) if Risk > 80%.
        2. Compliance (HR) > Growth (Market).
        3. Profit (Finance) > Efficiency (Ops) if Risk is Low.

        Return JSON with these exact keys:
        {
            "overall_confidence": 0-100,
            "executive_summary": ["bullet 1", "bullet 2"],
            "department_insights": {"DeptName": "Insight"},
            "risks_constraints": ["risk 1", "risk 2"],
            "recommended_action_plan": {"Short_Term": "action", "Long_Term": "action"},
            "kpis_to_monitor": [{"name": "KPI", "target": "val", "rationale": "reason"}],
            "scenario_comparison": [{"metric": "M", "baseline": "A", "simulated": "B", "delta": "%"}],
            "plain_language_explanation": {
                "findings": "Simple summary of what was found.",
                "root_cause": "Simple explanation of why this is happening.",
                "meaning": "Simple explanation of what the recommendations actually mean for the business."
            }
        }`;

        const res = await this.llmProvider.generate(prompt, "You are the System Core. Synthesize decision. Resolve conflicts using hierarchy: Safety > Budget > Growth. Calculate confidence score. Return 4-6 KPIs and Comparative Data.");
        try { return JSON.parse(res); } catch { return { executive_summary: [res], overall_confidence: 50 }; }
    }
}


class SpecializedAgent extends BaseAgent {
    async execute(task, context) {
        const TIMEOUT_MS = 3000; // 3 Second limit per agent

        const fetchPromise = (async () => {
            const prompt = `Task: ${task}. Context: ${JSON.stringify(context)}. Return JSON: {thought, analysis, data, recommendation, confidence}`;
            const res = await this.llmProvider.generate(prompt, `You are ${this.name}. Think critically. Return confidence (0-100).`);
            try { return JSON.parse(res); } catch { return { analysis: res, confidence: 50 }; }
        })();

        const timeoutPromise = new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    thought: "Computation limit exceeded. Reverting to failsafe...",
                    analysis: "Agent execution timed out. Using cached heuristic data.",
                    data: { "Status": "TIMEOUT", "Confidence": "Low" },
                    recommendation: "Proceed with caution (Fallback Mode)",
                    confidence: 10
                });
            }, TIMEOUT_MS);
        });

        // Parallel Race: Whichever finishes first wins
        return Promise.race([fetchPromise, timeoutPromise]);
    }
}

/* =========================================
   4. ORCHESTRATOR
   ========================================= */
class Orchestrator {
    constructor(apiKey) {
        this.provider = apiKey ? new GeminiProvider(apiKey) : new MockProvider();
        this.memory = new Memory();
        this.manager = new ManagerAgent(this.provider);
        this.agents = new Map([
            ['finance', new SpecializedAgent('finance', 'Saturn Finance', 'CFO', '#10b981', this.provider)],
            ['ops', new SpecializedAgent('ops', 'Jupiter Ops', 'COO', '#8b5cf6', this.provider)],
            ['market', new SpecializedAgent('market', 'Mars Strategy', 'CMO', '#f59e0b', this.provider)],
            ['hr', new SpecializedAgent('hr', 'Venus People', 'CHRO', '#ec4899', this.provider)]
        ]);
    }

    // Events
    onDecompose() { }
    onThink() { }
    onResult() { }
    onFinal() { }
    onStatus() { }

    async process(problem) {
        if (this.onStatus) this.onStatus(`[SYSTEM] Initializing analysis protocol...`);
        const tasks = await this.manager.decompose(problem);

        if (this.onDecompose) this.onDecompose(tasks);
        if (this.onStatus) this.onStatus(`[MANAGER] Problem decomposed into ${tasks.length} sub-routines.`);

        const promises = tasks.map(async t => {
            const agent = this.agents.get(t.agentId);
            if (!agent) return null;

            if (this.onStatus) this.onStatus(`[PROVISIONING] Spawning ${t.agentId.toUpperCase()} Agent...`);
            if (this.onThink) this.onThink(t.agentId, "Processing neural pathways...");

            const res = await agent.execute(t.task, this.memory.getAllContext());

            if (this.onResult) this.onResult(t.agentId, res);
            if (this.onStatus) this.onStatus(`[${t.agentId.toUpperCase()}] Analysis complete.`);

            return res;
        });

        const results = await Promise.all(promises);

        if (this.onStatus) this.onStatus(`[MANAGER] Aggregating intelligence layers...`);
        const final = await this.manager.synthesize(problem, results);

        if (this.onFinal) this.onFinal(final);
        if (this.onStatus) this.onStatus(`[SYSTEM] Strategic consensus ready.`);
    }
}

/* =========================================
   5. UI: DASHBOARD (Gamified)
   ========================================= */
class Dashboard {
    constructor(container) {
        this.container = container;
        this.colors = { finance: '#00f3ff', ops: '#bc13fe', market: '#ff003c', hr: '#f59e0b', manager: '#ffffff' };
        this.renderHistoryButton();
        this.renderSettingsButton();
        window.dash = this; // Expose for feedback callback
    }

    renderHistoryButton() {
        // ... existing history code (implied) ...
        const btn = document.createElement('button');
        btn.innerText = 'ACCESS_LOGS';
        btn.className = 'cyber-btn history-btn';
        btn.style.position = 'fixed';
        btn.style.top = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = '1000';
        btn.onclick = () => this.showHistory();
        document.body.appendChild(btn);
    }

    renderSettingsButton() {
        const btn = document.createElement('button');
        btn.innerText = 'NEURAL_CONFIG';
        btn.className = 'cyber-btn settings-btn';
        btn.style.position = 'fixed';
        btn.style.top = '20px';
        btn.style.right = '180px'; // To the left of History
        btn.style.zIndex = '1000';
        btn.onclick = () => this.showSettings();
        document.body.appendChild(btn);
    }

    showSettings() {
        const modal = document.getElementById('final-decision');
        const content = modal.querySelector('.decision-content');
        const weights = JSON.parse(localStorage.getItem('coo_agent_weights') || '{"finance":1, "ops":1, "market":1, "hr":1}');

        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';

        let html = `<div class="report-section"><h3>NEURAL_BIAS_CONFIGURATION</h3>
        <p style="color:#aaa; font-size:0.8rem; margin-bottom:20px;">ADJUST AGENT INFLUENCE WEIGHTS (0.1 - 3.0)</p>`;

        Object.keys(weights).forEach(agent => {
            html += `<div class="bias-control">
                <div class="bias-label" style="color:${this.colors[agent] || '#fff'}">${agent.toUpperCase()}</div>
                <input type="range" min="0.1" max="3.0" step="0.1" value="${weights[agent]}" 
                    oninput="document.getElementById('val-${agent}').innerText = this.value; window.updateWeight('${agent}', this.value)">
                <div class="bias-val" id="val-${agent}">${weights[agent]}</div>
            </div>`;
        });

        html += `</div>`;
        html += `<button class="cyber-btn" onclick="document.getElementById('final-decision').style.display='none'" style="margin-top:20px; width:100%">SAVE CONFIG</button>`;

        content.innerHTML = html;

        // Handler
        window.updateWeight = (agent, val) => {
            const w = JSON.parse(localStorage.getItem('coo_agent_weights') || '{}');
            w[agent] = parseFloat(val);
            localStorage.setItem('coo_agent_weights', JSON.stringify(w));
        };
    }

    saveDecision(problem, report) {
        const history = JSON.parse(localStorage.getItem('coo_history') || '[]');
        const entry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            query: problem,
            report: report
        };
        history.unshift(entry); // Add to top
        localStorage.setItem('coo_history', JSON.stringify(history.slice(0, 50))); // Keep last 50
    }

    showHistory() {
        const history = JSON.parse(localStorage.getItem('coo_history') || '[]');
        const modal = document.getElementById('final-decision');
        const content = modal.querySelector('.decision-content');

        modal.style.display = 'flex'; // Use same modal
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';

        let html = `<div class="report-section"><h3>DECISION_AUDIT_TRAIL</h3>`;
        if (history.length === 0) {
            html += `<div style="color:#888; padding:20px;">NO RECORDS FOUND IN NEURAL STORAGE.</div>`;
        } else {
            history.forEach(h => {
                html += `<div class="history-item" onclick="window.loadDecision(${h.id})">
                    <div class="hist-time">${h.timestamp}</div>
                    <div class="hist-query">"${h.query}"</div>
                    <div class="hist-sum">${h.report.overall_confidence ? 'Confidence: ' + h.report.overall_confidence + '%' : 'Audit Logged'}</div>
                </div>`;
            });
        }
        html += `</div>`;
        html += `<button class="cyber-btn" onclick="document.getElementById('final-decision').style.display='none'" style="margin-top:20px; width:100%">CLOSE LOGS</button>`;

        content.innerHTML = html;

        // Expose loader to window for the onclick handler
        window.loadDecision = (id) => {
            const record = history.find(r => r.id === id);
            if (record) this.showDecision(record.report, true); // true = replay mode
        };
    }

    render(problem) {
        this.container.innerHTML = `
            <div class="hud-container">
                <!-- LEft Panel: Mission Data -->
                <div class="hud-panel left-panel">
                    <div class="hud-header">MISSION OBJECTIVE <span class="blink">_</span></div>
                    <div class="mission-box">
                        <div class="mission-text">"${problem}"</div>
                    </div>
                    <div class="hud-header mt-4">OPERATION LOG</div>
                    <div id="task-list" class="terminal-feed">
                        <div class="scanline"></div>
                        <div class="loading-text">WAITING FOR CORE COMMAND...</div>
                    </div>
                </div>

                <!-- Center Panel: Active Agent Visualization -->
                <div class="hud-panel center-panel">
                     <div class="hex-grid-bg"></div>
                     <div id="vis-stage" class="vis-stage">
                        <div class="core-brain pulsing">CORE</div>
                     </div>
                </div>

                <!-- Right Panel: Intelligence Feed -->
                <div class="hud-panel right-panel">
                    <div class="hud-header">INTELLIGENCE STREAM</div>
                    <div id="insight-feed" class="insight-stream"></div>
                    <div id="final-decision" class="decision-modal hidden">
                        <div class="decision-title">STRATEGIC CONSENSUS</div>
                        <div class="decision-content"></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTasks(tasks) {
        // No-op for tasks list now, we use the log stream instead
    }

    addLog(msg) {
        const el = document.getElementById('task-list');
        const row = document.createElement('div');
        row.className = 'term-row type-effect';
        // Add timestamp
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
        row.innerHTML = `<span style="color:#555">[${time}]</span> ${msg}`;
        el.appendChild(row);
        el.scrollTop = el.scrollHeight;
    }


    addThinking(id, msg) {
        const stage = document.getElementById('vis-stage');
        // Check if already exists to avoid dupes in fast path
        if (document.getElementById(`think-${id}`)) return;

        const card = document.createElement('div');
        card.id = `think-${id}`;
        card.className = 'agent-avatar-lg pulsing';
        card.style.borderColor = this.colors[id];
        card.style.margin = '0 10px';
        card.innerHTML = `
            <div class="agent-icon" style="background:${this.colors[id]}"></div>
            <div class="agent-name">${id.toUpperCase()}</div>
            <div class="agent-status">PROCESSING...</div>
        `;
        stage.appendChild(card);
    }

    removeThinking(id) {
        const el = document.getElementById(`think-${id}`);
        if (el) el.remove();
    }

    addResult(id, res) {
        this.removeThinking(id); // Clear thinking state when done
        const feed = document.getElementById('insight-feed');

        let html = '';
        if (typeof res === 'object') {
            html += `<div class="data-block">`;
            if (res.data) {
                for (let [k, v] of Object.entries(res.data)) {
                    html += `<div class="data-line"><span class="lbl">${k}</span><span class="val">${v}</span></div>`;
                }
            }
            html += `</div>`;
            html += `<div class="analysis-text">"${res.analysis || res.recommendation}"</div>`;
            if (res.confidence) {
                html += `<div class="confidence-score">Confidence: ${res.confidence}%</div>`;
            }
        } else {
            html = res;
        }

        const card = document.createElement('div');
        card.className = 'hud-card slide-in-right';
        card.style.borderLeftColor = this.colors[id];
        card.innerHTML = `
            <div class="card-header" style="color:${this.colors[id]}">${id.toUpperCase()} // REPORT</div>
            ${html}
        `;
        feed.appendChild(card);
        feed.scrollTop = feed.scrollHeight;
    }

    showDecision(d) {
        const modal = document.getElementById('final-decision');
        const content = modal.querySelector('.decision-content');

        // Parse if string
        let report = d;
        if (typeof d === 'string') {
            try { report = JSON.parse(d); } catch { report = { executive_summary: [d] }; }
        }

        let html = '';

        // 0. Confidence Score
        if (report.overall_confidence) {
            const score = report.overall_confidence;
            let color = '#10b981'; // green
            if (score < 80) color = '#f59e0b'; // orange
            if (score < 60) color = '#ef4444'; // red

            html += `<div class="confidence-bar">
                <span class="conf-label">STRATEGIC CONFIDENCE:</span>
                <div class="conf-track"><div class="conf-fill" style="width:${score}%; background:${color}"></div></div>
                <span class="conf-val" style="color:${color}">${score}%</span>
            </div>`;
        }

        // 1. Executive Summary
        if (report.executive_summary) {
            html += `<div class="report-section"><h3>EXEC_SUMMARY</h3><ul>`;
            report.executive_summary.forEach(i => html += `<li>${i}</li>`);
            html += `</ul></div>`;
        }

        // 2. Department Insights
        if (report.department_insights) {
            html += `<div class="report-section"><h3>DEPT_INSIGHTS</h3><div class="grid-2">`;
            for (const [k, v] of Object.entries(report.department_insights)) {
                html += `<div><strong style="color:var(--neon-cyan)">${k}:</strong> ${v}</div>`;
            }
            html += `</div></div>`;
        }

        // 3. Risks
        if (report.risks_constraints) {
            html += `<div class="report-section"><h3>RISK_MATRIX</h3><ul>`;
            report.risks_constraints.forEach(i => html += `<li style="color:#ff4444">${i}</li>`);
            html += `</ul></div>`;
        }

        // 4. Action Plan
        if (report.recommended_action_plan) {
            const actions = report.recommended_action_plan;
            html += `<div class="report-section"><h3>ACTION_PROTOCOL</h3>
                <div class="action-box"><strong>IMMEDIATE:</strong> ${actions.Short_Term || actions.short_term}</div>
                <div class="action-box mt-2"><strong>LONG_TERM:</strong> ${actions.Long_Term || actions.long_term}</div>
            </div>`;
        }

        // 5. KPIs
        if (report.kpis_to_monitor) {
            html += `<div class="report-section"><h3>KPI_WATCHLIST</h3><div class="kpi-grid">`;
            report.kpis_to_monitor.forEach(k => {
                if (typeof k === 'object' && k !== null) {
                    // Rich object schema
                    html += `<div class="kpi-card">
                        <div class="kpi-name">${k.name}</div>
                        <div class="kpi-target">${k.target || ''}</div>
                        <div class="kpi-desc">${k.rationale || ''}</div>
                    </div>`;
                } else {
                    // Legacy string fallback
                    html += `<div class="kpi-card"><div class="kpi-name">${k}</div></div>`;
                }
            });
            html += `</div></div>`;
        }

        // 6. Plain Language Explanation
        if (report.plain_language_explanation) {
            const ple = report.plain_language_explanation;
            html += `<div class="report-section" style="border-top: 1px solid var(--neon-cyan); margin-top: 20px; padding-top: 20px;">
                <h3 style="color: #fff; text-align: center; margin-bottom: 15px;">PLAIN ENGLISH SUMMARY</h3>
                <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px;">
                    <div style="margin-bottom: 10px;">
                        <strong style="color: var(--neon-cyan)">WHAT WE FOUND:</strong>
                        <p style="margin: 5px 0 0; color: #eee;">${ple.findings}</p>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong style="color: var(--neon-cyan)">WHY IT'S HAPPENING:</strong>
                        <p style="margin: 5px 0 0; color: #eee;">${ple.root_cause}</p>
                    </div>
                    <div>
                        <strong style="color: var(--neon-cyan)">WHAT TO DO:</strong>
                        <p style="margin: 5px 0 0; color: #eee;">${ple.meaning || ple.recommendation_summary}</p>
                    </div>
                </div>
            </div>`;
        }

        content.innerHTML = html || JSON.stringify(report);
        modal.classList.remove('hidden');
        modal.classList.add('flicker-in');
    }
}

/* =========================================
   7. VISUAL EFFECTS
   ========================================= */
function initAtmosphere() {
    // 0. Create Jarvis Holographic Core
    if (!document.querySelector('.jarvis-container')) {
        const hud = document.createElement('div');
        hud.className = 'jarvis-container';
        hud.innerHTML = `
            <div class="jarvis-ring ring-1"></div>
            <div class="jarvis-ring ring-2"></div>
            <div class="jarvis-ring ring-3"></div>
            <div class="core-light"></div>
        `;
        document.body.appendChild(hud);

        // Add Floating Widgets
        const widgets = [
            { cls: 'widget-tl', html: 'CPU_LOAD: 34%<br>MEM_ALLOC: 12GB<br>NET_LATENCY: 12ms' },
            { cls: 'widget-tr', html: 'SECURE_LINK: ACTIVE<br>ENCRYPTION: AES-256<br>NODE_STATUS: ONLINE' },
            { cls: 'widget-bl', html: 'AGENT_SYNC: 98%<br>QUEUE_DEPTH: 0<br>ERROR_RATE: 0.001%' },
            { cls: 'widget-br', html: 'GEO_LOC: UNKNOWN<br>TIME_ZONE: UTC+0<br>UPTIME: 423h 12m' }
        ];

        widgets.forEach(w => {
            const el = document.createElement('div');
            el.className = `hud-widget ${w.cls}`;
            el.innerHTML = w.html;
            document.body.appendChild(el);
        });
    }

    // 1. Create Dust Layer
    if (!document.querySelector('.holo-dust')) {
        const dust = document.createElement('div');
        dust.className = 'holo-dust';
        document.body.appendChild(dust);
    }

    // 2. Start Target Spawner Loop
    setInterval(() => {
        const target = document.createElement('div');
        target.className = 'tech-target';

        // Random Position (mostly focused on center/bottom where robots are)
        const x = Math.random() * 80 + 10; // 10% to 90% width
        const y = Math.random() * 60 + 20; // 20% to 80% height

        target.style.left = x + '%';
        target.style.top = y + '%';

        document.body.appendChild(target);

        // Remove after animation (4s)
        setTimeout(() => {
            target.remove();
        }, 4000);
    }, 2500);
}

/* =========================================
   6. APP ENTRY
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const input = document.getElementById('business-problem-input');
    const keyInput = document.getElementById('api-key-input');
    const container = document.getElementById('main-container');

    // Intro Animation
    setTimeout(() => {
        document.querySelector('.hero-section').classList.add('fade-in-up');
    }, 500);

    // Init Visual Atmosphere
    initAtmosphere();

    const run = async () => {
        const prob = input.value.trim();
        if (!prob) return;

        // Save key
        if (keyInput.value) localStorage.setItem('gemini_key', keyInput.value);

        // UI Transition
        container.innerHTML = '';
        const dash = new Dashboard(container);
        dash.render(prob);

        // Logic
        const orch = new Orchestrator(keyInput.value);
        orch.onDecompose = (t) => { }; // We log instead
        orch.onThink = (id, m) => dash.addThinking(id, m);
        orch.onResult = (id, r) => dash.addResult(id, r);
        orch.onFinal = (d) => dash.showDecision(d);
        orch.onStatus = (msg) => dash.addLog(msg);

        try {
            await orch.process(prob);
        } catch (e) {
            console.error(e);
            dash.showDecision("SYSTEM ERROR: " + e.message);
        }
    };

    if (startBtn) startBtn.addEventListener('click', run);
    if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') run(); });

    // Restore key
    const saved = localStorage.getItem('gemini_key');
    if (saved) keyInput.value = saved;
});
