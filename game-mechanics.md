# basic game mechanics
- the maze is filled with food
- all the food must be eaten to clear the current stage
- if pacman touches the ghosts a life is lost
- upon losing a life positions for everything reset
- food eaten is not reset
- there a four larger energizer pellets
- these cause the ghost to enter a frightened state
- while in that state pacman can eat the ghosts
- this provides bonus points in the early stages of the game 
- when eaten the ghost is reset to the starting position
- there are 2 fruit in each level
- the first appears when pacman eats 70 of the dots
- the second appears when eaten 170
- the map is always the same
- there tunnels which are used as shortcuts to the other side
- pacman and ghost can use them
- progression is made by changing the speed of pacman and ghost behaviour/speed
- no change after level 21

# ghost behaviour

- one ghost starts in the maze, the rest are in the ghost house
- ghost begin by leaving and turning left
- when ghosts are eaten there eyes make there way back to the ghost house
- to exit  Pinky, then Inky, and then Clyde.
- they each have a preference of order and dot counter
- when one ghost leaves, another activates its counter

# ghost leaving the house 

- Inky has a limit of 30 dots, and Clyde has a limit of 60. This results in Pinky exiting immediately which, in turn, activates Inky's dot counter. His counter must then reach or exceed 30 dots before he can leave the house.

- Once Inky starts to leave, Clyde's counter (which is still at zero) is activated and starts counting dots. When his counter reaches or exceeds 60, he may exit. On the second level, Inky's dot limit is changed from 30 to zero, while Clyde's is changed from 60 to 50. Inky will exit the house as soon as the level begins from now on.

- Starting at level three, all the ghosts have a dot limit of zero for the remainder of the game and will leave the ghost house immediately at the start of every level.

- if pacman doesnt eat a dot for four seconds the next ghost is released
- 3 seconds after level 5

# movement around the game board

- the game board is 28 x 36 tiles
- pacman is actually larger than a tile and occupies, 
- the center point is which tile he occupies
- the ghost always have a target tile
- they have 3 states , chase, scatter and frightened
- in chase the puruse pacman
- in scatter they try to reach an in accessible tile at corresponding corners for each ghost
- in frightened they are much slower and take random turns at each intersection
- in later levels frightened is shorter and evel ater eliminated
- the ghost switch between chase and scatter on a timer
- this happens  max four times until reset when a life is lost
- timer and counter is the n reset
- the ghost start in start in scatter

- first level
Scatter for 7 seconds, then Chase for 20 seconds.
Scatter for 7 seconds, then Chase for 20 seconds.
Scatter for 5 seconds, then Chase for 20 seconds.
Scatter for 5 seconds, then switch to Chase mode permanently.

- the ghost calc one step at a time
- ghost can go back the way they came
- when changing state they always go back
- they dont go back when changing to frightened
- ghost decide when reaching an intersection
- the calulation is made in a straight line to the target tile
- move to whichever tile puts them closer
- if the tile are uqual distance 
- the decision between them is made in the order of up > left > down. 
- there are four tiles where the ghosts and only move left to right and vice versa
- this does not apply to frightened mode

# ghost personalities

- during scatter each goes will have a target tile just outside there corner
- each ghost has there own personality that effect tile targeting
