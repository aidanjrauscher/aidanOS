const socialProfiles = {
    twitter: 'https://twitter.com/aidanjrauscher',
    github: 'https://github.com/aidanjrauscher',
    linkedin: 'https://www.linkedin.com/in/aidanjrauscher',
    google: 'https://www.google.com'
  };
  
  const handleCdCommand = (destination) => {
    if (!destination) {
      return 'Usage: cd <website>. Available websites: github, linkedin, twitter';
    }
  
    if(destination == "..")
    {
      destination = "google"
    }

    if (socialProfiles[destination]) {
      window.open(socialProfiles[destination], '_blank');
      return `Navigating to ${destination}...`;
    } else {
      return `Unknown website: ${destination}. Available websites: twitter, github, linkedin`;
    }
  };

  const handleResumeCommand = () => {
    const pathToPDF = "./resume.pdf"; 
    fetch(pathToPDF).then((response) => {
        response.blob().then((blob) => {
        
            const fileURL =
                window.URL.createObjectURL(blob);
                
            let pdfLink = document.createElement("a");
            pdfLink.href = fileURL;
            pdfLink.download = "AidanRauscher.pdf";
            pdfLink.click();

            window.open(pathToPDF, '_blank');
        });
    });
};
  
  export const handleCommand = (input) => {
    const [command, ...args] = input.trim().toLowerCase().split(' ');
  
    switch (command) {
      case 'help':
        return 'Available commands:\n' +
               '  help                 Show this help message\n' +
               '  about                Display information about Aidan Rauscher\n' +
               '  clear                Clear current terminal output\n' +
               '  contact              Show contact information\n' +
               '  cd <location>        Navigate to external profiles (github, linkedin, twitter)\n' +
               '  disco                Activate temporary disco mode\n' +
               '  echo                 Specifies text to display on the screen\n' +
               '  experience           List my experience\n' +
               '  hello                A greeting\n' +
               '  projects             List my projects\n' +
               '  resume               Download Aidan\s Resume.\n' +
               '  skills               List my skills';

      case 'about':
        return 'Aidan Rauscher is a fullstack software engineer. He currently works at Hamilton Lane.';
      case 'clear':
        return;
      case 'contact':
        return 'Email: aidanrauscher23@gmail.com'
      case 'cd':
        return handleCdCommand(args[0]);
      case 'disco':
        return 'Activating disco mode. Please dance.';
      case 'echo':
        return args.join(' ');
      case 'experience':
        return 'Working in progress... check back later.'
      case 'hello':
        return 'hi'
      case 'projects':
        return 'Working in progress... check back later.'
      case 'resume':
        handleResumeCommand()
        return 'Downloaded Aidan\'s resume.'
      case 'skills':
        return 'Working in progress... check back later.'
      default:
        return `Command not found: ${command}. Type "help" for available commands.`;
    }
  };