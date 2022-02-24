import React from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import Fuse from 'fuse.js'
import "../node_modules/xterm/css/xterm.css";
import "./App.css";
import FileTreeSystem from "./FileTree"

// construct file directory system
let fileSystem = new FileTreeSystem("root");
fileSystem.addChild("projects");
fileSystem.addChild("blog");
fileSystem.navigateTo("blog");
fileSystem.addChild("test.blog", "blog");
fileSystem.navigateTo("..");
fileSystem.addChild("games");
fileSystem.navigateTo("games");
fileSystem.addChild("test.game", "game");
fileSystem.navigateTo("..");

let shellprompt = fileSystem.getFullPathName() + '~$ ';

let term;
const fitAddon = new FitAddon();
let input = "resume";

let inputHistory = [];
// -1 if new line, >=0 for index into inputHistory
let currentHistoryLocation = -1;

// if the browser attempts to play a sound without webpage interaction first, it throws errors
let clickedDocument = false;
let backgroundAudio = document.getElementById("whitenoise");
document.body.addEventListener('click', function(event) {
    clickedDocument = true;
    if (backgroundAudio.paused) {
        backgroundAudio.volume = 0.7;
        backgroundAudio.play();
    }
}, true); 

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            logs: ""
        };
    }

    componentDidMount() {
        term = new Terminal({
            convertEol: true,
            fontFamily: `'Consolas', monospace`,
            fontSize: 20,
            fontWeight: 900
            // rendererType: "dom" // default is canvas
        });

        //Styling
        term.setOption("theme", {
            background: "black",
            foreground: "white"
        });
        
        // define shell prompt
        term.prompt = function () {
            term.write('\r\n' + shellprompt);
        };

        // Load Fit Addon
        term.loadAddon(fitAddon);

        // Open the terminal in #terminal-container
        term.open(document.getElementById("xterm"));

        term.writeln("My name is Jonathan Chiang, also known as \x1B[1;3;36mszge\x1B[0m.");
        term.writeln("\x1B[1;3;36mszgeOS v1.0.0\x1B[0m with custom tree file system and fuzzy search.");
        term.writeln("Welcome to my personal website. To see my portfolio website, visit \x1B[1;36mszge.github.io\x1B[0m");
        term.writeln("Try entering \"help\" in the command line.");
        
        term.setOption("scrollback", 0);
        term.setOption('cursorBlink', true);
        fitTerminalToWindow();

        term.onKey(key => handleKeyPress(key));

        term.prompt();

        // type the initial prompt in the console
        (function myLoop(i) {
            setTimeout(function() {
                term.write(input[input.length - i]);
                playTypingSound();
                if (--i) myLoop(i);   //  decrement i and call myLoop again if i > 0
            }, 100)
          })(input.length); 
    }

    render() {
        return (
            <div className="App" style={{ background: "" }}>
                <div id="container">
                    <div id="xterm" style={{ height: "100%", width: "100%" }} />
                </div>
            </div>
        );
    }
}

window.addEventListener('resize', function(event) {
    fitTerminalToWindow();
}, true);

function fitTerminalToWindow() {
    if (term) {
        term.resize(50, 10);
        fitAddon.fit();
    }
}

function playTypingSound() {
    // we have two audio sources in case the first one is busy.
    let audio1 = document.getElementById("typesound1");
    let audio2 = document.getElementById("typesound2");
    let audio3 = document.getElementById("typesound3");
    if (audio1.paused) {
        if (clickedDocument) audio1.play();
    } else if (audio2.paused) {
        if (clickedDocument) audio2.play();
    } else {
        if (clickedDocument) audio3.play();
    }
}

function handleKeyPress(key) {
    const char = key.domEvent.key;
    playTypingSound();
    if (char === "Enter") {
        handleInput();
    } else if (char === "Backspace") {
        // Do not delete the prompt
        if (term._core.buffer.x > shellprompt.length) {
            input = input.slice(0, -1);
            term.write('\b \b');
        }
    } else if (char === "ArrowUp") {
        // move stack up
        if (currentHistoryLocation < inputHistory.length - 1) {
            currentHistoryLocation += 1;
            term.write("\x1B[2K\r");
            input = inputHistory[currentHistoryLocation];
            term.write(shellprompt + input);
        }
        // console.log(inputHistory);
        // console.log(currentHistoryLocation)
    } else if (char === "ArrowDown") {
        // move stack down
        if (currentHistoryLocation > 0) {
            currentHistoryLocation -= 1;
            term.write("\x1B[2K\r");
            input = inputHistory[currentHistoryLocation];
            term.write(shellprompt + input);
        } else if (currentHistoryLocation === 0) {
            currentHistoryLocation -= 1;
            term.write("\x1B[2K\r");
            input = "";
            term.write(shellprompt + input);
        }
    } else if (char === "ArrowLeft") {

    } else if (char === "ArrowRight") {

    } else if (char.length === 1) {
        input += key.key;
        term.write(char);
    }
}

// used for fuzzy search
const commands = ["help", "resume", "dir", "cls", "reset", "cd", "contact", "play", "read"];
const fuse = new Fuse(commands, {
    includeScore: true,
    threshold: 1.0 // matches anything
});

// really I should take input as parameter but it doesn't change properly
function handleInput() {
    if (input === "") {
        // special case: don't push to history stack
        term.writeln("");
        term.write(shellprompt);
        return;
    }
    
    // push input to input history stack
    inputHistory.unshift(input);
    currentHistoryLocation = -1;

    // handle input
    term.write("\r\n");
    input = input.toLowerCase();
    
    if (input === "help") {
        term.writeln("Available commands:");
        term.writeln("\t- HELP\t\tShows this text.");
        term.writeln("\t- RESUME\tView my resume.");
        term.writeln("\t- DIR\t\tDisplays a list of files and subdirectories in a directory.");
        term.writeln("\t- CLS\t\tClears the screen.");
        term.writeln("\t- RESET\t\tReset the terminal to the default environment.");
        term.writeln("\t- CD\t\tDisplays the name of or changes the current directory.");
        term.writeln("\t- CONTACT\tReach out to me.");
        term.writeln("\t- PLAY\t\tPlay a .game file.");
        term.writeln("\t- READ\t\tRead a blog article.");
    } else if (input === "resume") {
        // const resume = new URL("../files/resume.pdf", window.location.origin);
        // window.open(resume, '_blank');
        term.writeln("\x1B[1;3;36mJonathan Chiang\x1B[0m - jonathan.chiang@mail.utoronto.ca");
        term.writeln("\x1B[1;36mGitHub\x1B[0m: https://github.com/szge");
        term.writeln("");
        term.writeln("\u001b[4m\x1B[1;36mEducation\x1B[0m");
        term.writeln("\x1B[1;3;36mUniversity of Toronto, St. George Campus\x1B[0m - HBSc Computer Science and Mathematics [September 2019 - Present]");
        term.writeln("\t- 3.8 GPA in first year: Calculus (\u001b[32mA\u001b[0m), Linear Algebra (\u001b[32mA\u001b[0m), Intro. to CS (\u001b[32mA\u001b[0m), CS First-Year Learning Community (FLC)");
        term.writeln("\t- Second year: Computer Organization (\u001b[32mA+\u001b[0m), Abstract Mathematics (\u001b[32mA+\u001b[0m), Software Design (\u001b[32mB\u001b[0m)");
        term.writeln("\t- Third year: Intro. to Software Eng. (\u001b[32mA-\u001b[0m), Complex Variables (\u001b[32mA-\u001b[0m), Stats with Computer Applications (\u001b[32mB+\u001b[0m)");
        term.writeln("");
        term.writeln("\u001b[4m\x1B[1;36mWork Experience\x1B[0m");
        term.writeln("\x1B[1;3;36mDigital Leisure Inc.\x1B[0m - Game Developer [May 2021 - August 2021]");
        term.writeln("\t- Created three 3D multiplayer minigames for an upcoming title");
        term.writeln("\t- Chess, checkers, prototyped an action-oriented minigame with projectile physics");
        term.writeln("\x1B[1;3;36mSummer Institute\x1B[0m - Volunteer [July 2016 - August 2017]");
        term.writeln("\t- 180+ hours volunteering hours over two summers, supervising kids and running activities");
        term.writeln("");
        term.writeln("\u001b[4m\x1B[1;36mProjects (full portfolio at szge.github.io)\x1B[0m");
        term.writeln("\x1B[1;3;36m0 Barriers Accessibility Extension\x1B[0m (CSC301)");
        term.writeln("\t- Group partnered with non-profit to create an accessibility extension for Chrome");
        term.writeln("\t- I generated PDF reports of website accessibility issues with jspdf");
        term.writeln("\t- I exposed an API endpoint to fetch issues from the backend");
        term.writeln("\x1B[1;3;36mCS:GO Cheat\x1B[0m");
        term.writeln("\t- Fully functional external cheat for the video game CS:GO (bhop, triggerbot, wallhack)");
        term.writeln("\t- Implemented through direct memory read/write from the Windows API in C++. (Not tested against real people!)");
        term.writeln("");
        term.writeln("\u001b[4m\x1B[1;36mSkills\x1B[0m: Java, C++, C#, Python, JS, TS, Lua, R, Git, Plastic, HTML/CSS, Unity, React, Node");
        term.writeln("\u001b[4m\x1B[1;36mMiscellaneous\x1B[0m: Co-President of Taiwanese Club, Lagrange math competition champion, self-taught guitarist");
    } else if (input === "cls") {
        term.clear();
    } else if (input === "reset") {
        window.location.reload(false);
    } else if (input === "cd") {
        term.writeln("Usage: cd <directory>");
    } else if (input.startsWith("cd ")) {
        input = input.slice(3);
        let code = fileSystem.navigateTo(input);
        if (code === 0) {
            // successful navigation, update shellPrompt
            shellprompt = fileSystem.getFullPathName() + '~$ ';
        } else if (code === 1) {
            term.writeln("The system cannot find the path specified.");
        } else if (code === 2) {
            term.writeln(input + " is not a directory.");
        } else {
            console.warn("weird, file system navigation code not found. investigate further");
        }
    } else if (input === "dir" || input === "ls") {
        term.writeln("Directory of " + fileSystem.getFullPathName() + ":");
        const children = fileSystem.getChildren();
        if (children.length === 0) {
            term.write("[Empty directory]");
        } else {
            children.forEach(child => term.write(child.name + "\t"));
        }
        term.writeln("");
    } else if (input === "contact" ) {
        term.writeln("\x1B[1;3;36mJonathan Chiang\x1B[0m");
        term.writeln("\x1B[1;36mEmail\x1B[0m: jonathan.chiang@mail.utoronto.ca");
        term.writeln("\x1B[1;36mGitHub\x1B[0m: https://github.com/szge");
    } else if (input === "play" ) {
        term.writeln("Usage: play <game>");
    } else if (input.startsWith("play ")) {
        let gameName = input.slice("play ".length);
        if (gameName === "") {
            term.writeln("Usage: play <game>");
        } else {
            let child = fileSystem.getChildByName(gameName);
            if (child == null) {
                term.writeln(gameName + " is not a game in this directory.");
                let games = fileSystem.getChildrenOfType("game");
                if (games.length === 0) {
                    term.writeln("This directory has no games.");
                } else {
                    let gameNames = games.map(game => game.name);
                    // fuzzy search for name
                    const nameSearch = new Fuse(gameNames, {
                        includeScore: true,
                        threshold: 1.0 // matches anything
                    });
    
                    const result = nameSearch.search(gameName);
                    term.writeln("Did you mean " + result[0].item + "?");
                }
            } else {
                if (child.type === "game") {
                    term.writeln("To be implemented!!");
                } else {
                    term.writeln(gameName + " is not a game.");
                }
            }
        }
    } else if (input === "read" ) {
        term.writeln("Usage: read <post>");
    } else if (input.startsWith("read ")) {
        let blogName = input.slice("read ".length);
        if (blogName === "") {
            term.writeln("Usage: read <post>");
        } else {
            let child = fileSystem.getChildByName(blogName);
            if (child == null) {
                term.writeln(blogName + " is not a blog in this directory.");
                let blogs = fileSystem.getChildrenOfType("blog");
                if (blogs.length === 0) {
                    term.writeln("This directory has no blogs.");
                } else {
                    let blogNames = blogs.map(blog => blog.name);
                    // fuzzy search for name
                    const nameSearch = new Fuse(blogNames, {
                        includeScore: true,
                        threshold: 1.0 // matches anything
                    });
    
                    const result = nameSearch.search(blogName);
                    term.writeln("Did you mean " + result[0].item + "?");
                }
            } else {
                if (child.type === "blog") {
                    term.writeln("To be implemented!!");
                } else {
                    term.writeln(blogName + " is not a game.");
                }
            }
        }
    } else {
        const result = fuse.search(input);
        term.writeln("Sorry, command not recognized. Did you mean " + result[0].item.toUpperCase() + "?");
        term.writeln("Type \"help\" for available commands.");
    }
    term.write(shellprompt);
    input = "";
}