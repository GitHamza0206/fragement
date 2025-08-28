- Never make asumptions on the ai sdk documentation, you must factcheck in the documentation provided in claude.md or check on internet
- When using the ai sdk, you must use the latest version of the sdk 
- make sure that useChat() is used in the component direclty rather than the page.tsx file 
- when you want to create a new UI you need to use useChat() that will be the hook that makes it possible to communication between the backend and the frontend, then component pages like chat.tsx will be the ones that will be used to display the UI.  and the hook is always in the parent page (page.tsx)
- use context7mcp to fetch the latest documentation

## AI SDK addToolResult Format
**CRITICAL TRAP:** The `addToolResult` function uses the `{tool, toolCallId, output}` format, NOT the newer `{toolCallId, result}` format that appears in some documentation.

**Correct usage:**
```typescript
addToolResult({
  tool: 'tool_name',        // Must specify the tool name
  toolCallId: callId,       // The specific tool call ID  
  output: resultData,       // Use 'output', not 'result'
})
```

**Type signature:**
```typescript
addToolResult: (result: {
  tool: string;
  toolCallId: string;
  output: any;
}) => void
```

**For client-side tool components:**
- Render in `input-available` case (not `output-available`)
- Use `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` for automatic submission
- Tool results become part of conversation history and are remembered by the LLM