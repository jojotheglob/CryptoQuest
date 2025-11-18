//Checks the answer in the answer box against a string given as a parameter.
function checkAnswer(correctAnswer) {
  const userInput = document.getElementById("answer").value.trim();
  const feedback = document.getElementById("feedback");
  const nextLink = document.getElementById("nextChallenge");

  if (userInput.toLowerCase() === correctAnswer.toLowerCase()) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "#00ffc3";
    nextLink.style.visibility = "visible"
  } else {
    feedback.textContent = "❌ Try again!";
    feedback.style.color = "red";
  }
}
