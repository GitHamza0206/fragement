import React from 'react'
import { Preview } from './components/preview'
import { UIMessage } from 'ai'

// Mock data based on your object
const mockMessages: UIMessage[] = [
  {
    id: 'mock-message-1',
    role: 'assistant',
    parts: [
      {
        type: "tool-setup_surface",
        toolCallId: "call_GgYAygp6U1ATyYmYu5fnoyKz",
        state: "output-available",
        input: {
          surface_type: "sandbox",
          title: "Go: Your First 'Hello, World!' Program",
          description: "Write and run your very first Go program, practice creating and executing Go files using an online code environment.",
          content: "// Task: Print 'Hello, World!' in Go.\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    // TODO: Print \"Hello, World!\" to the output\n}\n\n// Guidance: Use fmt.Println() inside main() to print. Replace the comment above with the correct line of code.",
          modality: "code",
          context: "A sandbox allows hands-on practice. The user can type and run a Go program and get instant feedback, which is perfect for learning syntax and basic program execution before installing locally.",
          sandboxTemplate: "nextjs-developer"
        },
        output: {
          data: {
            surface_type: "sandbox",
            title: "Go: Your First 'Hello, World!' Program",
            description: "Write and run your very first Go program, practice creating and executing Go files using an online code environment.",
            content: "// Task: Print 'Hello, World!' in Go.\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    // TODO: Print \"Hello, World!\" to the output\n}\n\n// Guidance: Use fmt.Println() inside main() to print. Replace the comment above with the correct line of code.",
            modality: "code",
            context: "A sandbox allows hands-on practice. The user can type and run a Go program and get instant feedback, which is perfect for learning syntax and basic program execution before installing locally.",
            sandboxTemplate: "nextjs-developer"
          },
          sandboxResult: {
            url: "https://example-sandbox.e2b.dev",
            sbxId: "sandbox-123",
            template: "nextjs-developer"
          }
        },
        callProviderMetadata: {
          openai: {
            itemId: "fc_68b1badb53d081a28371103d89466948099674154d1108e2"
          }
        }
      } as any
    ]
  }
]

// Mock functions
const mockSendMessage = async (message?: any) => {
  console.log('Mock sendMessage called with:', message)
  return Promise.resolve()
}

const mockAddToolResult = (result: { tool: string; toolCallId: string; output: any }) => {
  console.log('Mock addToolResult called with:', result)
}

// Test component
export const TestPreview = () => {
  return (
    <div className="h-screen w-full">
      <Preview
        messages={mockMessages}
        status="idle"
        sendMessage={mockSendMessage}
        addToolResult={mockAddToolResult}
        teamID="test-team-123"
        accessToken="test-access-token"
      />
    </div>
  )
}

export default TestPreview