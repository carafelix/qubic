type Marker = 'x' | 'o';
interface Coordinate2D {
    row: number,
    col: number
}
interface Coordinate3D extends Coordinate2D {
    floor: number
}

interface Play extends Coordinate3D {
    player: Marker
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
        let foundInIndex : undefined | Coordinate2D; // 2Dcoord since straight vertical goes trough floors

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
};

interface Player{
    marker: Marker
    plays(row :number, col :number, floor :number): Play
}

class HumanPlayer implements Player{
    constructor(
        public marker: Marker
    ){}

    plays(row :number, col :number, floor :number): Play {
        return {
            row,
            col,
            floor, 
            player: this.marker
        }
    }
}

class Game {
    private board : full3Dboard

    constructor(
        private gridSize : number,
    ){
        this.board = ( (size) => {
            const _ = new Floor();
            const board = new full3Dboard(size).fill(_).map(
                                            _=>new Floor(size).fill([]).map(
                                                floor=>new Array(size).fill(null).map(row=>'.')
                                            ) as Floor
            ) as full3Dboard
    
            return board

        })(this.gridSize);
    }
}


class gameFactory{
    // this should be used to choice between a game human vs human and a game human vs cpu
}


console.log(new Game(3))



;
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
