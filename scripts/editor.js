//array used for saving data
//var wallIndex = []

// function saveWalls() {
//   // clear the array for a new save
//   wallIndex = []
//   //iterate over cells
//   for (let i = 0; i < cells.length; i++) {
//     //if cells has wall class, save the index of it to another array
//     if (cells[i].classList.contains('wall')) {
//       wallIndex.push(i)
//       console.log('found wall')
//       console.log(wallIndex)
//     } 
//   }
//   localStorage.setItem('wallsData', JSON.stringify(wallIndex))
//   console.log('wallsData should be saved. ')
// }

//function for editing the map
// function handleClick(e) {
//   //on click add wall class to cell
//   //if it already contains wall class then remove it
//   if (e.target.classList.contains('wall')) {
//     e.target.classList.remove('wall')
//     return
//   } e.target.classList.add('wall')
// }

//for editing the map
// cell.addEventListener('click', handleClick)

// //save walls data
// case 83: saveWalls()
//   break
//load walls data
// case 76: loadWalls()
//   break

