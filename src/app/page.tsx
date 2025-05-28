'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isSent: boolean;
}

export default function Home() {
  const { isConnected, messages: socketMessages, sendMessage } = useSocket();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newMessages = socketMessages.map(msg => {
      if (typeof msg === 'string') {
        return { id: uuidv4(), text: msg, timestamp: new Date(), isSent: false };
      }
      return { ...msg, id: msg.id || uuidv4(), isSent: false };
    });

    setMessages(prevMessages => {
      const uniqueNewMessages = newMessages.filter(
        newMsg => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id)
      );
      return [...prevMessages, ...uniqueNewMessages];
    });
  }, [socketMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = { id: uuidv4(), text: inputMessage, timestamp: new Date(), isSent: true };
      sendMessage(JSON.stringify(newMessage));
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">WebSocket Broadcast Demo</h1>
        <div className={`mb-4 text-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <div className="mb-4 h-64 overflow-y-auto border border-gray-300 rounded p-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-2 ${msg.isSent ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.isSent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.text}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow mr-2 p-2 border border-gray-300 rounded"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={!isConnected}
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}