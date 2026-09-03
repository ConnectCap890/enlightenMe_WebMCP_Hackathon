// global.d.ts
export {}

interface RegisteredTool {
    name:        string
    description: string
    inputSchema: {
        type:        string
        properties:  Record<string, unknown>
        required?:   string[]
    }
    execute: (args: any) => Promise<unknown>
}

interface ModelContext {
    registerTool: (tool: RegisteredTool) => void
}

declare global {
    interface Document {
        modelContext: ModelContext
    }
}