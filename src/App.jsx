import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import StreamingText from './StreamingText';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false; 
    recognition.lang = 'ru-RU';     
}

function App() {
    const [prompt, setPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        const userMessage = { role: 'user', content: prompt };
        setChatHistory(prev => [...prev, userMessage]);

        const currentPrompt = prompt;
        setPrompt('');
        setIsLoading(true);

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const res = await axios.post(`${API_URL}/api/chat`, { message: currentPrompt });
            const aiMessage = { role: 'ai', content: res.data.response };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error fetching AI response:', error);
            const errorMessage = { role: 'ai', content: 'Извините, произошла ошибка при получении ответа.' };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceInput = () => {
        if (!recognition || isLoading) return;
        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }

        setPrompt('');
        recognition.start();
        
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => setPrompt(event.results[0][0].transcript);
        recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
        recognition.onend = () => setIsListening(false);
    };

    const welcomeContainerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } }
    };

    const welcomeItemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <div className="app-container">
            <AnimatePresence>
                {chatHistory.length === 0 ? (
                    <motion.div
                        className="welcome-screen"
                        key="welcome"
                        variants={welcomeContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                        <div>
                            <motion.h1 variants={welcomeItemVariants}>Ask me anything</motion.h1>
                            <motion.p variants={welcomeItemVariants}>I can help you write, code, plan, and much more.</motion.p>
                        </div>
                        
                        <motion.div className="creator-info" variants={welcomeItemVariants}>
                            <span>Powered by <strong>Alimkhan Slambek</strong></span>
                            <br></br>
                            <span>© 2025. Copyright reserved</span>
                        </motion.div>

                    </motion.div>
                ) : (
                    <div className="chat-container">
                        {chatHistory.map((msg, index) => (
                            <motion.div
                                key={index}
                                className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
                                variants={messageVariants}
                                initial="hidden"
                                animate="visible"
                                layout
                            >
                                {msg.role === 'ai' && index === chatHistory.length - 1 && !isLoading
                                    ? <StreamingText text={msg.content} />
                                    : <ReactMarkdown>{msg.content}</ReactMarkdown>
                                }
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div className="loader-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <span className="loader-dot"></span><span className="loader-dot"></span><span className="loader-dot"></span>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </AnimatePresence>

            <footer className="footer">
                <form className={`input-area ${isListening ? 'listening' : ''}`} onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className={`icon-button mic-button ${isListening ? 'listening' : ''}`}
                        onClick={handleVoiceInput}
                        disabled={isLoading}
                    >
                        <svg fill="currentColor" height="24px" width="24px" viewBox="0 0 512 512">
                           <path d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z"></path>
                           <path d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z"></path>
                        </svg>
                    </button>
                    <input
                        type="text"
                        className="text-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={isListening ? "Говорите..." : "Спросите о чем угодно..."}
                        disabled={isLoading}
                    />
                    <button type="submit" className="icon-button submit-button" disabled={isLoading || !prompt.trim()}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default App;