// ===== Progress tracking =====
function updateProgress(levelNumber) {
  if (!levelNumber) return;

  const maxLevel = 6; // total number of levels
  const key = "cq_highestUnlocked";

  const current = parseInt(localStorage.getItem(key) || "1", 10);

  // Only move forward, never backwards, and don't go past maxLevel
  if (levelNumber >= current && levelNumber < maxLevel) {
    const next = levelNumber + 1;
    localStorage.setItem(key, String(next));
  }
}

// ===== Answer checking for each level =====
function checkAnswer(correctAnswer, levelNumber) {
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

    // mark progress
    if (typeof levelNumber === "number") {
      updateProgress(levelNumber);
    }

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

  // ----- Vigenere helper -----
  function vigenereDecrypt(ciphertext, key) {
    const A = "A".charCodeAt(0);
    key = key.toUpperCase().replace(/[^A-Z]/g, "");
    if (!key.length) return ciphertext;

    let result = "";
    let keyIndex = 0;

    for (let i = 0; i < ciphertext.length; i++) {
      const ch = ciphertext[i];
      const code = ch.toUpperCase().charCodeAt(0);

      if (code >= A && code <= A + 25) {
        const keyShift = key.charCodeAt(keyIndex % key.length) - A;
        const decrypted = ((code - A - keyShift + 26) % 26) + A;

        // preserve case
        result += (ch === ch.toLowerCase())
          ? String.fromCharCode(decrypted).toLowerCase()
          : String.fromCharCode(decrypted);

        keyIndex++;
      } else {
        result += ch; // spaces, punctuation
      }
    }

    return result;
  }

  // ----- Command handler -----
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
        printLine("  vigenere KEY TEXT      - decrypt Vigenere with KEY");
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

      case "vigenere": {
        if (!args) {
          printLine("Usage: vigenere KEY TEXT");
          break;
        }
        const firstSpace = args.indexOf(" ");
        if (firstSpace === -1) {
          printLine("Usage: vigenere KEY TEXT");
          break;
        }
        const key = args.slice(0, firstSpace);
        const text = args.slice(firstSpace + 1);
        const result = vigenereDecrypt(text, key);
        printLine(`Result: ${result}`);
        break;
      }
  // ----- Columnar transposition helper -----
  function columnarDecrypt(ciphertext, key) {
    // remove spaces in the cipher
    const clean = ciphertext.replace(/\s+/g, "");
    key = key.toUpperCase().replace(/[^A-Z]/g, "");
    const cols = key.length;
    if (!cols) return ciphertext;

    // we assume the message was padded to fill a full rectangle
    const totalChars = clean.length;
    const rows = Math.floor(totalChars / cols);

    // Determine column order: indices sorted by key letter (stable)
    const indices = [...Array(cols).keys()]; // [0, 1, 2, ...]
    const sortedIndices = indices.slice().sort((a, b) => {
      const ca = key[a];
      const cb = key[b];
      if (ca === cb) return a - b; // stable if same letter
      return ca < cb ? -1 : 1;
    });

    // Each column has exactly `rows` characters (we padded the plaintext)
    const colsData = Array.from({ length: cols }, () => Array(rows).fill(""));

    let pos = 0;
    for (const colIdx of sortedIndices) {
      const segment = clean.slice(pos, pos + rows);
      for (let r = 0; r < rows; r++) {
        colsData[colIdx][r] = segment[r];
      }
      pos += rows;
    }

    // Read off row-by-row in the original key order (0..cols-1)
    let result = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result += colsData[c][r] || "";
      }
    }
    return result;
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
