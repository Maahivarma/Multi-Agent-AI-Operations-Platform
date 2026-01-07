import { MockProvider, GeminiProvider } from './LLMProvider.js';
import { Memory } from './Memory.js';
import { ManagerAgent, SpecializedAgent } from '../agents/Agents.js';

export class Orchestrator {
    constructor(apiKey = null) {
        this.provider = apiKey ? new GeminiProvider(apiKey) : new MockProvider();
        this.memory = new Memory();
        this.manager = new ManagerAgent(this.provider);

        const agentConfigs = [
            { id: 'finance', name: 'Finance Agent', role: 'CFO', color: '#10b981' },
            { id: 'hr', name: 'HR Agent', role: 'CHRO', color: '#f59e0b' },
            { id: 'sales', name: 'Sales Agent', role: 'CRO', color: '#3b82f6' },
            { id: 'ops', name: 'Ops Agent', role: 'COO', color: '#8b5cf6' },
            { id: 'market', name: 'Market Agent', role: 'CMO', color: '#ec4899' }
        ];

        this.agents = new Map(
            agentConfigs.map(config => [config.id, new SpecializedAgent(config, this.provider)])
        );
    }

    // Event hooks for UI updates
    onTaskDecomposed(tasks) { }
    onAgentThinking(agentId, thought) { }
    onAgentResult(agentId, result) { }
    onFinalDecision(decision) { }

    async process(userProblem) {
        console.log("[Orchestrator] Starting process for:", userProblem);

        // 1. Manager decomposes problem
        this.memory.addToTrace('manager', 'think', 'Decomposing problem...');
        const tasks = await this.manager.decompose(userProblem);

        this.memory.addToTrace('manager', 'plan', tasks);
        if (this.onTaskDecomposed) this.onTaskDecomposed(tasks);

        // 2. Execute tasks in parallel (or sequential if dependencies existed, but parallel for now)
        const executions = tasks.map(async (task) => {
            const agent = this.agents.get(task.agentId);
            if (!agent) {
                console.warn(`No agent found for id: ${task.agentId}`);
                return null;
            }

            // Notify UI: Agent started thinking
            if (this.onAgentThinking) this.onAgentThinking(task.agentId, "Analyzing context...");

            // Execute
            const result = await agent.execute(task.task, this.memory.getAllContext());

            // Store result in memory
            this.memory.addToTrace(task.agentId, 'result', result);
            this.memory.setContext(`${task.agentId}_analysis`, result);

            // Notify UI: Agent finished
            if (this.onAgentResult) this.onAgentResult(task.agentId, result);

            return { agentId: task.agentId, ...result };
        });

        const results = await Promise.all(executions);

        // 3. Manager Synthesizes
        const validResults = results.filter(r => r !== null);
        const finalDecision = await this.manager.synthesize(userProblem, validResults);

        this.memory.addToTrace('manager', 'decision', finalDecision);
        if (this.onFinalDecision) this.onFinalDecision(finalDecision);

        return finalDecision;
    }
}
