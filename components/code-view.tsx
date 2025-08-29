// import "prismjs/plugins/line-numbers/prism-line-numbers.js";
// import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import './code-theme.css'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-go'
import { useEffect } from 'react'

export function CodeView({ code, lang }: { code: string; lang: string }) {
  useEffect(() => {
    Prism.highlightAll()
  }, [code])

  // Normalize language - extract file extension and map to supported languages
  const normalizedLang = lang.includes('.') 
    ? lang.split('.').pop() || '' 
    : lang;
  
  // Map common languages to Prism supported languages
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx', 
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'go': 'go',
    'vue': 'javascript', // Vue files are mostly JavaScript
    'html': 'html',
    'css': 'css'
  };
  
  const prismLang = languageMap[normalizedLang.toLowerCase()] || 'javascript';

  return (
    <pre
      className="p-4 pt-2"
      style={{
        fontSize: 12,
        backgroundColor: 'transparent',
        borderRadius: 0,
        margin: 0,
      }}
    >
      <code className={`language-${prismLang}`}>{code}</code>
    </pre>
  )
}
