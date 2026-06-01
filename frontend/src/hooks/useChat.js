import { useState, useCallback, useRef } from 'react';
import api from '../api/axios';

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    // Add user message immediately (optimistic)
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/chat/message', {
        message: content.trim(),
        sessionId,
      });

      if (res.data.success) {
        // Save session ID
        if (!sessionId) setSessionId(res.data.data.sessionId);

        // Add assistant response
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: res.data.data.message,
          timestamp: new Date(res.data.data.timestamp),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'Failed to get response. Please try again.';
      setError(errMsg);

      // Add error message in chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `I apologize, I'm having trouble connecting right now. Please try again in a moment.`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  return { messages, isLoading, error, sessionId, sendMessage, clearChat };
};

export default useChat;
