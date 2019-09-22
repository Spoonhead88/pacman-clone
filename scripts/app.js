document.addEventListener('DOMContentLoaded', () => {
  //array used for saving data
  let wallIndex = []
  let pillIndex = []
  let energizerIndex = []
  //create a global variable to accessed to make it scalable (no magic numbers)
  const width = 20
  const grid = document.querySelector('.grid')
  // array to fill with the divs
  const cells = []
  // store player index globally
  let playerIdx = 0
  //timerId for movement
  let movementId = 0
  //boolean flag for movement func
  let bPlayerRequest = false
  // keep direction before altered so same direction can be forced if needed
  let previousDirection = 'right'
  //increments everytime a pill is eaten
  let pillCounter = 0
  let totalPills
  //ghosts
  let blinky
  let pinky
  let inky
  let clyde

  //classes
  class Ghost {
    constructor(ghostIdx, targetIdx, state, cssClass) {
      this.ghostIdx = ghostIdx
      this.previousIdx = 0
      this.targetIdx = targetIdx
      this.state = state
      this.cssClass = cssClass
      this.timerId = 0

      cells[ghostIdx].classList.add(this.cssClass)
    }
    moveUp() {
      //remove cssClass from this cell before moving
      cells[this.ghostIdx].classList.remove(this.cssClass)
      //save reference to check next move
      this.previousIdx = this.ghostIdx
      // move the actual index
      this.ghostIdx -= width
      //place cssClass on new cell
      cells[this.ghostIdx].classList.add(this.cssClass)
    }
    moveDown() {
      //remove cssClass from this cell before moving
      cells[this.ghostIdx].classList.remove(this.cssClass)
      //save reference to check next move
      this.previousIdx = this.ghostIdx
      // move the actual index
      this.ghostIdx += width
      //place cssClass on new cell
      cells[this.ghostIdx].classList.add(this.cssClass)
    }
    moveLeft() {
      //remove cssClass from this cell before moving
      cells[this.ghostIdx].classList.remove(this.cssClass)
      //save reference to check next move
      this.previousIdx = this.ghostIdx
      // move the actual index
      this.ghostIdx -= 1
      //place cssClass on new cell
      cells[this.ghostIdx].classList.add(this.cssClass)
    }
    moveRight() {
      //remove cssClass from this cell before moving
      cells[this.ghostIdx].classList.remove(this.cssClass)
      //save reference to check next move
      this.previousIdx = this.ghostIdx
      // move the actual index
      this.ghostIdx += 1
      //place cssClass on new cell
      cells[this.ghostIdx].classList.add(this.cssClass)
    }
    moveCloser() {
      //get player and ghost coords
      const playerX = cells[playerIdx].getBoundingClientRect().left
      const ghostX = cells[this.ghostIdx].getBoundingClientRect().left
      const playerY = cells[playerIdx].getBoundingClientRect().top
      const ghostY = cells[this.ghostIdx].getBoundingClientRect().top
      // check up, if there is no wall and not previous position, move there
      //if the next cells index matches previous, dont move there
      if (cells[this.ghostIdx - width].classList.contains('wall') === false
        && cells.indexOf(cells[this.ghostIdx - width]) !== this.previousIdx
        && ghostY > playerY) {
        this.moveUp()
      } else if (cells[this.ghostIdx + width].classList.contains('wall') === false
        && cells.indexOf(cells[this.ghostIdx + width]) !== this.previousIdx
        && ghostY < playerY) {
        //check down, if poss move there
        this.moveDown()
      } else if (cells[this.ghostIdx - 1].classList.contains('wall') === false
        && cells.indexOf(cells[this.ghostIdx - 1]) !== this.previousIdx
        && ghostX > playerX) {
        //check left, if poss move there
        this.moveLeft()
      } else if (cells[this.ghostIdx + 1].classList.contains('wall') === false
        && cells.indexOf(cells[this.ghostIdx + 1]) !== this.previousIdx
        && ghostX < playerX) {
        //check left, if poss move there
        this.moveRight()
      }
    }
    forceMove() {
      //if cant get any closer force next move into cell with no wall or previous position
      if (cells[this.ghostIdx - width].classList.contains('wall') === false
        && cells.indexOf(cells[this.ghostIdx - width]) !== this.previousIdx) {
        this.moveUp()
      } else if (cells[this.ghostIdx + width].classList.contains('wall') === false 
        && cells.indexOf(cells[this.ghostIdx + width]) !== this.previousIdx) {
        //check down, if poss move there
        this.moveDown()
      } else if (cells[this.ghostIdx - 1].classList.contains('wall') === false
        && cells.indexOf(cells[this.ghostIdx - 1]) !== this.previousIdx) {
        //check left, if poss move there
        this.moveLeft()
      } else if (cells[this.ghostIdx + 1].classList.contains('wall') === false
        && cells.indexOf(cells[this.ghostIdx + 1]) !== this.previousIdx) {
        //check left, if poss move there
        this.moveRight()
      }
    }
    move() {
      this.timerId = setInterval(() => {
        const idxCheck = this.ghostIdx
        this.moveCloser()
        //if the ghost cant get closer force move to next available tile
        if (idxCheck === this.ghostIdx) {
          this.forceMove()
        }
        //check to see if pacman has been reached
        this.hasReachedPacman()
      }, 200)
    }
    stop() {
      clearInterval(this.timerId)
      cells[this.ghostIdx].classList.remove(this.cssClass)
    }
    hasReachedPacman() {
      if (playerIdx === this.ghostIdx) {
        gameOver()
      }
    }
    changeState(newState) {
      this.state = newState
    }
    changeTarget(newTarget) {
      this.targetIdx = newTarget
    }
  }

  function loadGhosts() {
    blinky = new Ghost(231, playerIdx, 'normal', 'blinky')
    pinky = new Ghost(171, playerIdx, 'normal', 'pinky')
    inky = new Ghost(168, playerIdx, 'normal', 'inky')
    clyde = new Ghost(228, playerIdx, 'normal', 'clyde')
    blinky.move()
    pinky.move()
    inky.move()
    clyde.move()
  }

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

  function loadPills() {
    const pillsData = JSON.parse(localStorage.getItem('pillsData'))
    totalPills = pillsData.length
    //upon load cycle cells
    for (let i = 0; i < cells.length; i++) {
      // at each cell, check to see if the index matches any in the saved walls array
      if (pillsData.indexOf(i) !== -1) {
        //if so, add the pill class
        cells[i].classList.add('pill')
      }
    }
  }

  function loadEnergizer() {
    const energizerData = JSON.parse(localStorage.getItem('energizerData'))
    //upon load cycle cells
    for (let i = 0; i < cells.length; i++) {
      // at each cell, check to see if the index matches any in the saved walls array
      if (energizerData.indexOf(i) !== -1) {
        //if so, add the energizer class
        cells[i].classList.add('energizer')
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

  function eat() {
    if (cells[playerIdx].classList.contains('pill')) {
      cells[playerIdx].classList.remove('pill')
      pillCounter++
    }
    if (pillCounter === totalPills) {
      if (confirm('You won, play again?')) {
        startGame()
      }
    }
  }

  function move(direction, timing = 200) {
    clearInterval(movementId)
    //if direction is corrected then change in a split second before carrying on
    setTimeout(function () {
      movementInterval(direction)
    }, 10)
    movementId = setInterval(function () {
      movementInterval(direction)
    }, timing)
  }

  function movementInterval(direction) {
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
    //check to see if this next index is wall, if so, dont move
    if (cells[playerIdx].classList.contains('wall')) {
      //stay where it is
      playerIdx = currentIdx
      //if player tries to change direction into a wall keep moving in current direction
      if (bPlayerRequest) {
        //carry on in same direction
        bPlayerRequest = false
        clearInterval(movementId)
        move(previousDirection)
        return
      }
      //stop moving
      clearInterval(movementId)
    }
    eat()
    // always set back to false after initial input
    bPlayerRequest = false
    //when moving, first thing to do is remove player from current div before moving on
    cells[currentIdx].classList.remove('player')
    //now that the index has moved, add player class to it
    cells[playerIdx].classList.add('player')
    //store this globally
    previousDirection = direction
  }

  function inputHandler(e) {
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
      //load editor mode
      case 69: loadEditorMode()
        break
    }
  }

  function setupPlayerInput() {
    //keyup for once instead of continous keydown
    document.addEventListener('keyup', inputHandler)
  }

  function gameOver() {
    console.log('game over')
    clearInterval(movementId)
    //stop the ghosts 
    blinky.stop()
    pinky.stop()
    inky.stop()
    clyde.stop()
    //stop player
    cells[playerIdx].classList.remove('player')
    document.removeEventListener('keyup', inputHandler)
    //display game over message
    //ask to play again
    if (confirm('Game Over, Play Again?')) startGame()
  }

  function startGame() {
    pillCounter = 0
    playerIdx = 21
    createTiles()
    setupPlayerInput()
    loadWalls()
    loadPills()
    loadEnergizer()
    loadGhosts()
    cells[playerIdx].classList.add('player')
  }
  startGame()

  //************************************************************************** */
  //****************Editor**************************************************** */

  function saveEdit() {
    // clear the arrays for a new save
    wallIndex = []
    pillIndex = []
    energizerIndex = []
    //iterate over cells
    for (let i = 0; i < cells.length; i++) {
      //if cells has class, save the index of it to another array
      if (cells[i].classList.contains('wall')) {
        wallIndex.push(i)
      }
      if (cells[i].classList.contains('pill')) {
        pillIndex.push(i)
      }
      if (cells[i].classList.contains('energizer')) {
        energizerIndex.push(i)
      }
    }
    localStorage.setItem('wallsData', JSON.stringify(wallIndex))
    localStorage.setItem('pillsData', JSON.stringify(pillIndex))
    localStorage.setItem('energizerData', JSON.stringify(energizerIndex))
  }

  //function for editing the map
  function handleClick(e) {
    //on click add wall class to cell
    //if it already contains wall class then remove it
    if (e.target.classList.contains('energizer')) {
      e.target.classList.remove('energizer')
      return
    } e.target.classList.add('energizer')
  }

  function setupEditorListeners() {
    //cycle cells
    for (let i = 0; i < cells.length; i++) {
      // at each cell add click event listener
      cells[i].addEventListener('click', handleClick)
    }

    //keyup for once instead of continous keydown
    document.addEventListener('keyup', (e) => {
      bPlayerRequest = true
      //handle user input
      switch (e.keyCode) {
        //save walls data
        case 83: saveEdit()
          break
        //load walls data
        case 76: loadWalls()
          break
      }
    })
  }

  function loadEditorMode() {
    setupEditorListeners()
    alert('loaded editor mode')
  }
})