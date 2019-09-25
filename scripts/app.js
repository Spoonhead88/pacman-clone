
document.addEventListener('DOMContentLoaded', () => {
  //array used for saving data
  let wallIndex = []
  let pillIndex = []
  let energizerIndex = []
  //create a global variable to accessed to make it scalable (no magic numbers)
  const width = 20
  const grid = document.querySelector('.grid')
  const splash = document.querySelector('.splash')
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

  //classes
  class Ghost {
    constructor(ghostIdx, targetIdx, state, cssClass, cornerIdx) {
      this.name = cssClass
      this.startIdx = ghostIdx
      this.ghostIdx = ghostIdx
      this.previousIdx = 0
      this.targetIdx = targetIdx
      this.cornerIdx = cornerIdx
      this.state = state
      this.cssClass = cssClass
      this.normalCss = cssClass
      this.frightenedCss = 'frightened'
      this.timerId = 0
      this.frightTimer = 0
      this.scatterTimer = 0
      this.chaseTimer = 0
      //millisecond interval between movements
      this.movementSpeed = 200
      this.timeElapsed = 0
      this.timeCounter = 0
      this.previousState = 0
    }
    moveAmount(newIdx) {
      //remove cssClass from this cell before moving
      cells[this.ghostIdx].classList.remove(this.cssClass)
      //save reference to check next move
      this.previousIdx = this.ghostIdx
      // move the actual index by amount passed in
      this.ghostIdx = newIdx
      //place cssClass on new cell
      cells[this.ghostIdx].classList.add(this.cssClass)
    }
    checkNextIdx(nextIdx) {
      //check for wall and previous index
      return (cells[nextIdx].classList.contains('wall') === false && cells.indexOf(cells[nextIdx]) !== this.previousIdx)
    }
    moveCloser() {
      //get player and ghost coords
      const targetX = cells[this.targetIdx].getBoundingClientRect().left
      const ghostX = cells[this.ghostIdx].getBoundingClientRect().left
      const targetY = cells[this.targetIdx].getBoundingClientRect().top
      const ghostY = cells[this.ghostIdx].getBoundingClientRect().top
      // check up, if there is no wall and not previous position, move there
      if (this.checkNextIdx(this.ghostIdx - width) && ghostY > targetY) {
        //move up
        this.moveAmount(this.ghostIdx - width)
      } else if (this.checkNextIdx(this.ghostIdx + width) && ghostY < targetY) {
        //check down, if poss move there
        this.moveAmount(this.ghostIdx + width)
      } else if (this.checkNextIdx(this.ghostIdx - 1) && ghostX > targetX) {
        //check left, if poss move there
        this.moveAmount(this.ghostIdx - 1)
      } else if (this.checkNextIdx(this.ghostIdx + 1) && ghostX < targetX) {
        //check left, if poss move there
        this.moveAmount(this.ghostIdx + 1)
      }
    }
    forceMove() {
      //if cant get any closer force next move into cell with no wall or previous position
      if (this.checkNextIdx(this.ghostIdx - width)) {
        this.moveAmount(this.ghostIdx - width)
        //check up
      } else if (this.checkNextIdx(this.ghostIdx + width)) {
        //check down, if poss move there
        this.moveAmount(this.ghostIdx + width)
      } else if (this.checkNextIdx(this.ghostIdx - 1)) {
        //check left, if poss move there
        this.moveAmount(this.ghostIdx - 1)
      } else if (this.checkNextIdx(this.ghostIdx + 1)) {
        //check left, if poss move there
        this.moveAmount(this.ghostIdx + 1)
      }
    }
    move() {
      this.timerId = setInterval(() => {
        //update target idx to player idx
        this.targetIdx = playerIdx
        //chekc how to move depending on which state this ghost is in
        const idxCheck = this.ghostIdx
        //handle user input
        switch (this.state) {
          //move left, only if but not past zero
          case 'chase':
            this.moveCloser()
            //make the target pac man again
            this.targetIdx = playerIdx
            //if the ghost cant get closer force move to next available tile
            if (idxCheck === this.ghostIdx) {
              this.forceMove()
            }
            break
          //go up a whole row, but not past zero
          case 'frightened': 
            //make target a randomized index
            this.targetIdx = Math.floor(Math.random() * Math.floor(400))
            //same as chase but with a randomized target
            this.moveCloser()
            //if the ghost cant get closer force move to next available tile
            if (idxCheck === this.ghostIdx) {
              this.forceMove()
            }
            break
          case 'scatter':
            //set the target to corresponding corner
            this.targetIdx = this.cornerIdx
            this.moveCloser()
            if (idxCheck === this.ghostIdx) {
              this.forceMove()
            }
            break
        }
      }, this.movementSpeed)
    }
    stop() {
      clearInterval(this.timerId)
      cells[this.ghostIdx].classList.remove(this.cssClass)
    }
    hasReachedPacman() {
      // if made contact with pacman and the ghost is in chase or scatter mode then game over
      if (playerIdx === this.ghostIdx && (this.state === 'chase' || this.state === 'scatter')) {
        gameOver()
      }
    }
    changeState(newState) {
      //time elapsed referenced by timers after fright to carry on where they left off
      this.state = newState
      switch (newState) {
        case 'chase':
          //save previous state to go back after fright
          this.previousState = 'chase'
          clearInterval(this.timeCounter)
          console.log(this.name, ' is on chase')
          this.stop()
          this.movementSpeed = 200
          this.cssClass = this.normalCss
          //add this immediately instead of waiting for move to do it
          cells[this.ghostIdx].classList.add(this.cssClass)
          //after 20 seconds change back to scatter
          this.chaseTimer = setTimeout(() => {
            console.log('chase sending ', this.name, 'back to scatter')
            this.changeState('scatter')
          }, 20000 - this.timeElapsed)
          //keep track of time remaining so it can start where it left
          this.timeCounter = setInterval(() => {
            this.timeElapsed += 1000
            console.log(this.name, 'time elapsed in chase: ',this.timeElapsed)
            if (this.timeElapsed === 19000) {
              this.timeElapsed = 0
            }
          }, 1000)
          this.move()
          break
        case 'frightened':
          //remove, change ad re add the cssClass
          this.stop()
          console.log(this.name, 'is on frightened')
          this.movementSpeed = 600
          this.cssClass = this.frightenedCss
          //add this immediately instead of waiting for move to do it
          cells[this.ghostIdx].classList.add(this.cssClass)
          //clear the timeCounter interval and save the time remaining
          clearInterval(this.timeCounter)
          console.log(this.name, 'frightened state saved time remaining as: ', this.timeElapsed)
          //clear any chase or scatter timers
          clearTimeout(this.chaseTimer)
          clearTimeout(this.scatterTimer)
          //after 5 seconds go back to chase
          this.frightTimer = setTimeout(() => {
            //use previous state variable to go back and complete timing
            console.log('fright sending ', this.name, 'back to ', this.previousState)
            this.changeState(this.previousState)
          }, 5000)
          this.move()
          break
        case 'dead':
          this.previousState = 'dead'
          this.stop()
          this.clearTimers()
          console.log(this.name, 'is dead. ')
          break
        case 'scatter':
          this.previousState = 'scatter'
          clearInterval(this.timeCounter)
          console.log(this.name, 'is on scatter')
          this.stop()
          this.movementSpeed = 200
          this.cssClass = this.normalCss
          //add this immediately instead of waiting for move to do it
          cells[this.ghostIdx].classList.add(this.cssClass)
          // scatter for 7 seconds then go back to chase
          this.scatterTimer = setTimeout(() => {
            console.log('scatter sending', this.name, 'back to chase')
            this.changeState('chase')
          }, 7000 - this.timeElapsed)
          //keep track of time remaining so it can start where it left
          this.timeCounter = setInterval(() => {
            this.timeElapsed += 1000
            console.log(this.name, 'time remaining in scatter: ',this.timeElapsed)
            if (this.timeElapsed === 6000) {
              this.timeElapsed = 0
            } 
          }, 1000)
          this.move()
          break
      }
    }
    changeTarget(newTarget) {
      this.targetIdx = newTarget
    }
    changeCssClass(newCssClass) {
      this.cssClass = newCssClass
    }
    getState() {
      return this.state
    }
    getIdx() {
      return this.ghostIdx
    }
    setIdx(newIdx) {
      this.ghostIdx = newIdx
    }
    setInitialState(newState) {
      this.state = newState
    }
    setCornerIdx(newCornerIdx) {
      this.cornerIdx = newCornerIdx
    }
    clearTimers() {
      clearInterval(this.timerId)
      clearInterval(this.timeCounter)
      clearTimeout(this.chaseTimer)
      clearTimeout(this.scatterTimer)
      clearTimeout(this.frightTimer)
      this.timeElapsed = 0
    }
    reset(newTarget) {
      cells[this.ghostIdx].classList.remove(this.cssClass)
      this.setIdx(this.startIdx)
      this.changeTarget(newTarget)
      this.setInitialState('scatter')
      this.changeCssClass(this.normalCss)
      this.clearTimers()
      cells[this.ghostIdx].classList.add(this.cssClass)
      this.move()
      //do this to kick off initial timers
      this.changeState('scatter')
    }
  }

  const blinky = new Ghost(231, playerIdx, 'scatter', 'blinky', 14)
  const pinky = new Ghost(171, playerIdx, 'scatter', 'pinky', 42)
  const inky = new Ghost(168, playerIdx, 'scatter', 'inky', 317)
  const clyde = new Ghost(228, playerIdx, 'scatter', 'clyde', 302)

  const ghostArray = [blinky, pinky, inky, clyde]

  function loadGhosts() {
    ghostArray.forEach((ghost) => ghost.reset(playerIdx))
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
    //eat pill and increment counter
    if (cells[playerIdx].classList.contains('pill')) {
      cells[playerIdx].classList.remove('pill')
      pillCounter++
    }
    //eat enerizer and scare ghosts
    if (cells[playerIdx].classList.contains('energizer')) {
      cells[playerIdx].classList.remove('energizer')
      ghostArray.forEach((ghost) => {
        if (ghost.getState() !== 'dead') ghost.changeState('frightened')
      })
    }

    //eat ghosts
    ghostArray.forEach((ghost) => {
      if (playerIdx === ghost.getIdx() && ghost.getState() === 'frightened') {
        ghost.changeState('dead')
      }
    })

    // if all pills eaten then game is won
    if (pillCounter === totalPills) {
      if (confirm('You won, play again?')) {
        startGame()
      }
    }
  }

  function move(direction, timing = 200) {
    console.log('pressed move')
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
      case 13: startGame()
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
    ghostArray.forEach((ghost) => ghost.stop())

    //stop player
    cells[playerIdx].classList.remove('player')
    document.removeEventListener('keyup', inputHandler)
    //display game over message ask to play again
    if (confirm('Game Over, Play Again?')) startGame()
  }

  function startCollisionCheck() {
    setInterval(() => {
      //pac eats whatever is on this tile
      eat()
      //ghosts check to eat pac when in chase and scatter
      ghostArray.forEach((ghost) => ghost.hasReachedPacman())
    }, 1)
  }

  function startGame() {
    splash.style.display = 'none'
    grid.style.display = 'flex'
    pillCounter = 0
    playerIdx = 21
    createTiles()
    loadWalls()
    loadPills()
    loadEnergizer()
    loadGhosts()
    cells[playerIdx].classList.add('player')
    startCollisionCheck()
  }

  function displaySplash() {
    setupPlayerInput()
  } 

  displaySplash()

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