document.addEventListener('DOMContentLoaded', () => {
  //create a global variable to accessed to make it scalable (no magic numbers)
  const width = 20
  const grid = document.querySelector('.grid')
  // array to fill with the divs
  const cells = []
  // store player index globally
  let playerIdx = 21
  //timerId for movement
  let movementId = 0
  //boolean flag for movement func
  let bPlayerRequest = false
  // keep direction before altered so same direction can be forced if needed
  let previousDirection = 'right'

  function loadWalls() {
    const wallsData = JSON.parse(localStorage.getItem('wallsData'))
    //upon load cycle cells
    for (let i = 0; i < cells.length; i++) {
      // at each cell, check to see if the index matches any in the saved walls array
      if (wallsData.indexOf(i) !== -1) {
        //if so, add the wall class
        cells[i].classList.add('wall')
      }
    }
  }

  function createTiles() {
    // handle each div,\/ width squared \/ because it creates a square grid. different calc for rect
    for (let i = 0; i < width ** 2; i++) {
      //create object
      const cell = document.createElement('DIV')
      
      //add cell to grid div
      grid.appendChild(cell)

      //push it into array
      cells.push(cell)
    }
  }

  function movementInterval(direction) {
    
  }

  function move(direction, timing = 500) {
    console.log('inside move()')
    clearInterval(movementId)
    movementId = setInterval(() => {
      //store this so that we can stay if needed and for removing the class after decision
      const currentIdx = playerIdx

      //handle user input
      switch (direction) {
        //move left, only if but not past zero
        case 'left': playerIdx -= 1
          break
        //go up a whole row, but not past zero
        case 'up': playerIdx -= width
          break
        //move right, -1 because cpu starts at 0
        case 'right': playerIdx += 1
          break
        //move down by adding a whole row
        case 'down': playerIdx += width
          break
      }

      console.log(playerIdx)

      //check to see if this next index is wall, if so, dont move
      if (cells[playerIdx].classList.contains('wall')) {
        //stay where it is
        playerIdx = currentIdx
        //if player tries to change direction into a wall keep moving in current direction
        if (bPlayerRequest) {
          //do not clear interval, carry on in same direction
          bPlayerRequest = false
          //clearInterval(movementId)
          console.log('should move previous direction')
          console.log(previousDirection)
          move(previousDirection)
          return
        }
        //stop moving
        clearInterval(movementId)
      }
      // always set back to false after initial input
      bPlayerRequest = false
      //when moving, first thing to do is remove player from current div before moving on
      cells[currentIdx].classList.remove('player')
      //now that the index has moved, add player class to it
      cells[playerIdx].classList.add('player')
      //store this globally
      previousDirection = direction
    }, timing)
  }

  function setupPlayerInput() {
    //playerIdx currently at 21 so start the player there
    cells[playerIdx].classList.add('player')

    //keyup for once instead of continous keydown
    document.addEventListener('keyup', (e) => {
      bPlayerRequest = true
      //handle user input
      switch (e.keyCode) {
        //move left
        case 37: move('left')
          break
        //go up a whole row, but not past zero
        case 38: move('up')
          break
        //move right, -1 because cpu starts at 0
        case 39: move('right')
          break
        //move down by adding a whole row
        case 40: move('down')
          break
      }
    })
  }

  function startGame() {
    createTiles()
    setupPlayerInput()
    loadWalls()
  }
  startGame()
})
