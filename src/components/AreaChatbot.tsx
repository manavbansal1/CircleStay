"use client"

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { Button } from './Button';
import styles from './AreaChatbot.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AreaChatbotProps {
    address: string;
    areaContext?: string;
}

export function AreaChatbot({ address, areaContext }: AreaChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hi! I'm your local area assistant for ${address}. Ask me anything about the neighborhood, amenities, transportation, or what it's like to live here!`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await fetch('/api/area-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    address: address,
                    context: areaContext
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || "I couldn't get a response. Please try again."
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        "What restaurants are nearby?",
        "How's the public transportation?",
        "Is this area safe?",
        "What's there to do around here?"
    ];

    return (
        <div className={styles.container}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className={styles.openButton}
                    aria-label="Open area chat"
                >
                    <Bot className="h-6 w-6" />
                    <span>Ask about this area</span>
                </button>
            ) : (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <Bot className="h-5 w-5" style={{ color: 'hsl(25, 70%, 50%)' }} />
                            <span className={styles.headerTitle}>Area Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={styles.closeButton}
                            aria-label="Close chat"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className={styles.messages}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={message.role === 'user' ? styles.userMessage : styles.assistantMessage}
                            >
                                <div className={styles.messageIcon}>
                                    {message.role === 'user' ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                <div className={styles.messageContent}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={styles.assistantMessage}>
                                <div className={styles.messageIcon}>
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className={styles.messageContent}>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && (
                        <div className={styles.suggestions}>
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInput(question)}
                                    className={styles.suggestion}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the area..."
                            className={styles.input}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || loading}
                            size="sm"
                            className={styles.sendButton}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}
