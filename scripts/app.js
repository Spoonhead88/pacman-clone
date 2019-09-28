document.addEventListener('DOMContentLoaded', () => {
  //array used for saving data
  let wallIndex = []
  let pillIndex = []
  let energizerIndex = []
  //create a global variable to accessed to make it scalable (no magic numbers)
  const width = 20
  const grid = document.querySelector('.grid')
  const splash = document.querySelector('.splash')
  const gameover = document.querySelector('.gameover')
  const win = document.querySelector('.win')
  const mainUI = document.querySelector('.mainUI')
  const scoreBoard = document.querySelector('.score')
  const levelDisplay = document.querySelector('.levelDisplay')
  const pacgif = document.querySelector('.pacgif')

  // array to fill with the divs
  const cells = []
  // store player index globally
  let playerIdx = 0
  //timerId for movement
  let movementId = 0
  // collision check interval
  let collisionTimer = 0
  //boolean flag for movement func
  let bPlayerRequest = false
  // keep direction before altered so same direction can be forced if needed
  let previousDirection = 'right'
  //increments everytime a pill is eaten
  let pillCounter = 0
  let totalPills
  let points = 0
  let levelCounter = 1

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
      this.levelSpeedAdjust = 0
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
    // move the ghost from one side of the level to the other when using tunnels
    checkTunnelMove() {
      if (this.ghostIdx === 200) {
        cells[this.ghostIdx].classList.remove(this.cssClass)
        this.ghostIdx = 218
        this.previousIdx = 219
      }
      if (this.ghostIdx === 219) {
        cells[this.ghostIdx].classList.remove(this.cssClass)
        this.ghostIdx = 201
        this.previousIdx = 200
      }
    }
    moveCloser() {
      //if ghost on the edge tile of a tunnel, transfer to other side of stage
      this.checkTunnelMove()
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
      /* 200 - 219 */
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
          //speed interval shorter to speed up
          console.log(this.movementSpeed, 'speed in chase')
          this.movementSpeed = 200 - this.levelSpeedAdjust
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
            console.log(this.name, 'time elapsed in chase: ', this.timeElapsed)
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
          //speed interval longer to slow down
          this.movementSpeed = 600 - this.levelSpeedAdjust
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
          // speed interval shorter to speed up
          this.movementSpeed = 200 - this.levelSpeedAdjust
          console.log(this.movementSpeed, 'speed in scatter. ')
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
            console.log(this.name, 'time remaining in scatter: ', this.timeElapsed)
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
    // setters and getters
    getSpeedAdjust() {
      return this.levelSpeedAdjust
    }
    setSpeedAdjust(newSpeed) {
      this.levelSpeedAdjust = newSpeed
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
  const pinky = new Ghost(171, playerIdx, 'scatter', 'pinky', 100)
  const inky = new Ghost(168, playerIdx, 'scatter', 'inky', 317)
  const clyde = new Ghost(228, playerIdx, 'scatter', 'clyde', 302)

  const ghostArray = [blinky, pinky, inky, clyde]

  function loadGhosts() {
    ghostArray.forEach((ghost) => ghost.reset(playerIdx))
  }

  function loadWalls() {
    //const wallsData = JSON.parse(localStorage.getItem('wallsData'))
    //have to hardcode it for online deploy
    const wallsData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 28, 31, 39, 40, 42, 43, 44, 45, 46, 48, 51, 53, 54, 55, 56, 57, 59, 60, 62, 63, 64, 65, 66, 68, 71, 73, 74, 75, 76, 77, 79, 80, 82, 83, 84, 85, 86, 88, 91, 93, 94, 95, 96, 97, 99, 100, 119, 120, 122, 123, 124, 125, 126, 128, 129, 130, 131, 133, 134, 135, 136, 137, 139, 140, 142, 143, 144, 145, 146, 149, 150, 153, 154, 155, 156, 157, 159, 160, 167, 172, 179, 180, 181, 182, 183, 184, 185, 187, 189, 190, 192, 194, 195, 196, 197, 198, 199, 209, 210, 220, 221, 222, 223, 224, 225, 227, 232, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 247, 248, 249, 250, 251, 252, 254, 255, 256, 257, 258, 259, 260, 268, 269, 270, 271, 279, 280, 282, 283, 284, 286, 288, 289, 290, 291, 293, 295, 296, 297, 299, 300, 302, 303, 304, 306, 313, 315, 316, 317, 319, 320, 326, 327, 328, 329, 330, 331, 332, 333, 339, 340, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 359, 360, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399]
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
    //const pillsData = JSON.parse(localStorage.getItem('pillsData'))
    // have to hardcode for online deploy
    const pillsData = [21, 22, 23, 24, 25, 26, 27, 29, 30, 32, 33, 34, 35, 36, 37, 38, 41, 47, 49, 50, 52, 58, 67, 69, 70, 72, 81, 87, 89, 90, 92, 98, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 121, 138, 141, 158, 161, 162, 163, 164, 165, 166, 173, 174, 175, 176, 177, 178, 186, 193, 226, 233, 246, 253, 261, 262, 263, 264, 265, 266, 267, 272, 273, 274, 275, 276, 277, 278, 285, 287, 292, 294, 301, 305, 307, 308, 309, 310, 311, 312, 314, 318, 321, 322, 323, 324, 325, 334, 335, 336, 337, 338, 341, 358, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378]
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
    //const energizerData = JSON.parse(localStorage.getItem('energizerData'))
    //have to hardcode for online deploy
    const energizerData = [61, 78, 281, 298]
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
      points += 1
    }
    //eat enerizer and scare ghosts
    if (cells[playerIdx].classList.contains('energizer')) {
      cells[playerIdx].classList.remove('energizer')
      ghostArray.forEach((ghost) => {
        if (ghost.getState() !== 'dead') ghost.changeState('frightened')
      })
      points += 5
    }

    //eat ghosts
    ghostArray.forEach((ghost) => {
      if (playerIdx === ghost.getIdx() && ghost.getState() === 'frightened') {
        ghost.changeState('dead')
        points += 10
      }
    })

    // if all pills eaten then game is won
    if (pillCounter === totalPills) won()
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
      //move left
      case 'left': playerIdx -= 1
        break
      //go up a whole row
      case 'up': playerIdx -= width
        break
      //move right
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
    //use tunnels to move from one side of the stage to another
    if (playerIdx === 200) {
      playerIdx = 218
    }
    if (playerIdx === 219) {
      playerIdx = 201
    }
    // always set back to false after initial input
    bPlayerRequest = false
    //when moving, first thing to do is remove player from current div before moving on
    cells[currentIdx].classList.remove('player')
    //now that the index has moved, add player class to it
    cells[playerIdx].classList.add('player')
    //animate the move
    animateMove()
    //store this globally
    previousDirection = direction
    //uodate score 
    levelDisplay.textContent = levelCounter
    scoreBoard.textContent = points
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
    levelCounter = 1
    clearInterval(movementId)
    clearInterval(collisionTimer)
    //set movement speed back to initial
    ghostArray.forEach((ghost) => {
      ghost.stop()
      ghost.setSpeedAdjust(0)
    })
    //stop player
    cells[playerIdx].classList.remove('player')
    //display game over message ask to play again
    mainUI.style.display = 'none'
    grid.style.display = 'none'
    gameover.style.display = 'block'
    points = 0
    scoreBoard.textContent = points
  }

  function startCollisionCheck() {
    collisionTimer = setInterval(() => {
      //pac eats whatever is on this tile
      eat()
      //ghosts check to eat pac when in chase and scatter
      ghostArray.forEach((ghost) => ghost.hasReachedPacman())
    }, 1)
  }

  function startGame() {
    gameover.style.display = 'none'
    splash.style.display = 'none'
    win.style.display = 'none'
    mainUI.style.display = 'flex'
    grid.style.display = 'flex'
    pillCounter = 0
    playerIdx = 21
    loadWalls()
    loadPills()
    loadEnergizer()
    loadGhosts()
    cells[playerIdx].classList.add('player')
    placeImage()
    startCollisionCheck()
  }

  function won() {
    console.log('won() was called. ')
    clearInterval(movementId)
    clearInterval(collisionTimer)
    //up the difficulty
    levelCounter++
    ghostArray.forEach((ghost) => {
      ghost.stop()
      ghost.setSpeedAdjust(50)
      console.log(ghost, 'movementSpeed: ', ghost.getSpeedAdjust())
    })
    console.log('levelCounter: ', levelCounter)

    //stop player
    cells[playerIdx].classList.remove('player')
    //display game over message ask to play again
    mainUI.style.display = 'none'
    grid.style.display = 'none'
    win.style.display = 'block'
  }

  function displaySplash() {
    setupPlayerInput()
  }

  function placeImage() {
    const y = cells[playerIdx].getBoundingClientRect().top
    const x = cells[playerIdx].getBoundingClientRect().left
    const width = cells[playerIdx].getBoundingClientRect().width
    const height = cells[playerIdx].getBoundingClientRect().height
    pacgif.style.left = x + 'px'
    pacgif.style.top = y + 'px'
    pacgif.style.width = width + 'px'
    pacgif.style.height = height + 'px'
    //pacgif.style.zIndex = '2'
  }

  function animateMove() {
    const playerLeft = cells[playerIdx].offsetLeft
    const pacLeft = pacgif.offsetLeft
    const playerTop = cells[playerIdx].offsetTop
    const pacTop = pacgif.offsetTop
    //const playerTop = cells[playerIdx].offsetTop
    //const pacTop = pacgif.offsetTop
    const xDiff = playerLeft - pacLeft
    const yDiff = playerTop - pacTop
    //const yDiff = playerTop - pacTop
    pacgif.style.transform = `translate(${xDiff}px, ${yDiff}px)`
  }

  // take createTiles out of start game, only needs to run once on page
  createTiles()
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
    if (e.target.classList.contains('wall')) {
      e.target.classList.remove('wall')
      return
    } e.target.classList.add('wall')
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