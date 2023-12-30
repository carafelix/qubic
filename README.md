# qubic
n\*n\*n tic-tac-toe

## Considerations

I wanted the algorithm to be applicable not only for n < 6 boards. So it would be _board size agnostic,_ this resulted in a less optimal algorithm but fairly applicable for a good amount of sizes. It's decently playable up to n = ~20. (Except, _for the time being,_ the first move it's double the amount of a normal move).

Since the number of permutations is: 3^(n^3) a miniMax algorithm is not ideal. I tried to make an evaluation function based on the same principle of "value of a point convergence" and then reduce the whole board into a value. With no much success up to date.  

## Algorithm's

- First iteration of the algorithm is a greedy solution. As you can see from the following table it doesn't perform as good, since for solved n, p1 should always win. As of my knowledge n = 3 and n = 4 are solved. Ties are not possible as per [Hales–Jewett theorem.](https://en.wikipedia.org/wiki/Hales%E2%80%93Jewett_theorem). All games are cpu vs cpu, both using the same algorithm.

|       | P1 Wins | P2 Wins | Iterations |
|-------|---------|---------|------------|
| n = 3 | 96.5%   | 3.5%    | 20000      |
| n = 4 | 49.6%   | 50.4%   | 10000      |
| n = 5 | 79.4%   | 20.6    | 2000       |
| n = 6 | 9%      | 91%     | 1000       |
| n = 7 | 96.3%   | 3.7%    | 300        |

### The algorithm works in the following manner:
    - If a winning move exist, play it
    - If opponent have a winning move next turn, block it
    - Else
        - get a random point which is available to be played in
        - check for all other points in the 3D space and compare which has the greatest amount of confluence abroad all lines which has this player markers, ignoring lines which cannot lead to scoring, and counting each marker and sum up all lines to give that point a final value, if a point as greater convergence than the currently selected point, make that the new point A.K.A the tentative move.
        - play the move with the greatest value

- It has the following weaknesses: 
    - [_In the early game, both players try to occupy points which increase their potential for creating threats, without actually executing those threats._](http://fragrieu.free.fr/SearchingForSolutions.pdf) page 98, chapter 4.
    - It does't prevent falling into a bad sequences of moves
    - It's always trying to execute it's threats, and therefore failing to get strong influence across the board, minimizing it's remaining attacking sequences.


## CLI Game Mode
- run ```ts-node-esm ./src/cli-game.ts```

## Test's
- uncomment the desired [test's](src/test/game.spec.ts)
- run ```npm run tests```

### Disclaimers
- Urges a code refactor
- I want to eventually re-take this project back and implement a second more optimal algorithm.
- On top of the 2D stacked planes I want to render a Three.js Cube representation of the board, for it to be really a 3D game. 
