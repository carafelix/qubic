import { select , input } from "@inquirer/prompts"


    // x would be the maximaxing. wants Infinity
    // o would be the minimizing. wants -Infinity


export class full3Dboard extends Array<Array<Array<string>>>{

    area = this.length * this.length

    // a lot of masking unmasking goes because of the way the functions are around this object.
    // if instead integrity is checked with a stringMask class it would not be necesarry to be masking and unmasking that much
    // I think any game state that is not stringified should be created using the new full3Dboard
    // Right now the board its composed at that lvl. Moving it out at the Game lvl would allow it to be used elsewhere

    stringMask = (state? : Array<Array<Array<string>>>) => {
        const boardState = (state || this)
        return new maskedBoard(boardState)
    }

    stringUnmask = (mask : maskedBoard) => {
        const board = mask.split('|').map(floor=>floor.split('-').map((row)=>row.split('')))
        return new full3Dboard(...board)
    }


    getSpot = (coord : Coordinate3D, state? : maskedBoard) => {
        if(state){
            const boardState = this.stringUnmask(state)
            if(!boardState) throw 'Something is wrong dude at getting the spot dude';

           return boardState[coord.floor][coord.row][coord.col]
        }
        return this[coord.floor][coord.row][coord.col]
    }
    
};


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

        return {
            floor: Math.floor(Math.random()*this.parentGame.board.length),  // stupid ia
            row: Math.floor(Math.random()*this.parentGame.board.length),
            col: Math.floor(Math.random()*this.parentGame.board.length)
        }
    }

    private minMax(state : maskedBoard, depth : number, maximizingPlayer : boolean){

    }

    private asumeTurnBasedOnGameState(state : maskedBoard) : Marker{
        const xes = state.split('').filter((v)=>v === 'x').length
        const os = state.split('').filter((v)=>v === 'o').length

        if(xes === os){
            return 'x'
        } else {
            return 'o'
        }
    }

    private eval( state : maskedBoard ){  // state should be converted to a game board when vector checks are implemented
       

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
    public finish : boolean // must be private
    public playerOne : Player
    public playerTwo : Player
    constructor(
        private gridSize : number,
        private cpuGame? : boolean,
        private cpuFirst? : boolean,
    ){
        if(this.gridSize < 3) this.gridSize = 3;
        this.finish = false;

        const initialBoard = [];

                for (let i = 0; i < gridSize; i++) {
                    const floor = [];

                    for (let j = 0; j < gridSize; j++) {
                    const row = [];

                    for (let k = 0; k < gridSize; k++) {
                        row.push('.');
                    }
                    floor.push(row);
                    }
                    initialBoard.push(floor);
                }

        this.board = new full3Dboard(...initialBoard)

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

    /**
     * 
     * Mask and unMask should be standarized. I think the best way is to use the constructor of full3DBoard and always use this
     * and pass states as full board objects, instead of strings that gets converted over and over
     * better try that and check the memory consumption
     * 
     * 
     * @param state if not provided it is set to actual game state. 
     * @param spot  if its provided player is inferred from the checked spot since it should only be called after a play 
     *  
     */
    checkTerminalState = (state? : maskedBoard, spot? : Coordinate3D) => { // must decouple FOR SURE
        const l = this.board.length

        const boardState = (state || this.board.stringMask())

        if(!spot){
            // check all spots
            // just one floor its neeeded to be checked for all floors to be checked, since the check direction function goes trough floors
            for(let i = 0; i < l; i++){
                for(let j = 0; j < l; j++){
                    const currentSpotDirections = this.getAllLinesFromSpot({
                        floor: Math.floor(l/2),
                        row: i,
                        col: j
                    }, boardState)

                    const highestXLine = this.reduceSDtoHighestOcurrences('x' , currentSpotDirections)

                    if(highestXLine.length === this.board.length){
                        return Infinity
                    }

                    const highestOLine = this.reduceSDtoHighestOcurrences('o' , currentSpotDirections)

                    if(highestOLine.length === this.board.length){
                        return -Infinity
                    }
                }
            }

            if(!boardState.includes('.')){
                return true // Its a tie MUST BE DECOUPLE
            }

            return false // still going

        } else {
            // check only the provided spot

            const marker = boardState[spot.floor][spot.row][spot.col] as Marker

            const spotDirections = this.getAllLinesFromSpot({
                floor: spot.floor,
                row: spot.row,
                col: spot.col
            }, boardState)

            const highestLine = this.reduceSDtoHighestOcurrences( marker , spotDirections)

            if(highestLine.length === this.board.length){
                return true
            } else return false // still going
        }
    }

    reduceSDtoHighestOcurrences = (player : Marker, spotDirections : spotLanes) => {
        return spotDirections.map(line=>{
            return line.filter((v)=>{
                return v === player
            })
        }).reduce((acc,v)=>{
            return (v.length >= acc.length) ? v : acc 
        }, [] )
    }


    checkWin = () => {
        const isTerminal = this.checkTerminalState()
        if(isTerminal){
            this.finish = true
        }
    }


    addVectors(a : Coordinate3D, b : Coordinate3D){

        const resultingVector : Coordinate3D = {
            col: a.col + b.col,
            row: a.row + b.row,
            floor: a.floor + b.floor,  
        }

        return resultingVector
    }

    substractVectors(a : Coordinate3D, b : Coordinate3D){

        const resultingVector : Coordinate3D = {
            col: a.col - b.col,
            row: a.row - b.row,
            floor: a.floor - b.floor,  
        }

        return resultingVector
    }
    
    /**
     * 
     * Player agnostic direction check
     * 
     * @param spot
     * @returns an Array of all directions, the resulting array must be postprocesed by another function to check if wins or anything
     * 
     */

    getAllLinesFromSpot = ( spot : Coordinate3D, state? : maskedBoard ) : spotLanes => {

        let stateBoard : full3Dboard | undefined = undefined;

       if(state){
        stateBoard = this.board.stringUnmask(state)
       }

        const unMaskedBoardState = ( stateBoard ||  this.board)
    
        const checkDirections = [
            { col: 1 , row:  0 , floor:  0 },
            { col: 0 , row:  1 , floor:  0 },
            { col: 0 , row:  0 , floor:  1 },
            { col: 1 , row:  1 , floor:  0 },
            { col: 1 , row: -1 , floor:  0 },
            { col: 1 , row:  0 , floor:  1 },
            { col: 1 , row:  0 , floor: -1 },
            { col: 0 , row:  1 , floor:  1 },
            { col: 0 , row:  1 , floor: -1 },
            { col: 1 , row:  1 , floor:  1 },
            { col: 1 , row:  1 , floor: -1 },
            { col:-1 , row: -1 , floor:  1 },
            { col:-1 , row:  1 , floor:  1 },
        ];

        const counts = []

        for(const direction of checkDirections){
            let forward  = {...spot}
            let backward = {...spot}

            const count = [this.board.getSpot(spot)]
            
            for(let i = 0; i < this.board.length - 1; i++ ){

                forward  = this.addVectors(forward, direction);
                backward = this.substractVectors(backward, direction);

                if (
                    forward.col >= 0 &&
                    forward.col < this.board.length &&
                    forward.row >= 0 &&
                    forward.row < this.board.length &&
                    forward.floor >= 0 &&
                    forward.floor < this.board.length
                ) {
                    count.push(unMaskedBoardState[forward.floor][forward.row][forward.col]);
                }
    
                if (
                    backward.col >= 0 &&
                    backward.col < this.board.length &&
                    backward.row >= 0 &&
                    backward.row < this.board.length &&
                    backward.floor >= 0 &&
                    backward.floor < this.board.length
                ) {
                    count.push(unMaskedBoardState[backward.floor][backward.row][backward.col]);
                }
            }
            counts.push(count)
        }

        return counts

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

















// interfaces



type Marker = 'x' | 'o';
type Spot = '.' | Marker
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

interface spotLanes extends Array<Array<string>>{

}


// conventions for maskedBoard

class maskedBoard extends String {
    constructor(boardState : Array<Array<Array<string>>>){
        const str = []
        for(let i = 0; i < boardState.length; i++){
            str.push(boardState[i].join('-').replace(/,/g, ''))
        }
        super(str.join('|').replace(/,/g, ''))
    }
}