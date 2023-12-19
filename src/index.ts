import { select , input } from "@inquirer/prompts"

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
         for(let i = 0, j = this.length - 1; i < sizeCheck; i++, j--){
             T_row += '.'.repeat(this.length * i) + playerMarker + '.'.repeat((this.area - (this.length * i)) - 1) 
             B_row += '.'.repeat(this.length * j) + playerMarker + '.'.repeat((this.length * (i+1)) - 1)
        }
 
         const T_regEx = new RegExp(T_row.slice(0, mask.length - (this.length - 1)), 'gm')
         const B_regEx = new RegExp(B_row.replace(/\./g,' ').trim().replace(/\s/g, '.'), 'gm')

         console.log(B_regEx);
         
 
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
    stringUnmask = (maskedBoard : string) => {
        
    }

    checkAllFloors = (playerMarker : Marker) => {
        let win;
        for(const floor of this){
            if (floor.checkRowWin(playerMarker) ||
            floor.checkColumnWin(playerMarker) ||
            floor.checkLeftDiagonalWin(playerMarker) ||
            floor.checkRightDiagonalWin(playerMarker)){
                win = true
            }
        }
        return win
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
    marker : Marker
    parentGame : Game
    name : string
    plays(desiredPlay : Coordinate3D): void
    getPlay() : Coordinate3D | Promise<Coordinate3D>
}

export class HumanPlayer implements Player{

    constructor(
        public marker: Marker,
        public parentGame: Game,
        public name: string
    ){}

    plays = (desiredPlay : Coordinate3D) => {
        this.parentGame.turnPlayHandler(desiredPlay, this)
    }

    public async getPlay() : Promise<Coordinate3D> {

        let play;
        let playInput;
        const l = this.parentGame.board.length
        
        const validDelimiter = new RegExp(`^(\\d{1,}\\s){${l-1}}\\d{1,}$` , 'm')

        while(!play){
            try {
                playInput = prompt(`${this.name} Please input your play in the format of Z Y X, delimited by a space`);
            } catch {
                playInput = await input({message: `${this.name} Please input your play in the format of Z Y X, delimited by a space`})
            }
            if(!playInput || !validDelimiter.test((playInput))) {
                console.log('Input is not in the valid format, try again');
                continue
            };

            play = this.validStringToPlay((playInput))
            if(!this.parentGame.checkPlaySpotIsEmpty(play)){
                console.log('Play spot is out of range or occuppied, try again');
                play = null
            }
        }

        return play

    }
    private validStringToPlay(str : string) : Coordinate3D {
        const ZXY = str.split(/\s/gm)
        return {
            floor: +ZXY[0]-1,
            row: +ZXY[1]-1,
            col: +ZXY[2]-1,
        }
    }
    
    setName(name : string){
        this.name = name;
    }
}

export class CPU_Player implements Player{
    constructor(
        public marker: Marker,
        public parentGame: Game,
        public name: string
    ){}

    plays = (desiredPlay : Coordinate3D) => {
        this.parentGame.turnPlayHandler(desiredPlay, this)
    }

    getPlay() : Coordinate3D{
        return {
            floor: 1,
            row: 1,
            col: 1
        }
    }
}

export class Game{
    public board : full3Dboard // must be private on production!
    private playerInTurn : Player
    private finish : boolean
    public playerOne : Player
    public playerTwo : Player
    public winner? : Player
    constructor(
        private gridSize : number,
        private cpuGame? : boolean,
        private cpuFirst? : boolean,
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

        this.playerOne = new HumanPlayer('x', this, 'p1')
        this.playerTwo = new HumanPlayer('o', this, 'p2')

        if(this.cpuGame && this.cpuFirst){
            this.playerOne = new CPU_Player('x',this, 'cpu');
        } else if (this.cpuGame){
            this.playerTwo = new CPU_Player('o',this, 'cpu');
        }

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
        return (this.board?.[coord.floor]?.[coord.row]?.[coord.col] === '.')
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

    checkWin = (p : Player) => {
        if (
            this.board.check3D_OpositeCorners_DiagonalWin(p.marker) ||
            this.board.check3D_TpotoBotVertical_Win(p.marker) ||
            this.board.check3D_col_Win(p.marker) ||
            this.board.check3D_row_Win(p.marker) ||
            this.board.checkAllFloors(p.marker)
        ){
            this.finish = true;
            this.winner = p
        }
    }

    isFinish = () => {
        return this.finish
    }

    setGameAsCPUOnly = () => {
        this.playerOne = new CPU_Player('x', this, 'cpu1');
        this.playerTwo = new CPU_Player('o', this, 'cpu2');
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
