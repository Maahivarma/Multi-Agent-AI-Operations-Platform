export class Memory {
    constructor() {
        this.sharedContext = new Map(); // Shared facts/decisions
        this.trace = []; // Log of all actions/thoughts order
    }

    addToTrace(agentId, action, content) {
        const entry = {
            timestamp: new Date(),
            agentId,
            action, // 'think', 'plan', 'result'
            content
        };
        this.trace.push(entry);
        console.log(`[Memory] ${agentId}::${action}`, content);
        return entry;
    }

    setContext(key, value) {
        this.sharedContext.set(key, value);
    }

    getContext(key) {
        return this.sharedContext.get(key);
    }

    getAllContext() {
        return Object.fromEntries(this.sharedContext);
    }

    // Determine what context is relevant for a specific agent/task
    getRelevantContext(taskType) {
        // For now, return everything. 
        // In a complex system, this would filter based on embeddings/tags.
        return this.getAllContext();
    }
}
