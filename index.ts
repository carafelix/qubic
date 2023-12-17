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
    /**
     *  All check functions MUST NOT be called with any other parameter higher than this.length
     * 
     * @param playerMarker player who is being checked if wins or almost wins
     * @param sizeCheck if === `this.length` means it's checking for a Win. `this.length - 1` means it's checking if it's placement away from wining
     * @returns boolean and position in the form of : {flor,row,col}
     */

    check3D_ToptoBot_WinOrAlmostWin = (playerMarker : Marker, sizeCheck = this.length) => {
        const mask = this.stringMask();
        const verticalStraights : string[] = new Array(this.area).fill('')

        for(let i = 0; i < mask.length; i++){
            verticalStraights[i%this.area] += mask[i];
        }
        
        const winOrAlmostWinCondition = new RegExp(`(?:${playerMarker}.*?){${sizeCheck},}`)
        let meetsCondition = false;
        let foundInIndex : undefined | Coordinate2D; // 2Dcoord since straight vertical goes trough floors

        for(let i = 0; i < verticalStraights.length; i++){
           if(winOrAlmostWinCondition.test(verticalStraights[i])){
            meetsCondition = true;
            foundInIndex = {row: Math.floor(i / this.length) , col: i % this.length };
           }
        }

        return {
            meetsCondition,
            foundInIndex
        }
        
    }

    check3D_row_WinOrAlmostWin = (playerMarker : Marker, sizeCheck = this.length) => { 
        const mask = this.stringMask();
        const consecutive3Drow : string[] = new Array(this.area).fill('') // do not use for loop. regex should cut it 

        // compose a regex for Lrow
        let L_row = '';
        let R_row = '';
        for(let i = 0, j = 1; i < sizeCheck - 1; i++, j++){
            L_row += '.'.repeat(i) + playerMarker + '.'.repeat(this.area - j) 
            R_row += '.'.repeat(sizeCheck - j) + playerMarker + '.'.repeat(this.area - (sizeCheck - j+1))
        }

        const L_regEx = new RegExp(L_row + '.'.repeat(sizeCheck - 1 ) + playerMarker,'gm')
        const R_regEx = new RegExp(R_row + playerMarker, 'gm')

        return (L_regEx.test(mask) || R_regEx.test(mask))

    }

    check3D_col_WinOrAlmostWin = (playerMarker : Marker, sizeCheck = this.length) => {

    }

    check3D_OpositeCorners_DiagonalWinOrAlmostWin = (playerMarker : Marker, sizeCheck = this.length) => {

        const condition =  playerMarker.repeat(sizeCheck);
        
        let TL_diag = ''
        let TR_diag = ''
        let BL_diag = ''
        let BR_diag = ''
        for(let i = 0; i < this.length; i++){
            TL_diag += this[i][i][i]
        }
        for(let i = 0, j = this.length - 1; i < this.length; i++, j--){
            TR_diag += this[i][i][j]
        }
        for(let i = 0, j = this.length - 1; i < this.length; i++, j--){
            BL_diag += this[i][j][j]
        }
        for(let i = 0, j = this.length - 1; i < this.length; i++, j--){
            BR_diag += this[j][i][j]
        }

        if( TL_diag === condition ||
            TR_diag === condition ||
            BR_diag === condition ||
            BL_diag === condition   ){

                return true;
            }
        return false;
        
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

    displayInLog = () => {
        for(const floor of this.board){
            console.log(floor.join('\n').replace(/,/g,' '),'\n')
        }
    }
}


class gameFactory{
    // this should be used to choice between a game human vs human and a game human vs cpu
}


const g = new Game(4)



// g.displayInLog()
// console.log(g.board.stringMask())

console.log(g.board.check3D_row_WinOrAlmostWin('x'));



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
