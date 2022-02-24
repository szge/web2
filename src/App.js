import React from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "../node_modules/xterm/css/xterm.css";
import "./App.css";
import FileTreeSystem from "./FileTree"

// construct file directory system
let fileSystem = new FileTreeSystem("root");
fileSystem.addChild("projects");
fileSystem.addChild("blog");

let shellprompt = fileSystem.getFullPathName() + '$ ';

let term;
const fitAddon = new FitAddon();
let input = "";
// TODO: this
let inputHistory = [];

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
        term.writeln("\x1B[1;3;36mszgeOS v1.0.0\x1B[0m with custom tree file system.");
        term.writeln("Welcome to my personal website. This is best experienced on a 1080p monitor.");
        term.writeln("Try entering \"help\" in the command line.");
        
        term.setOption("scrollback", 0);
        term.setOption('cursorBlink', true);
        fitTerminalToWindow();

        term.onKey(key => {
            const char = key.domEvent.key;
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
            } else if (char === "ArrowDown") {
                // move stack down
            } else if (char === "ArrowLeft") {

            } else if (char === "ArrowRight") {

            } else {
                input += key.key;
                term.write(char);
            }
        });

        term.prompt();
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

// really I should take input as parameter but it doesn't change properly
function handleInput() {
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
    } else if (input === "resume") {
        // window.open("/files/resume.pdf");
    } else if (input === "cls") {
        term.clear();
    } else if (input === "reset") {
        window.location.reload(false);
    } else if (input === "cd") {
        term.writeln("Usage: cd <directory>");
    } else if (input.startsWith("cd ")) {

    } else if (input === "dir" || input === "ls") {
        term.writeln("Directory of " + fileSystem.getFullPathName());
        const children = fileSystem.getChildren();
        children.forEach(child => {
            term.write(child.name + "\t");
        });
        term.writeln("");
    } else {
        // TODO: fuzzy search to find similar commands
        term.writeln("Sorry, command not recognized. Type \"help\" for available commands.");
    }
    term.write(shellprompt);
    input = "";
}