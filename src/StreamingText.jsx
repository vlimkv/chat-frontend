import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function useTypingEffect(text, duration) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) return;
    
    setDisplayedText(''); 
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, duration / text.length);

    return () => clearInterval(intervalId);
  }, [text, duration]);

  return displayedText;
}

function StreamingText({ text }) {
  const typedText = useTypingEffect(text, 1500); 

  return <ReactMarkdown>{typedText}</ReactMarkdown>;
}

export default StreamingText;