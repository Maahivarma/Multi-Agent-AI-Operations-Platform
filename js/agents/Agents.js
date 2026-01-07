export class BaseAgent {
    constructor(id, name, role, color, llmProvider) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.color = color;
        this.llmProvider = llmProvider;
    }

    async think(taskDescription, context) {
        const systemPrompt = `You are the ${this.name} (${this.role}). 
        Your goal is to analyze problems from your specific domain perspective.
        
        TASK: ${taskDescription}
        
        CONTEXT: ${JSON.stringify(context)}
        
        Output your internal reasoning process before your final answer.`;

        const response = await this.llmProvider.generate(`Analyze this.`, systemPrompt);
        return response; // Expecting raw string or JSON depending on prompt engineering
    }
}

export class ManagerAgent extends BaseAgent {
    constructor(llmProvider) {
        super('manager', 'Manager Agent', 'Orchestrator', '#333333', llmProvider);
    }

    async decompose(userInput) {
        const systemPrompt = `You are the Manager Agent (Brain).
        Your job is to break down a complex user business problem into sub-tasks for specialized agents.
        
        Available Agents:
        - id: 'finance', role: 'Analyze costs, revenue, ROI'
        - id: 'ops', role: 'Analyze logistics, workflows, efficiency'
        - id: 'sales', role: 'Analyze market, customers, sales data'
        - id: 'market', role: 'Analyze trends, competition, risks'
        - id: 'hr', role: 'Analyze team, hiring, culture'

        Output ONLY a JSON array of tasks. Format:
        [
            { "agentId": "finance", "task": "...", "priority": "high" }
        ]
        `;

        const raw = await this.llmProvider.generate(userInput, systemPrompt);
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse decomposition:", raw);
            return []; // Fallback empty
        }
    }

    async synthesize(originalProblem, agentResults) {
        const systemPrompt = `You are the Manager Agent.
        Synthesize the detailed reports from your team into a final actionable business decision.
        
        Original Problem: ${originalProblem}
        
        Team Reports:
        ${JSON.stringify(agentResults)}
        
        Output a concise executive summary and a final RECOMMENDATION.`;

        return await this.llmProvider.generate("Synthesize final decision.", systemPrompt);
    }
}

export class SpecializedAgent extends BaseAgent {
    constructor(config, llmProvider) {
        super(config.id, config.name, config.role, config.color, llmProvider);
    }

    async execute(task, globalContext) {
        const systemPrompt = `You are the ${this.name} (${this.role}).
        
        Your Task: ${task}
        
        Global Context: ${JSON.stringify(globalContext)}
        
        Think step-by-step.
        Return your response in JSON format:
        {
            "thought": "Internal monologue about how you are approaching this...",
            "analysis": "Your main findings...",
            "data": { ...key metrics... },
            "recommendation": "Your specific advice"
        }
        `;

        const raw = await this.llmProvider.generate("Execute task.", systemPrompt);
        try {
            return JSON.parse(raw);
        } catch (e) {
            // Fallback for mock/simple string returns
            return {
                thought: "Processing data...",
                analysis: raw,
                recommendation: "Review output."
            };
        }
    }
}
