// app/chatbot/page.js
'use client';
import { useState } from 'react';

export default function Chatbot() {
    const [input, setInput] = useState('');
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSendMessage = async () => {
        if (!input.trim()) return; // Prevent sending empty messages

        // Update the conversation with the user's message
        setConversation((prev) => [...prev, { text: input, type: 'user' }]);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: input }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate response.');
            }

            const data = await response.json();
            // Assuming the AI response is in HTML format
            setConversation((prev) => [
                ...prev,
                { text: data.story, type: 'bot', isHTML: true } // Mark this message as HTML
            ]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setInput(''); // Clear input field
        }
    };

    return (
        <div className="chatbot-container p-8 max-w-md mx-auto bg-base-500">
            <div className="conversation mb-4" style={{ height: '300px', overflowY: 'auto', padding: '10px' }}>
                {conversation.map((msg, index) => (
                    <div key={index} className={`message ${msg.type} text-black`}>
                        {msg.isHTML ? ( // Check if the message is HTML
                            <div dangerouslySetInnerHTML={{ __html: msg.text }} className="text-black text-left"></div>
                        ) : (
                            <p className={msg.type === 'user' ? 'text-blue-300 font-semibold' : 'text-green-300'}>
                                {msg.text}
                            </p>
                        )}
                    </div>
                ))}
                {loading && <p className="text-gray-200">Generating response...</p>}
                {error && <p className="text-red-400">{error}</p>}
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 border border-gray-300 rounded mb-2 text-black"
            ></textarea>
            <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Send
            </button>
        </div>
    );
}
