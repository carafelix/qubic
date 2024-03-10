# Qubic
n\*n\*n tic-tac-toe

## Considerations

I wanted the algorithm to be applicable not only for n < 6 boards, so it would be _board size agnostic._ 
This resulted in a less optimal algorithm but fairly applicable for a good amount of sizes. It's decently playable up to n = ~20. (Except because, _for the time being,_ the first move it's double the amount of a normal move).

Since the number of permutations is: 3^(n^3), 3 states for each point in the space and 3 dimensions, respectably, and the search space for miniMax algorithm is: O ( (Branching Factor) ^ depth ):
with Branching Factor being n^3 initially, and for each move that is played on the board it's reduced by 1.

So a miniMax solution is not ideal. I tried to make an evaluation function based on the same principle of "value of a point convergence" and then reduce the whole board into a value. With no much success.  

## Algorithm's

### First iteration is greedy.

As you can see from the following table it doesn't perform as good, since for solved n, p1 should always win. As of my knowledge n = 3 and n = 4 are solved. Ties are not possible as per [Hales–Jewett theorem.](https://en.wikipedia.org/wiki/Hales%E2%80%93Jewett_theorem). The following games results is playing against itself:

|       | P1 Wins | P2 Wins | Iterations |
|-------|---------|---------|------------|
| n = 3 | 96.5%   | 3.5%    | 20000      |
| n = 4 | 49.6%   | 50.4%   | 10000      |
| n = 5 | 79.4%   | 20.6    | 2000       |
| n = 6 | 9%      | 91%     | 1000       |
| n = 7 | 96.3%   | 3.7%    | 300        |

To given an idea of the algorithm strength, the following table represents its performance against a completely dumb AI, playing random moves on each turn. In this case data is shown as raw numbers since it is very close to a 100% win ratio for the non-dumb player:

|       | P1 Wins | P2 Wins | Dumb |
|-------|:-------:|:-------:|:----:|
| n = 3 | 19999   | 1       | P2   |
| n = 4 | 9987    | 13      | P2   |
| n = 5 | 4996    | 4       | P2   |
| n = 6 | 993     | 7       | P2   |
|-------|---------|---------|------|
| n = 3 | 35      | 19965   | P1   |
| n = 4 | 21      | 9979    | P1   |
| n = 5 | 6       | 4994    | P1   |
| n = 6 | 0       | 1000    | P1   |


### The algorithm works in the following manner:
    - If a winning move exist, play it
    - If opponent have a winning move next turn, block it
    - Else
        - Get a random point which is available to be played in
        - Check for all other points in the 3D space and compare which has the greatest amount of confluence abroad all lines which has this player markers
        - Ignore all lines which cannot lead to scoring
        - Count each marker and sum up all lines to give that point a final value
        - If a point as greater convergence than the currently selected point make that the new point
        - Play the point with the greatest value

- Up to further investigation I have found the following weaknesses: 
    - [_In the early game, both players (should) try to occupy points which increase their potential for creating threats, without actually executing those threats._](http://fragrieu.free.fr/SearchingForSolutions.pdf) page 98, chapter 4.
    - It does't prevent falling into a forcing losing sequences of moves
    - It's always trying to execute it's threats, and therefore failing to get strong influence across the board, minimizing it's remaining attacking sequences.

### Second Iteration

- add a check for: if tentative move leads into opponent having a winning move (a move that we must block), skip that tentative move. maybe allowable in certain depth? maybe scan for the sequence forcing moves if it leads to opponent winning?

## CLI Game Mode
- run ```git checkout main```
- run ```ts-node-esm ./src/cli-game.ts```

## Test's
- uncomment the desired [test's](src/test/game.spec.ts)
- run ```npm run tests```

### Disclaimers
- Urges a code refactor:
    - GUI split into single responsability objects
    - Make Game and Players objects independant of each other
- I want to eventually re-take this project back and implement a second more optimal algorithm.
- project on stand-by until further notice

### to-do
- On top of the 2D stacked planes I want to render a Three.js Cube representation of the board, for it to be really a 3D game.
- make a log control to display only the X amount of moves per page, and and let you see the past state
