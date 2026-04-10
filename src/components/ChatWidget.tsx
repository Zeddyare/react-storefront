import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import '../styles/ChatWidget.css';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

function generateId(): string {
    return crypto.randomUUID();
}

export default function ChatWidget() {
    const [open, setOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: 'Greetings, traveler. Ask me about relics, prices, or recommendations.' },
    ]);
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const conversationId = useRef<string>(generateId());
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (): Promise<void> => {
        const trimmed = input.trim();
        if (!trimmed || loading) {
            return;
        }

        setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
        setInput('');
        setLoading(true);

        try {
            const reply = await api.chat(trimmed, conversationId.current);
            setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: 'My scrying fizzled. Try your question again in a moment.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="chat-widget-shell">
            {open && (
                <section className="chat-card arcane-card" aria-label="AI shop assistant">
                    <header className="chat-header">
                        <span className="chat-orb" aria-hidden="true" />
                        <div>
                            <div className="chat-title">Oracle of Wares</div>
                            <div className="chat-subtitle">Bound to the catalogue</div>
                        </div>
                        <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close assistant">
                            x
                        </button>
                    </header>

                    <div className="chat-log">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                                <div className={`chat-bubble ${msg.role}`}>{msg.text}</div>
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-row assistant">
                                <div className="chat-bubble assistant thinking">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <footer className="chat-input-row">
                        <input
                            autoFocus
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about magic items..."
                            disabled={loading}
                        />
                        <button className="btn-arcane" onClick={sendMessage} disabled={loading || !input.trim()}>
                            Send
                        </button>
                    </footer>
                </section>
            )}

            <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Toggle assistant">
                {open ? 'Close' : 'Ask Oracle'}
            </button>
        </div>
    );
}