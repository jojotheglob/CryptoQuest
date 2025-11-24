// ===== Answer checking for each level =====
function checkAnswer(correctAnswer) {
  const userInput = document.getElementById("answer").value.trim();
  const feedback = document.getElementById("feedback");
  const nextLink = document.getElementById("nextChallenge");

  // normalize a bit so it's not too strict
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[.,!?'"-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  if (normalize(userInput) === normalize(correctAnswer)) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "#00ffc3";
    if (nextLink) {
      nextLink.style.visibility = "visible";
    }
  } else {
    feedback.textContent = "❌ Try again!";
    feedback.style.color = "red";
  }
}

// ===== Crypto Lab: toggle + terminal logic =====
document.addEventListener("DOMContentLoaded", () => {
  const labContainer = document.getElementById("lab-container");
  const toggleBtn = document.getElementById("toggle-lab");
  const terminal = document.getElementById("terminal");
  const form = document.getElementById("command-form");
  const input = document.getElementById("command-input");

  // --- Toggle button for lab ---
  if (toggleBtn && labContainer) {
    // start hidden
    labContainer.classList.remove("active");
    toggleBtn.textContent = "Open Crypto Lab";

    toggleBtn.addEventListener("click", () => {
      const isActive = labContainer.classList.toggle("active");
      toggleBtn.textContent = isActive ? "Close Crypto Lab" : "Open Crypto Lab";

      // focus input when opening
      if (isActive && input) {
        input.focus();
      }
    });
  }

  // If this page doesn't have a lab, stop here
  if (!terminal || !form || !input) {
    return;
  }

  // --- Terminal helper functions ---
  function printLine(text, className = "terminal-line") {
    const p = document.createElement("p");
    p.textContent = text;
    p.className = className;
    terminal.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  // Basic Caesar shift (positive = forward, negative = backward)
  function caesarShift(text, shift) {
    const aCode = "a".charCodeAt(0);
    const ACode = "A".charCodeAt(0);
    let result = "";

    for (const ch of text) {
      if (ch >= "a" && ch <= "z") {
        const code = ch.charCodeAt(0) - aCode;
        result += String.fromCharCode(aCode + mod(code + shift, 26));
      } else if (ch >= "A" && ch <= "Z") {
        const code = ch.charCodeAt(0) - ACode;
        result += String.fromCharCode(ACode + mod(code + shift, 26));
      } else {
        result += ch;
      }
    }
    return result;
  }

  // Try all 26 Caesar shifts (simple brute force)
  function caesarBrute(text) {
    for (let s = 0; s < 26; s++) {
      const decrypted = caesarShift(text, -s);
      printLine(`Shift ${s}: ${decrypted}`);
    }
  }

  function handleCommand(raw) {
    const [cmd, ...rest] = raw.trim().split(" ");
    const command = cmd.toLowerCase();
    const args = rest.join(" ");

    switch (command) {
      case "help":
        printLine("Available commands:");
        printLine("  help                   - show this help");
        printLine("  caesar-brute TEXT      - try all 26 Caesar shifts");
        printLine("  caesar-shift N TEXT    - shift TEXT by N (e.g. -3 to decrypt)");
        printLine("  clear                  - clear the screen");
        break;

      case "caesar-brute":
        if (!args) {
          printLine("Usage: caesar-brute TEXT");
        } else {
          caesarBrute(args);
        }
        break;

      case "caesar-shift": {
        if (!args) {
          printLine("Usage: caesar-shift N TEXT");
          break;
        }
        const firstSpace = args.indexOf(" ");
        if (firstSpace === -1) {
          printLine("Usage: caesar-shift N TEXT");
          break;
        }
        const shiftStr = args.slice(0, firstSpace);
        const text = args.slice(firstSpace + 1);
        const shift = parseInt(shiftStr, 10);
        if (Number.isNaN(shift)) {
          printLine("Shift must be a number, e.g. -3 or 5.");
          break;
        }
        const result = caesarShift(text, shift);
        printLine(`Result: ${result}`);
        break;
      }

      case "clear":
        terminal.innerHTML = "";
        break;

      case "":
        // ignore empty
        break;

      default:
        printLine(`Unknown command: ${command}`);
        printLine('Type "help" for a list of commands.');
    }
  }

  // Initial message when lab is loaded
  printLine("Welcome to the Crypto Lab for this level.");
  printLine('Type "help" and press Enter to see available commands.');
  printLine("");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;

    printLine("> " + raw, "terminal-line user-command");
    handleCommand(raw);
    input.value = "";
  });
});
