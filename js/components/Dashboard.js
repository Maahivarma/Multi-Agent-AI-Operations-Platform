export class Dashboard {
    constructor(container) {
        this.container = container;
        this.agentColors = {
            finance: '#10b981',
            hr: '#f59e0b',
            sales: '#3b82f6',
            ops: '#8b5cf6',
            market: '#ec4899',
            manager: '#fff'
        };
    }

    render(problem) {
        this.container.innerHTML = `
            <div class="dashboard-grid">
                <!-- Left Panel: Task Breakdown -->
                <div class="panel" id="task-panel">
                    <div class="panel-header">
                        <span>Operational Plan</span>
                        <span class="badge">Active</span>
                    </div>
                    <div class="problem-summary">
                        <h4>Objective</h4>
                        <p class="highlight">"${problem}"</p>
                    </div>
                    <div id="task-list" class="task-list">
                        <div class="loading-state">
                            <div class="spinner"></div>
                            <span>Manager Agent is decomposing the problem...</span>
                        </div>
                    </div>
                </div>

                <!-- Right Panel: Live Execution Feed -->
                <div class="panel" id="insight-panel">
                    <div class="panel-header">
                        <span>Live Agent Execution</span>
                        <div class="live-indicator"><div class="dot"></div> Processing</div>
                    </div>
                    <div id="insight-feed" class="insight-feed">
                        <!-- Insights flow in here -->
                    </div>
                    <div id="final-decision" class="final-decision hidden">
                        <div class="decision-header">
                            <i class="fas fa-check-circle"></i> Strategy Formulated
                        </div>
                        <p class="decision-text"></p>
                    </div>
                </div>
            </div>
        `;
    }

    // Called when Manager returns the breakdown
    renderTasks(tasks) {
        const list = document.getElementById('task-list');
        list.innerHTML = ''; // Clear loading

        tasks.forEach((task, index) => {
            const item = document.createElement('div');
            item.className = 'task-item slide-in';
            item.style.animationDelay = `${index * 100}ms`;
            item.style.borderLeft = `4px solid ${this.getAgentColor(task.agentId)}`;

            // Priority Badge
            const priorityClass = task.priority ? `priority-${task.priority.toLowerCase()}` : '';

            item.innerHTML = `
                <div class="task-header">
                    <span class="agent-tag" style="color: ${this.getAgentColor(task.agentId)}">
                        ${task.agentId.toUpperCase()}
                    </span>
                    <span class="task-priority ${priorityClass}">${task.priority || 'NORMAL'}</span>
                </div>
                <p>${task.task}</p>
            `;
            list.appendChild(item);
        });
    }

    // Called when an agent starts "thinking"
    addThinking(agentId, message) {
        const feed = document.getElementById('insight-feed');

        // Remove existing thinking bubbles for this agent to avoid clutter
        const existing = feed.querySelector(`.thinking-${agentId}`);
        if (existing) existing.remove();

        const bubble = document.createElement('div');
        bubble.className = `insight-card thinking thinking-${agentId} fade-in`;
        bubble.innerHTML = `
            <div class="insight-header">
                <div class="agent-avatar" style="background: ${this.getAgentColor(agentId)}">
                    <i class="fas fa-cog fa-spin"></i>
                </div>
                <span>${agentId.toUpperCase()} is thinking...</span>
            </div>
            <p class="thought-text">${message}</p>
        `;
        feed.appendChild(bubble);
        feed.scrollTop = feed.scrollHeight;
    }

    // Called when an agent returns a result
    addResult(agentId, result) {
        const feed = document.getElementById('insight-feed');

        // Remove thinking bubble
        const thinking = feed.querySelector(`.thinking-${agentId}`);
        if (thinking) thinking.remove();

        const card = document.createElement('div');
        card.className = 'insight-card fade-in';
        card.style.borderColor = this.getAgentColor(agentId, 0.3);

        let contentHtml = '';

        if (typeof result === 'object') {
            if (result.thought) {
                contentHtml += `<div class="agent-thought">"${result.thought}"</div>`;
            }
            if (result.analysis) {
                contentHtml += `<div class="agent-analysis">${result.analysis}</div>`;
            }
            if (result.data && Object.keys(result.data).length > 0) {
                contentHtml += `<div class="agent-data">`;
                for (const [k, v] of Object.entries(result.data)) {
                    contentHtml += `<div class="data-row"><span class="key">${k}</span><span class="val">${v}</span></div>`;
                }
                contentHtml += `</div>`;
            }
            if (result.recommendation) {
                contentHtml += `<div class="agent-rec"><i class="fas fa-lightbulb"></i> ${result.recommendation}</div>`;
            }
        } else {
            contentHtml = `<p>${result}</p>`;
        }

        card.innerHTML = `
            <div class="insight-header">
                <div class="agent-avatar" style="background: ${this.getAgentColor(agentId)}"></div>
                <span style="color:${this.getAgentColor(agentId)}">${agentId.toUpperCase()} AGENT</span>
            </div>
            ${contentHtml}
        `;
        feed.appendChild(card);
        feed.scrollTop = feed.scrollHeight;
    }

    showDecision(decision) {
        const box = document.getElementById('final-decision');
        const text = box.querySelector('.decision-text');

        // Handle if decision is object or string
        const decisionText = typeof decision === 'string' ? decision : (decision.recommendation || decision.analysis || JSON.stringify(decision));

        text.innerHTML = decisionText; // Allow HTML if markdown parsed (simplified here)
        box.classList.remove('hidden');
        box.classList.add('animate-pop');

        // Scroll to bottom
        const feed = document.getElementById('insight-feed');
        feed.scrollTop = feed.scrollHeight;
    }

    getAgentColor(id, opacity = 1) {
        const hex = this.agentColors[id] || '#9ca3af';
        if (opacity === 1) return hex;

        // Convert hex to rgba
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
}
