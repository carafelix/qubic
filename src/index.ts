export class Floor extends Array<string[]>{

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

export class full3Dboard extends Array<Floor>{

    area = this.length * this.length

    /**
     * @param playerMarker player who is being checked if wins or almost wins
     * @param sizeCheck if === `this.length` means it's checking for a Win. 
     *                  `this.length - n` means it's checking for consecutive marks of n.
     *                  It does not account for ex: xx.x or x.xx if gridSize is 4 and sizeCheck is 3
     * 
     * @returns boolean and position in the form of : {flor,row,col}
     */

    check3D_TpotoBotVertical_Win = (playerMarker : Marker, sizeCheck = this.length) => {
        const mask = this.stringMask();
        const verticalStraights : string[] = new Array(this.area).fill('')

        for(let i = 0; i < mask.length; i++){
            verticalStraights[i%this.area] += mask[i];
        }
        
        const winCondition = new RegExp(`(?:${playerMarker}.*?){${sizeCheck},}`)
        let meetsWinCondition = false;

        let foundInIndex : undefined | Coordinate2D; // 2Dcoord since straight vertical goes trough floors

        for(let i = 0; i < verticalStraights.length; i++){
           if(winCondition.test(verticalStraights[i])){
            meetsWinCondition = true;
            // foundInIndex = {row: Math.floor(i / this.length) , col: i % this.length };
           }
        }

        return meetsWinCondition
        
    }

    check3D_row_Win = (playerMarker : Marker, sizeCheck = this.length) => { 
        const mask = this.stringMask();

        // compose a regex for Left to Right row's and vice-versa

        let L_row = '';
        let R_row = '';
        for(let i = 0, j = 1; i < sizeCheck - 1; i++, j++){
            L_row += '.'.repeat(i) + playerMarker + '.'.repeat(this.area - j) 
            R_row += '.'.repeat(sizeCheck - j) + playerMarker + '.'.repeat(this.area - (sizeCheck - j+1))
        }

        const L_regEx = new RegExp(L_row + '.'.repeat(sizeCheck - 1 ) + playerMarker, 'gm')
        const R_regEx = new RegExp(R_row + playerMarker, 'gm')

        return (L_regEx.test(mask) || R_regEx.test(mask))

    }

    check3D_col_Win = (playerMarker : Marker, sizeCheck = this.length) => {
        const mask = this.stringMask();

         // compose a regex for Top to Bottom columns and vice-versa

         let T_row = '';
         let B_row = '';
         for(let i = 0, j = 1; i < sizeCheck - 1; i++, j++){
             T_row += '.'.repeat(i) + playerMarker + '.'.repeat(this.area - j) 
             B_row += '.'.repeat(sizeCheck - j) + playerMarker + '.'.repeat(this.area - (sizeCheck - j+1))
         }
 
         const T_regEx = new RegExp(T_row + '.'.repeat(sizeCheck - 1 ) + playerMarker, 'gm')
         const B_regEx = new RegExp(B_row + playerMarker, 'gm')
 
         return (T_regEx.test(mask) || B_regEx.test(mask))
 
    }

    check3D_OpositeCorners_DiagonalWin = (playerMarker : Marker, sizeCheck = this.length) => {

        const winCondition =  playerMarker.repeat(sizeCheck);
        
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

        if( TL_diag === winCondition ||
            TR_diag === winCondition ||
            BR_diag === winCondition ||
            BL_diag === winCondition   ){

                return true;
            }
        return false;
        
    }

    stringMask = () => {
        return this.join('').replace(/,/g, '')
    }
};

type Marker = 'x' | 'o';
interface Coordinate2D {
    row: number,
    col: number
}
interface Coordinate3D extends Coordinate2D {
    floor: number
}


interface Player{
    marker: Marker
    parentGame : Game
    plays(desiredPlay : Coordinate3D): void
}

export class HumanPlayer implements Player{
    constructor(
        public marker: Marker,
        public parentGame: Game
    ){}

    plays(desiredPlay : Coordinate3D) {
        this.parentGame.turnPlayHandler(desiredPlay, this)
    }
}

export class CPU_Player extends HumanPlayer{

}

export class Game{
    public board : full3Dboard // must be private on production!
    private playerInTurn : Player
    private finish : boolean
    public playerOne : Player
    public playerTwo : Player
    constructor(
        private gridSize : number,
        private cpuGame? : boolean,
        private cpuFirst? : boolean
    ){
        this.finish = false;
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

        this.playerInTurn = this.playerOne
    }

    private setPlayIntoBoard = (played : Coordinate3D, from : Player) => {
        this.board[played.floor][played.row][played.col] = from.marker
        return this
    }

    getSpotOnBoard = (coord : Coordinate3D) => {
        return this.board[coord.floor][coord.row][coord.col]
    }

    turnPlayHandler = (played : Coordinate3D, from : Player) => {
        if(this.playerInTurn === from && this.checkPlaySpotIsEmpty(played)){
            this.setPlayIntoBoard(played, from)
            this.switchPlayerTurn()
            this.updateUI()
        }
    }

    getPlayerInTurn = () => {
        return this.playerInTurn
    }

    checkPlaySpotIsEmpty = (coord : Coordinate3D) => {
        return (this.board[coord.floor][coord.row][coord.col] === '.')
    }

    updateUI = () => {
        this.displayInLog()
    }

    private switchPlayerTurn = () => {
        (this.playerInTurn === this.playerOne) ? this.playerInTurn = this.playerTwo : this.playerInTurn = this.playerOne
    }

    displayInLog = () => {
        for(const floor of this.board){
            console.log(floor.join('\n').replace(/,/g,' '),'\n')
        }
    }

    isFinish = () => {
        return this.finish
    }
}



export const g = new Game(4)


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
