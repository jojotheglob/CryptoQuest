// Caesar cipher decryption function
function caesarDecrypt(text, shift) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let char of text) {
    const lower = char.toLowerCase();
    if (alphabet.includes(lower)) {
      let newIndex = (alphabet.indexOf(lower) - shift + 26) % 26;
      let newChar = alphabet[newIndex];
      // Preserve case
      result += char === char.toUpperCase() ? newChar.toUpperCase() : newChar;
    } else {
      result += char;
    }
  }

  return result;
}

function checkAnswer() {
  const userInput = document.getElementById("answer").value.trim();
  const correctAnswer = caesarDecrypt("Fdhvdu flskhuv duh ixq!", 3); // shift of 3
  const feedback = document.getElementById("feedback");

  if (userInput.toLowerCase() === correctAnswer.toLowerCase()) {
    feedback.textContent = "✅ Correct! You cracked Level 1.";
    feedback.style.color = "#00ffc3";
  } else {
    feedback.textContent = "❌ Try again!";
    feedback.style.color = "red";
  }
}
