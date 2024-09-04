import React from 'react';
import commands from './commands'; 

const socialProfiles = {
    twitter: 'https://twitter.com/aidanjrauscher',
    github: 'https://github.com/aidanjrauscher',
    linkedin: 'https://www.linkedin.com/in/aidanjrauscher',
    google: 'https://www.google.com'
  };
  
  const handleCdCommand = (destination) => {
    if (!destination) {
      return <p>Usage: cd &lt;website&gt;. Available websites: github, linkedin, twitter</p>;
    }
  
    if (destination === "..") {
      destination = "google";
    }
  
    if (socialProfiles[destination]) {
      window.open(socialProfiles[destination], '_blank', 'noopener,noreferrer');
      return <p>Navigating to {destination}...</p>;
    } else {
      return <p>Unknown website: {destination}. Available websites: twitter, github, linkedin</p>;
    }
  };

  const handleResumeCommand = () => {
    const pathToPDF = "./resume.pdf"; 
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if(!isMobile)
    {
      let pdfLink = document.createElement("a");
      pdfLink.href = pathToPDF;
      pdfLink.target = "_blank";
      pdfLink.download = "AidanRauscher.pdf";
      pdfLink.click();
    }

    window.open(pathToPDF, '_blank', 'noopener,noreferrer');


    return <p>Downloaded Aidan's resume.</p>;
};

const HelpDetails = () => (
  <div style={{width: '100%'}}>
    <p>Available commands:</p>
    <div className="command-grid">
      {Object.entries(commands).map(([key,value], index) => (
        <div key={index} className="command-item">
          <span className="command-name">{key}</span>
          <span className="command-description">{value}</span>
        </div>
      ))}
    </div>
  </div>
);
  
  export const handleCommand = (input) => {
    const [command, ...args] = input.trim().toLowerCase().split(' ');
  
    switch (command) {
      case 'help':
        return { type: 'react', content: <HelpDetails /> };
      case 'about':
        return { type: 'react', content: <p>Aidan Rauscher is a fullstack software engineer. He currently works at Hamilton Lane.</p> };
      case 'aidan':
        return { type: 'react', content: <p>rauscher</p> };
      case 'clear':
        return { type: 'text', content: '' }
      case 'contact':
        return { type: 'react', content: <p>Email: <a href="mailto:aidanrauscher23@gmail.com">aidanrauscher23@gmail.com</a></p> };
      case 'cd':
        return { type: 'react', content: handleCdCommand(args[0]) };
      case 'disco':
        return { type: 'react', content: <p>Activating disco mode. Please dance.</p> };
      case 'echo':
        return { type: 'react', content: <p>{args.join(' ')}</p> };
      case 'education':
        return { type: 'react', content: 
          <ul style={{marginLeft: '2em'}}>
            <li>Penn State, B.S. Computer Science</li>
          </ul> 
        };
      case 'experience':
        return { type: 'react', content: 
          <ul style={{marginLeft: '2em'}}>
            <li>Fullstack Enginer @ Hamilton Lane (2023-Present)</li>
            <li>Freelance Technology Writer @ Inside.Com (2022-2023)</li>
            <li>IT Intern @ PPL (2022)</li>
            <li>Co-Founder @ Table Rock Markets (2021-2022)</li>
          </ul> 
        };
      case 'hello':
        return { type: 'react', content: <p>hi</p> };
      case 'matrix':
        return { type: 'react', content: 
        <div className="matrix-output-outer-div">
          <p>After this, there is no turning back...</p>
          <div className="matrix-output-inner-div">
            <button 
              onClick={(e) => { e.preventDefault(); window.open('https://youtu.be/dQw4w9WgXcQ?si=PPKSmRCJMVgqwz4S', '_blank', 'noopener,noreferrer');}}
              className="matrix-output-red-pill"
            >
              Red Bill
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); window.open('https://youtu.be/dQw4w9WgXcQ?si=PPKSmRCJMVgqwz4S', '_blank', 'noopener,noreferrer');}}
              className="matrix-output-blue-pill"
            >
              Blue Bill
            </button>          
          </div>
        </div>
      };
      case 'projects':
        return { type: 'react', content: <p>Work in progress... check back later.</p> };
      case 'resume':
        return { type: 'react', content: handleResumeCommand() };
      case 'skills':
        return { type: 'react', content: 
        <ul style={{marginLeft: '2em'}}>
          <li>Fullstack, Frontend, & Backend Development</li> 
          <li>Scripting, Debugging, Automation</li>
          <li>JavaScript, Node.js, Next.js, React</li>
          <li>C#, .NET, ASP.NET, Blazor</li>
          <li>Python</li>
          <li>SQL</li>
          <li>HTML, CSS, Tailwind CSS</li>
          <li>ChatGPT, Claude Chat, Perplexity</li>
          <li>Git, GitHub, Visual Studo, VS Code, Replit</li>
          <li>Microsoft Power Automate, Zapier, Airtable</li>
          <li>Slack, Zoom, Google Meet, Microsoft Teams</li>
        </ul>
      };
      default:
        return { type: 'react', content: <p>Command not found: {command}. Type "help" for available commands.</p> };
    }
  };