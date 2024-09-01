import React, { useState, useEffect, useRef } from 'react';
import { handleCommand } from './util/terminalCommands';
import './App.css'

export default function App(){
  const initialOutput = ["Welcome to AidanOS v1.0", "Type \"help\" for available commands."];
  const [input, setInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [output, setOutput] = useState([...initialOutput]);
  const [discoMode, setDiscoMode] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  useEffect(() => {
    let discoTimer;
    if (discoMode) {
      discoTimer = setInterval(() => {
          setDiscoMode(false);
          setOutput(prev => [...prev, 'Disco mode ended. Thank you for dancing.']);
          clearInterval(discoTimer);
      }, 5000);
    }
    return () => clearInterval(discoTimer);
  }, [discoMode]);

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
        <span>C:\Users\visitor{'>'}</span>
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
              left: `${cursorPosition * 0.6}em`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
