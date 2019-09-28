![ga_cog_large_red_rgb](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png)

# pacman-clone

(logo here)

This was a project assigned to me by General Assembly during a software enginerring immersive course. The purpose of the project was to solidify the skills we learnt in the first 4 weeks by putting them to use in a project of our choice.

It is a pacman clone in which i attempted to recreate the original games logic using common web development technologies.

## Built With

1. HTML5
2. CSS3
3. JavaScript
4. GitHub

## Deployment

The game is deployed on GitHub pages and it can be found here- https://lloydnoone.github.io/pacman-clone/

## Getting Started

Use the clone button to download the game source code. Open the index.html file in your browser and the game should start, if not check console for any issues. The assets used in this game are stored in the assets folder. They inlcude gifs, png files and fonts.

## Game Architecture

The goal in pacman is for the player to collect all the pips to complete the level. While doing this the player has to avoid ghosts. if the ghosts catch the player it is game over.

(gif here)

The ghosts have 3 modes of movement. 

* Chase
  > In chase the ghosts target pacman by comapring their postion to pacmans position on the gameboard in a staight line. This means they sometimes go the wrong way and is an intentional part of the game mechanics.
  
* scatter
  > In scatter, the ghosts will go to there respective corner and circle around until after a few seconds they put back in chase mode.
  
* frightened 
  > firghtened mode is activated when pacman eats the larger energizer dots. In this mode the ghosts take random turns and      move more slowly. This gives pacman a chance to chase down the ghosts and eat them for extra points.
  
A timer changes the ghosts from chase to scatter. because of this the ghosts attack in waves. The time remaining in each mode is remembered during frightened mode so that they go back to there previous state and carry on where they left off.

an example of the ghosts movement function-

(code screenshot here)

Upon eating all the pips, the player wins and is moved on to the next level. The stage is the same but the ghosts will now be moving faster. the ghosts speed will increase everytime the stage is cleared. 

(gif of game win and next level)

## Challenges and future improvements

The main challenge of the project was to create a ghost AI that was similair to the original pacman. I recreated this in much the same way by giving the ghosts the ability to change targe tiles depending on which mode they are in. 

The part where i spent the most time and had the most difficulty was organizing the timers and intervals which control these states. They switch back and forth and are interupted by the frightened state and should resume where they left off. The functions handling this are complicated and need refactoring somehow.

The main future improvement for the project would be to expand on the level editor that i created for my own convenience. It would be a great idea to make this more user friendly and accesible to users. This would give a whole new feature where players could make there own stages for the game and save them.

(level editor gif goes here)

## Author 

Lloyd Noone - portfolio: lloydnoone.com
