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

    check3Drow_DiagonalWinOrAlmostWin = () => {
        const mask = this.stringMask();

    }

    check3Dcol_DiagonalWinOrAlmostWin = () => {

    }

    check3DX_DiagonalWinOrAlmostWin = () => {

    }

    stringMask = () => {
        return this.join('').replace(/,/g, '')
    }
};

interface Player{
    marker: Marker
    parentGame : Game
    plays(row :number, col :number, floor :number): Play
}

class HumanPlayer implements Player{
    constructor(
        public marker: Marker,
        public parentGame: Game
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

class CPU_Player extends HumanPlayer{

}

class Game{
    public board : full3Dboard // must be private on production!
    private turn : Player
    public playerOne : Player
    public playerTwo : Player
    constructor(
        private gridSize : number,
        private cpuGame? : boolean,
        private cpuFirst? : boolean
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

        this.playerOne = new HumanPlayer('x',this)
        this.playerTwo = new HumanPlayer('o',this)

        if(this.cpuGame && this.cpuFirst){
            this.playerOne = new CPU_Player('x',this);
        } else if (this.cpuGame){
            this.playerTwo = new CPU_Player('o',this);
        };

        this.turn = this.playerOne

    }

    setPlayIntoBoard = (played : Play) => {
        this.board[played.floor][played.row][played.col] = played.player
        return this
    }

    displayASCII = () => {
        for(const floor of this.board){
            console.log(floor.join('\n').replace(/,/g,' '),'\n')
        }
    }
}


class gameFactory{
    // this should be used to choice between a game human vs human and a game human vs cpu
}


const g = new Game(4)
g.board[0][0][0] = 'x'
g.board[1][1][1] = 'x'
g.board[2][2][2] = 'x'
g.board[3][3][3] = 'x'

g.displayASCII()


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
