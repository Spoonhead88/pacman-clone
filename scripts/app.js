document.addEventListener('DOMContentLoaded', () => {
  //array used for saving data
  let wallIndex = []
  let pillIndex = []
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
  //increments everytime a pill is eaten
  let pillCounter = 0

  //classes
  class Ghost {
    constructor(startIdx, targetIdx, state, cssClass) {
      this.startIdx = startIdx
      this.state = state
      this.targetIdx = targetIdx
      this.cssClass = cssClass
    }
    move() {
      return this.width * this.height
    }
    changeState() {
      return (this.width * 2) + (this.height * 2)
    }
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
    //upon load cycle cells
    for (let i = 0; i < cells.length; i++) {
      // at each cell, check to see if the index matches any in the saved walls array
      if (pillsData.indexOf(i) !== -1) {
        //if so, add the pill class
        cells[i].classList.add('pill')
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
      console.log(`pills eaten: ${pillCounter}`)
    }
  }

  function move(direction, timing = 500) {
    clearInterval(movementId)
    //if direction is corrected then change in a split second before carrying on
    setTimeout(function() { 
      movementInterval(direction) 
    }, 10)
    movementId = setInterval(function() {
      movementInterval(direction) 
    }, timing)
  }

  function movementInterval(direction) {
    console.log('inside movement interval. ')
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
        //load editor mode
        case 69: loadEditorMode()
          break
      }
    })
  }

  function startGame() {
    createTiles()
    setupPlayerInput()
    loadWalls()
    loadPills()
  }
  startGame()

  //************************************************************************** */
  //****************Editor**************************************************** */

  function saveEdit() {
    // clear the arrays for a new save
    wallIndex = []
    pillIndex = []
    //iterate over cells
    for (let i = 0; i < cells.length; i++) {
      //if cells has class, save the index of it to another array
      if (cells[i].classList.contains('wall')) {
        wallIndex.push(i)
      }
      if (cells[i].classList.contains('pill')) {
        pillIndex.push(i)
      }
    }
    localStorage.setItem('wallsData', JSON.stringify(wallIndex))
    localStorage.setItem('pillsData', JSON.stringify(pillIndex))
  }

  //function for editing the map
  function handleClick(e) {
    //on click add wall class to cell
    //if it already contains wall class then remove it
    if (e.target.classList.contains('pill')) {
      e.target.classList.remove('pill')
      return
    } e.target.classList.add('pill')
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
},)