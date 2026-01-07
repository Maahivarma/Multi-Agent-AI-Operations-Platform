export class LLMProvider {
    async generate(prompt, systemPrompt = "") {
        throw new Error("generate() must be implemented by subclass");
    }
}

export class MockProvider extends LLMProvider {
    async generate(prompt, systemPrompt = "") {
        console.log(`[MockProvider] System: ${systemPrompt.slice(0, 50)}...`);
        console.log(`[MockProvider] Prompt: ${prompt.slice(0, 50)}...`);

        // Simulate thinking time - Increased for better visual demo
        await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));

        // Detect type of request based on prompt keywords to return plausible mock data
        if (systemPrompt.includes('Manager Agent')) {
            // Task Decomposition Mock
            return JSON.stringify([
                {
                    agentId: 'finance',
                    task: 'Analyze implementation costs of the proposed solution.',
                    priority: 'high'
                },
                {
                    agentId: 'ops',
                    task: 'Assess operational bottlenecks and workflow impact.',
                    priority: 'high'
                },
                {
                    agentId: 'market',
                    task: 'Evaluate market demand and competitive positioning.',
                    priority: 'medium'
                }
            ]);
        } else if (systemPrompt.includes('Finance Agent')) {
            return JSON.stringify({
                thought: "I need to check our current budget allocation for Q3 and estimate the ROI of this new initiative.",
                analysis: "Budget surplus in Q3 allows for a $50k pilot. Estimated ROI is 12% within 6 months.",
                recommendation: "Proceed with pilot phase.",
                data: { estimatedCost: 50000, roi: "12%", timeline: "6 months" }
            });
        } else if (systemPrompt.includes('Ops Agent')) {
            return JSON.stringify({
                thought: "Checking current resource utilization and potential friction points in the supply chain.",
                analysis: "Current logistics team is at 95% capacity. Adding this workflow will require automation or 2 new hires.",
                recommendation: "Implement automation tools before full rollout.",
                data: { teamCapacity: "95%", risk: "High", mitigation: "Automation" }
            });
        }

        // Default generic mock
        return "Thinking complete. Proceeding with standard analysis.";
    }
}

export class GeminiProvider extends LLMProvider {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    }

    async generate(prompt, systemPrompt = "") {
        if (!this.apiKey) throw new Error("API Key required for GeminiProvider");

        // Simple prompt construction (no chat history for single-shot tasks for now)
        const fullPrompt = `System: ${systemPrompt}\n\nUser: ${prompt}\n\nPlease output ONLY JSON where applicable.`;

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }]
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("Gemini API Error:", data.error);
                throw new Error(data.error.message || "Gemini API Error");
            }

            const text = data.candidates[0].content.parts[0].text;
            // Clean up markdown code blocks if present
            return text.replace(/```json/g, '').replace(/```/g, '').trim();

        } catch (error) {
            console.error("LLM Request Failed:", error);
            return JSON.stringify({ error: "Failed to generate insight." });
        }
    }
}
