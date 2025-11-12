//Checks the answer in the answer box against a string given as a parameter.
function checkAnswer(correctAnswer) {
  const userInput = document.getElementById("answer").value.trim();
  const feedback = document.getElementById("feedback");

  if (userInput.toLowerCase() === correctAnswer.toLowerCase()) {
    feedback.textContent = "✅ Correct! You cracked Level 1.";
    feedback.style.color = "#00ffc3";
  } else {
    feedback.textContent = "❌ Try again!";
    feedback.style.color = "red";
  }
}
