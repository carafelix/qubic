// definition for playing on a 3x3x3 or 4x4x4, 5x5x5, etc.
const gridSize = 4;

const xWinCondition = 'xxxx'; // 1 = x
const oWinCondition = 'oooo'; // 2 = o

type Marker = 'x' | 'o';
interface coordinate2D {
    row: number,
    col: number
}
interface coordinate3D extends coordinate2D {
    floor: number
}

class Floor extends Array<string[]>{

    // an alternative check function but be done that also checks for this,length-1 markers, meaning in that row/col/diag only 1 marker is left to win

    checkRowWin = (playerMarker : Marker) => {
        return new RegExp(`${playerMarker.repeat(this.length)}`).test(this.stringFloorMask())
    }

    checkColumnWin = (playerMarker : Marker) => {
        const pattern = (playerMarker + '.'.repeat(this.length)).repeat(this.length-1) + playerMarker
        return new RegExp(pattern).test(this.stringFloorMask())
    }

    checkLeftDiagonalWin = (playerMarker : Marker) => {
        const pattern = (playerMarker + '.'.repeat(this.length+1)).repeat(this.length-1) + playerMarker
        return new RegExp(pattern).test(this.stringFloorMask())
    }

    checkRightDiagonalWin = (playerMarker : Marker) => {
        const pattern = (playerMarker + '.'.repeat(this.length-1)).repeat(this.length-1) + playerMarker
        return new RegExp(pattern).test(this.stringFloorMask())
    }

    stringFloorMask = () => {
        return this.join('-').replace(/,/g, '')
    }
    
}

class full3Dboard extends Array<Floor>{

    area = this.length * this.length

    check3DStraightVerticalWinOrAlmostWin = (playerMarker : Marker, sizeCheck = this.length) => {
        const mask = this.stringMask();
        const straights : string[] = new Array(this.area).fill('')

        for(let i = 0; i < mask.length; i++){
            straights[i%this.area] += mask[i];
        }
        
        const condition = new RegExp(`(?:${playerMarker}.*?){${sizeCheck},}`)
        let meetsCondition = false;
        let foundInIndex : undefined | coordinate2D; // 2Dcoord since straight vertical goes trough floors

        for(let i = 0; i < straights.length; i++){
           if(condition.test(straights[i])){
            meetsCondition = true;
            foundInIndex = {row: Math.floor(i / this.length) , col: i % this.length };
           }
        }

        return {
            meetsCondition,
            foundInIndex
        }
        
    }

    check3DrowDiagonalWin = () => {
        const mask = this.stringMask();

    }

    check3DcolDiagonalWin = () => {

    }

    check3DdiagDiagonalWin = () => {

    }

    stringMask = () => {
        return this.join('').replace(/,/g, '')
    }
}


const gameBoard : full3Dboard = ( (size) => {

    const _ = new Floor();
    const board = new full3Dboard(size).fill(_).map(
                                    _=>new Floor(size).fill([]).map(
                                        floor=>new Array(size).fill(null).map(row=>'.')
                                    ) as Floor
    ) as full3Dboard

    return board

})(gridSize);

gameBoard[0][0][0] = 'x'
gameBoard[1][0][0] = 'x'
gameBoard[2][0][0] = 'x'
gameBoard[3][0][0] = 'x';

console.log(gameBoard.check3DStraightVerticalWinOrAlmostWin('x',4));




`
         ________________
        /   /   /   /   /|
       /___/___/___/___/ |
      /   /   /   /   /  |
     /___/___/___/___/   |
    /   /   /   /   /    |
   /___/___/___/___/     |
  /   /   /   /   /      |
 /___/___/___/___/       |
|       |________|_______|
|       /   /   /|  /   /|
|      /___/___/_|_/___/ |
|     /   /   /  |/   /  |
|    /___/___/___|___/   |
|   /   /   /   /|  /    |
|  /___/___/___/_|_/     |
| /   /   /   /  |/      |
|/___/___/___/___|       |
|       |________|_______|
|       /   /   /|  /   /|
|      /___/___/_|_/___/ |
|     /   /   /  |/   /  |
|    /___/___/___|___/   |
|   /   /   /   /|  /    |
|  /___/___/___/_|_/     |
| /   /   /   /  |/      |
|/___/___/___/___|       |
|       |________|_______|
|       /   /   /|  /   /
|      /___/___/_|_/___/
|     /   /   /  |/   /
|    /___/___/___|___/
|   /   /   /   /|  /
|  /___/___/___/_|_/
| /   /   /   /  |/
|/___/___/___/___|
`
