function startGame(event) {
  event.preventDefault(); 
  const username = document.getElementById('username').value.trim();

  if (username !== '') {
    localStorage.setItem('username', username);

    const message = document.createElement('p');
    message.innerText = `Starting the game for ${username}...`;
    document.body.appendChild(message);

    setTimeout(function() {
      message.remove(); 
      window.location.href = 'game.html';  
    }, 1000); 
  } else {
    alert("Please enter a valid username.");
  }
}
