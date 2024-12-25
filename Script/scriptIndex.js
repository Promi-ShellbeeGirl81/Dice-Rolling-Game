function startGame(event) {
  event.preventDefault(); 
  const username = document.getElementById('username').value.trim();
  const startingMessage = document.getElementById('startingMessage');

  if (username !== '') {
    localStorage.setItem('username', username);

    startingMessage.innerText = `Starting the game for ${username}...`;
    startingMessage.style.opacity = '1'; 

    setTimeout(function() {
      startingMessage.style.opacity = '0'; 
      window.location.href = '../HTML/game.html';  
    }, 1000); 
  } else {
    alert("Please enter a valid username.");
  }
}
