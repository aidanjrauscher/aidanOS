import React, { useState, useEffect, useRef } from 'react';
import { handleCommand } from './util/terminalCommands';
import './App.css'

export default function App(){
  const initialOutput = ["Welcome to AidanOS v1.0", "Type \"help\" for available commands."];
  const [input, setInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [output, setOutput] = useState([...initialOutput]);
  const [discoMode, setDiscoMode] = useState(false);
  const [discoStartTime, setDiscoStartTime] = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  //TODO:
  // adjust layout of help response (maybe columns) so it's more responsive

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        window.scrollTo(0, document.body.scrollHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    let discoTimer;
    if (discoMode) {
      setDiscoStartTime(Date.now());
      discoTimer = setInterval(() => {
        const elapsedTime = Date.now() - discoStartTime;
        if (elapsedTime >= 5000) {
          setDiscoMode(false);
          setOutput(prev => [...prev, 'Disco mode ended. Thank you for dancing.']);
          clearInterval(discoTimer);
        }
      }, 100);
    }
    return () => clearInterval(discoTimer);
  }, [discoMode, discoStartTime]);

  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      if (e.key === 'Enter' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    window.addEventListener('keypress', handleGlobalKeyPress);
    return () => window.removeEventListener('keypress', handleGlobalKeyPress);
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        const response = handleCommand(input);
        setOutput([...output, '', `C:\\Users\\visitor> ${input}`, response]);
        setCommandHistory(prev => [input, ...prev]);
        setHistoryIndex(-1);
        if (input.trim().toLowerCase() === 'disco') {
          setDiscoMode(true);
        }
        if (input.trim().toLowerCase() === 'clear') {
          setOutput([...initialOutput]);
        }
      }
      setInput('');
      setCursorPosition(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(prev => prev + 1);
        setInput(commandHistory[historyIndex + 1]);
        setTimeout(() => setCursorPosition(commandHistory[historyIndex + 1].length), 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1);
        setInput(commandHistory[historyIndex - 1]);
        setTimeout(() => setCursorPosition(commandHistory[historyIndex - 1].length), 0);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
        setCursorPosition(0);
      }
    } else {
      setCursorPosition(e.target.selectionStart);
    }
  };

  const handleTerminalClick = (e) => {
    inputRef.current.focus();
    e.preventDefault();
  };

  return (
    <div 
      className={`terminal-container ${discoMode ? 'disco-mode' : ''}`}
      onClick={handleTerminalClick}
    >
      <h1 className="terminal-header">AidanOS Terminal</h1>
      <div ref={outputRef} className="terminal-output">
        {output.map((line, index) => (
          <div key={index} className="output-line">{line}</div>
        ))}
      </div>
      <div className="input-container">
        <span className="prompt">C:\Users\visitor{'>'}</span>
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="terminal-input"
          />
          <div 
            className="cursor"
            style={{
              left: `calc(${cursorPosition * 0.6}em)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};