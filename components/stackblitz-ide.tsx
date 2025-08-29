'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Code2, RefreshCw, ExternalLink } from 'lucide-react';

interface StackBlitzIDEProps {
  template: string;
  title?: string;
  content?: string;
}

const templateMapping: Record<string, { template: string; file: string }> = {
  'nextjs-developer': { 
    template: 'vite-react-ts', 
    file: 'src/App.tsx' 
  },
  'vue-developer': { 
    template: 'vite-vue-ts', 
    file: 'src/App.vue' 
  },
  'go-developer': { 
    // Go not supported, use Node.js as fallback
    template: 'node', 
    file: 'index.js' 
  },
  'gradio-developer': { 
    // Python not fully supported, use Node.js starter
    template: 'node', 
    file: 'index.js' 
  },
  'streamlit-developer': { 
    // Python not fully supported, use Node.js starter
    template: 'node', 
    file: 'index.js' 
  }
};

export const StackBlitzIDE = ({ template, title, content }: StackBlitzIDEProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // Map our templates to StackBlitz fork templates  
  const templateConfig = templateMapping[template] || {
    template: 'vite-react-ts',
    file: 'src/App.tsx'
  };
  
  const getStackBlitzUrl = () => {
    // Build proper StackBlitz fork URL with all required parameters
    const params = new URLSearchParams({
      embed: '1',
      file: templateConfig.file,
      hideNavigation: '0',
      hideDevTools: '0',
      terminalHeight: '35',
      view: 'both',
      showSidebar: 'true'
    });
    
    const url = `https://stackblitz.com/fork/${templateConfig.template}?${params.toString()}`;
    console.log('StackBlitz URL:', url);

    return url;
  };


  const refreshIframe = () => {
    setIframeKey(prev => prev + 1);
    setIsLoading(true);
  };

  const openInNewTab = () => {
    window.open(getStackBlitzUrl(), '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Code2 className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{title || 'Code Editor'}</h3>
              <p className="text-xs text-muted-foreground">StackBlitz IDE</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded-md border">
              {template}
            </span>
            <Button variant="ghost" size="sm" onClick={refreshIframe} className="h-7 px-2">
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={openInNewTab} className="h-7 px-2">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* IDE Container */}
      <div className="flex-1 relative bg-card">
        {isLoading && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading IDE...</p>
            </div>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          src={getStackBlitzUrl()}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          title="Web IDE"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-2 border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Powered by StackBlitz - Full VS Code Experience</span>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded-md border">
              Terminal Available
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded-md border">
              File System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};