/**
 * Main Application Component
 *
 * Componente principal que renderiza o widget de chat
 */

import { useState } from 'react';
import { ChatWidget } from './widgets/ChatWidget';

export function App() {
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ChatWidget
          sessionId={sessionId}
          userName="Agente N1"
          defaultTitle="Assistente de Suporte"
        />
      </div>
    </div>
  );
}