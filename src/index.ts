import { select , input } from "@inquirer/prompts"

export class full3Dboard extends Array<Array<Array<string>>>{

    area = this.length * this.length

    constructor(size : number){
        const board = [];

        for (let i = 0; i < size; i++) {
            const floor = [];

            for (let j = 0; j < size; j++) {
            const row = [];

            for (let k = 0; k < size; k++) {
                row.push('.');
            }
            floor.push(row);
            }
            board.push(floor);
        }
        super(...board) 
    }

    /**
     * @param playerMarker player who is being checked if wins or almost wins
     * @param sizeCheck if === `this.length` means it's checking for a Win. 
     *                  `this.length - n` means it's checking for consecutive marks of n.
     *                  It does not account for ex: xx.x or x.xx if gridSize is 4 and sizeCheck is 3
     * 
     * @returns boolean and position in the form of : {flor,row,col}
     */

    // check3D_TpotoBotVertical_Win = (playerMarker : Marker, mask = this.stringMask(), sizeCheck = this.length) => {
    //     const verticalStraights : string[] = new Array(this.area).fill('')

    //     for(let i = 0; i < mask.length; i++){
    //         verticalStraights[i%this.area] += mask[i];
    //     }
        
    //     const winCondition = new RegExp(`(?:${playerMarker}.*?){${sizeCheck},}`)
    //     let meetsWinCondition = false;

    //     let foundInIndex : undefined | Coordinate2D; // 2Dcoord since straight vertical goes trough floors

    //     for(let i = 0; i < verticalStraights.length; i++){
    //        if(winCondition.test(verticalStraights[i])){
    //         meetsWinCondition = true;
    //         // foundInIndex = {row: Math.floor(i / this.length) , col: i % this.length };
    //        }
    //     }

    //     return meetsWinCondition
        
    // }

    // check3D_row_Win = (playerMarker : Marker, mask = this.stringMask(), sizeCheck = this.length) => { 

    //     // compose a regex for Left to Right row's and vice-versa

    //     let L_row = '';
    //     let R_row = '';
    //     for(let i = 0, j = 1; i < sizeCheck - 1; i++, j++){
    //         L_row += '.'.repeat(i) + playerMarker + '.'.repeat(this.area - j) 
    //         R_row += '.'.repeat(sizeCheck - j) + playerMarker + '.'.repeat(this.area - (sizeCheck - j+1))
    //     }

    //     const L_regEx = new RegExp(L_row + '.'.repeat(sizeCheck - 1 ) + playerMarker, 'gm')
    //     const R_regEx = new RegExp(R_row + playerMarker, 'gm')

    //     return (L_regEx.test(mask) || R_regEx.test(mask))

    // }

    // check3D_col_Win = (playerMarker : Marker, mask = this.stringMask(), sizeCheck = this.length) => {
    //      // compose a regex for Top to Bottom columns and vice-versa

    //      let T_row = '';
    //      let B_row = '';
    //      for(let i = 0, j = this.length - 1; i < sizeCheck; i++, j--){
    //          T_row += '.'.repeat(this.length * i) + playerMarker + '.'.repeat((this.area - (this.length * i)) - 1) 
    //          B_row += '.'.repeat(this.length * j) + playerMarker + '.'.repeat((this.length * (i+1)) - 1)
    //     }
 
    //      const T_regEx = new RegExp(T_row.slice(0, mask.length - (this.length - 1)), 'gm')
    //      const B_regEx = new RegExp(B_row.replace(/\./g,' ').trim().replace(/\s/g, '.'), 'gm')
 
    //      return (T_regEx.test(mask) || B_regEx.test(mask))
 
    // }

    // check3D_OpositeCorners_DiagonalWin = (playerMarker : Marker, mask = this.stringMask(), sizeCheck = this.length) => {

    //     const winCondition =  playerMarker.repeat(sizeCheck);
        
    //     let TL_diag = ''
    //     let TR_diag = ''
    //     let BL_diag = ''
    //     let BR_diag = ''
        
    //     for(let i = 0, j = this.length - 1; i < this.length; i++, j--){
    //         TL_diag += this[i][i][i]
    //         TR_diag += this[i][i][j]
    //         BL_diag += this[i][j][j]
    //         BR_diag += this[j][i][j]
    //     }

    //     if( TL_diag === winCondition ||
    //         TR_diag === winCondition ||
    //         BR_diag === winCondition ||
    //         BL_diag === winCondition   ){

    //             return true;
    //         }
    //     return false;
        
    // }
    stringMask = () => {
        const s = []
        for(let i = 0; i < this.length; i++){
            s.push(this[i].join('-').replace(/,/g, ''))
        }
        return s.join('|').replace(/,/g, '')
    }
    stringUnmask = (maskedBoard : string) => {
        return maskedBoard.split('|').map(floor=>floor.split('-').map((row)=>row.split('')))
    }

    // checkAllFloors = (playerMarker : Marker, state : string) => {
    //     let win;
    //     const floors = state.
    //     for(const floor of f){
    //         if (floor.checkRowWin(playerMarker, state) ||
    //         floor.checkColumnWin(playerMarker, state) ||
    //         floor.checkLeftDiagonalWin(playerMarker, state) ||
    //         floor.checkRightDiagonalWin(playerMarker, state)){
    //             win = true
    //         }
    //     }
    //     return win
    // }

    // laConchetumare = () => {
    //     checkRowWin = (playerMarker : Marker, state = this.stringFloorMask()) => {
    //         return new RegExp(`${playerMarker.repeat(this.length)}`).test(state)
    //     }
    
    //     checkColumnWin = (playerMarker : Marker, state = this.stringFloorMask()) => {
    //         const pattern = (playerMarker + '.'.repeat(this.length)).repeat(this.length-1) + playerMarker
    //         return new RegExp(pattern).test(state)
    //     }
    
    //     checkLeftDiagonalWin = (playerMarker : Marker, state = this.stringFloorMask()) => {
    //         const pattern = (playerMarker + '.'.repeat(this.length+1)).repeat(this.length-1) + playerMarker
    //         return new RegExp(pattern).test(state)
    //     }
    
    //     checkRightDiagonalWin = (playerMarker : Marker, state = this.stringFloorMask()) => {
    //         const pattern = (playerMarker + '.'.repeat(this.length-1)).repeat(this.length-1) + playerMarker
    //         return new RegExp(pattern).test(state)
    //     }
    
    //     stringFloorMask = () => {
    //         return this.join('-').replace(/,/g, '')
    //     }
    // }
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

        const validDelimiter = new RegExp(/^(\d{1,}\s\d{1,}\s\d{1,})$/m)

        while(!play){
            try {
                playInput = prompt(`${this.name} Please input your play in the format of Z Y X, delimited by a space`);
            } catch {
                playInput = await input({message: `${this.name} Please input your play in the format of Z Y X, delimited by a space`})
            }
            if(!playInput || !validDelimiter.test((playInput.trim()))) {
                console.log('Input is not in the valid format, try again');
                continue
            };

            play = this.validStringToPlay((playInput.trim()))
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
        /**
         * 
         *      Needed Functions:  General functions that reduce each f(board) and return the representation reduced value
         *      
         *      -  f(board) that assigns each spot a value depending on how close to the center it is. Basically a impra 
         *              Dependencies: - stringMask & stringUnmask.
         *              Must: ensure that in each floor the center is more valuable and that
         *                    for each flor more closer to the 3D center it gets more value
         *              
         *          This can be also be updated based on state like the battleships heatmap
         * 
         *          JUST USE A MANHATAN DISTANCE ON RUNTIME
         * 
         * 
         *      - f(board) that returns a representation for each spot actual sumed ocurrence count in all lines
         *              Dependecies: F() that check a spot and return its count using vector3 directions  
         * 
         *              It is better to just use a fuction that count each line and assign it to a obj?
         *              or
         *              asign each spot a value and then reduce the whole thing?
         * 
         *      - eval()
         *      - minmax() whit alpha-beta pruning and depth set
         *      - A dictionary recording visited states of the board and 
         *          inside minimax if that board its already visited just return the last evaluation
         * 
         *      - f() that recognize a winning move by playerInTurn and playerOpponent
         *              Dependencies: each spot ocurrence count f(), using it if any spot has an ocurrence of 3 and its an empty spot, that spot it's a winning spot
         * 
         *      
         *      Flow:
         * 
         *      - If you have a play that win's the game, play that move
         *      - If your opponent have a play that win's the game, block that move
         *      - else run minmax
         * 
         */
        
        this.asumeTurnBasedOnGameState(this.parentGame.board.stringMask())
        

        return {
            floor: Math.floor(Math.random()*this.parentGame.board.length),  // stupid ia
            row: Math.floor(Math.random()*this.parentGame.board.length),
            col: Math.floor(Math.random()*this.parentGame.board.length)
        }
    }

    private minMax(state : string, depth : number, maximizingPlayer : boolean){

    }

    private asumeTurnBasedOnGameState(state : string) : Marker{
        const xes = state.split('').filter((v)=>v === 'x').length
        const os = state.split('').filter((v)=>v === 'o').length

        if(xes === os){
            return 'x'
        } else {
            return 'o'
        }
    }

    private eval( state : string ){  // state should be converted to a game board when vector checks are implemented
        // x would be the maximaxing
        // o would be the minimizing

        // if(this.parentGame.checkWin('x', state))
    }

    private getAllChildStates(){

    }
    
    /**
     * this map is indeed not required. its only needed to calculate ManhatanDistance for each spot in runtime
     * would leave this here for the time being for ilustrating the usage
     * memory heap is huge
     */

    private mapCentreImportance() { 
        const l = this.parentGame.board.length
          let board = ''
          for (let i = 0; i < l; i++) {
            for (let j = 0; j < l; j++) {
              for (let k = 0; k < l; k++) {
                const distance = this.calculateManhattanDistance(i, j, k);
                board += `_${Math.abs(distance - (l - 1))}`
              }

              if (j < l - 1) {
                board += '/';
              }
            }
            if (i < l - 1) {
                board += '\n';
              }
          }

          const mappedBoardToCenterImportance = board.split('\n').map(row=>row.split('/').map(col=>col.split('_').filter(v=>v)))
          
          return mappedBoardToCenterImportance
    }

    private calculateManhattanDistance(x: number, y: number, z: number, n: number = this.parentGame.board.length) {
        const center = {
          x: Math.floor(n / 2),
          y: Math.floor(n / 2),
          z: Math.floor(n / 2),
        };
    
        // Adjust center for even n
        if (n % 2 === 0) {
          center.x -= 1;
          center.y -= 1;
          center.z -= 1;
          
          // Reflect coordinates
          x = Math.min(x, n - 1 - x);
          y = Math.min(y, n - 1 - y);
          z = Math.min(z, n - 1 - z);
        }
    
        return Math.abs(z - center.z) + Math.abs(y - center.y) + Math.abs(x - center.x);
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
        if(this.gridSize < 3) this.gridSize = 3;
        this.finish = false;
        this.board = new full3Dboard(gridSize)

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
        // this.displayInLog()
    }

    private switchPlayerTurn = () => {
        (this.playerInTurn === this.playerOne) ? this.playerInTurn = this.playerTwo : this.playerInTurn = this.playerOne
    }

    displayInLog = () => {
        for(const floor of this.board){
            console.log(floor.join('\n').replace(/,/g,' '),'\n')
        }
    }

    checkWin = (player : Marker, state = this.board.stringMask()) => {

        // for n = 50 it throws `Regular expression too large` so all this must be changed
        
        // if (
        //     this.board.check3D_OpositeCorners_DiagonalWin(player, state) ||
        //     this.board.check3D_TpotoBotVertical_Win(player, state) ||
        //     this.board.check3D_col_Win(player, state) ||
        //     this.board.check3D_row_Win(player, state) ||
        //     this.board.checkAllFloors(player, state)
        // ){
        //     this.finish = true;
        //     this.winner = p
        // }
    }
    
    checkSpotCount = (position : Coordinate3D) => {
    
        const checkDirections = [
            [ 1,  0,  0 ],
            [ 0,  1,  0 ],
            [ 0,  0,  1 ],
            [ 1,  1,  0 ],
            [ 1, -1,  0 ],
            [ 1,  0,  1 ],
            [ 1,  0, -1 ],
            [ 0,  1,  1 ],
            [ 0,  1, -1 ],
            [ 1,  1,  1 ],
            [ 1,  1, -1 ],
            [-1, -1,  1 ],
            [-1,  1,  1 ],
        ];

        for(const direction of checkDirections){
            const forward = [position.floor , position.row , position.col]
            const backward = [position.floor , position.row , position.col]
        }

    }

    isFinish = () => {
        return this.finish
    }

    setGameAsCPUOnly = () => {
        // next line doesn't allow for setting the game as cpu only after move already have been played
        if(this.board.stringMask().includes('o') || this.board.stringMask().includes('x')){
            return;
        }
        this.playerOne = new CPU_Player('x', this, 'cpu1');
        this.playerTwo = new CPU_Player('o', this, 'cpu2');
        this.playerInTurn = this.playerOne
    }  
}