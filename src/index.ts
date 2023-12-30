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

    getAllLinesFromSpot = ( spot : Coordinate3D, state? : maskedBoard ) : spotLanes => {

        let stateBoard : full3Dboard | undefined = undefined;

       if(state){
        stateBoard = state.stringUnmask()
       }

        const unMaskedBoardState = ( stateBoard ||  this)
    
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

            const count = [this.getSpot(spot)]
            
            for(let i = 0; i < this.length - 1; i++ ){

                forward  = addVectors(forward, direction);
                backward = substractVectors(backward, direction);

                if (
                    forward.col >= 0 &&
                    forward.col < this.length &&
                    forward.row >= 0 &&
                    forward.row < this.length &&
                    forward.floor >= 0 &&
                    forward.floor < this.length
                ) {
                    count.push(unMaskedBoardState[forward.floor][forward.row][forward.col]);
                }
    
                if (
                    backward.col >= 0 &&
                    backward.col < this.length &&
                    backward.row >= 0 &&
                    backward.row < this.length &&
                    backward.floor >= 0 &&
                    backward.floor < this.length
                ) {
                    count.push(unMaskedBoardState[backward.floor][backward.row][backward.col]);
                }
            }
            counts.push(count)
        }

        return counts

    }


    getSpot = (coord : Coordinate3D, state? : maskedBoard) => {
        if(state){
            const boardState = state.stringUnmask();
            if(!boardState) throw 'Something is wrong dude at getting the spot dude';

           return boardState[coord.floor][coord.row][coord.col]
        }
        return this[coord.floor][coord.row][coord.col]
    }
    
    reduceSpotDirectionstoHighestOcurrences = (player : Marker, spotDirections : spotLanes) => {
        return spotDirections.map(line=>{
            return line.filter((v)=>{
                return v === player
            })
        }).reduce((acc,v)=>{
            return (v.length >= acc.length) ? v : acc 
        }, [] )
    }

    reduceSumSpotDirections = (player : Marker, spotDirections : spotLanes) => {

    }

    mapReduceSpotDirectionsToValue = (player : Marker, spotDirections : spotLanes, nextTurnPlayer? : Marker) => {
        const opponentMarker = (player === 'x') ? 'o' : 'x';

        return spotDirections.map((lane : string[]) => {
            const laneCount = (lane.join('').match(new RegExp(`${player}`, 'g')) || []).length
            if(lane.includes(opponentMarker)){
                return 0
            } else if(laneCount === this.length){
                return Infinity
            } else {
                return laneCount
            }
        }).reduce((acc,v)=>acc+v,0)
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
         *      - evaluateState()
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



        // greedy solution

        const winningMove = this.aboutToWinMove(this.marker)
        
        if(winningMove){
            return winningMove
        }
        const opponentMarker = (this.marker === 'x') ? 'o' : 'x';
        const opponentAboutToWin = this.aboutToWinMove(opponentMarker);
        
        if(opponentAboutToWin){
            return opponentAboutToWin
        } 
        return this.getMostStackSpot()
    }

    private to3Dcoord(floor : number, row : number, col : number) : Coordinate3D {
        return {
            floor,
            row,
            col
        }
    }

    private aboutToWinMove(player : Marker){
        const board = this.parentGame.board
        const mask = board.stringMask();
        const childStates = mask.getAllChildStates(player)
        
        for(const position of childStates){
            const boardNewState = position.stringUnmask();
            const tentativeMove = this.differenciateMoveFromTwoStates(mask,position)
            const lanes = boardNewState.getAllLinesFromSpot(tentativeMove)
            const occurence = boardNewState.reduceSpotDirectionstoHighestOcurrences(player, lanes)
            if(occurence.length === board.length){
                return tentativeMove
            }
        }
        
        return false
    }

    private randomMove(){
        return this.to3Dcoord(
            Math.floor(Math.random()*this.parentGame.board.length),
            Math.floor(Math.random()*this.parentGame.board.length),
            Math.floor(Math.random()*this.parentGame.board.length))
    }

    private getMostStackSpot(){
        const l = this.parentGame.board.length;
        const opponentMarker = (this.marker === 'x') ? 'o' : 'x';
        if(this.isPlayerFirstMove()){
            return (
                () => {
                    const actualState = this.parentGame.board.stringMask() 
                    const allChildStates = actualState.getAllChildStates(this.marker)

                    let moveImpact = 0;
                    let move = this.randomMove()

                    for(const childState of allChildStates){

                        const tentativeMove = this.differenciateMoveFromTwoStates(actualState,childState)
                        const allLinesFromTentativeMove = this.parentGame.board.getAllLinesFromSpot(tentativeMove);
                        const currentMoveImpact = allLinesFromTentativeMove.reduce((acc,v)=>{
                            if(v.includes(opponentMarker)){
                                return acc
                            } else {
                                return acc + v.join('')
                            }
                        }, '').length

                        if(currentMoveImpact > moveImpact){
                            moveImpact = currentMoveImpact
                            move = tentativeMove
                        }
                    }
                    return move
                }
            )()
        } 

        let move = this.randomMove()
        let moveValue = this.mapReduceSpotDirectionsToValue(this.marker, this.parentGame.board.getAllLinesFromSpot(move))
        
        for(let z = 0; z < l; z++){
            for(let y = 0; y < l; y++){
                for(let x = 0; x < l; x++){

                    if(this.parentGame.board.getSpot(this.to3Dcoord(z,y,x)) !== '.'){
                        continue
                    }

                    const currentSpotDirections = this.parentGame.board.getAllLinesFromSpot(this.to3Dcoord(z,y,x))

                    const currentSpotValue = this.mapReduceSpotDirectionsToValue(this.marker, currentSpotDirections)
                    
                    if(currentSpotValue > moveValue){
                        move = this.to3Dcoord(z,y,x)
                        moveValue = currentSpotValue
                    }
                }
            }
        }

        return move
    }


    private mapReduceSpotDirectionsToValue = this.parentGame.board.mapReduceSpotDirectionsToValue;

    private isPlayerFirstMove(){
        return !(this.parentGame.board.stringMask().includes(this.marker))
    }


    private miniMax(state : maskedBoard, depth : number, alpha : number, beta: number){
        const playerInTurn = this.getPlayerInTurnBasedOnGameState(state)
        const isTerminal = this.parentGame.checkTerminalState(state)
        const childStates = state.getAllChildStates(playerInTurn);
        let bestMove = childStates[0]

        if(isTerminal || depth <= 0){
            return {
                value: this.evaluateState(state),
                move: bestMove, // this is fake, should be null 
            }
        }

        if(playerInTurn === 'x'){
            let maxEval = -Infinity
            for(const childState of childStates){
                let currentEvaluation = this.miniMax(childState, depth - 1, alpha, beta);

                if(currentEvaluation.value > maxEval){
                    bestMove = childState
                }
                maxEval = Math.max(maxEval, currentEvaluation.value)

                alpha = Math.max(alpha, currentEvaluation.value)
                if(beta <= alpha) break;
            }
            return {
                value: maxEval,
                move: bestMove
            }

        } else {
            let minEval = Infinity
            for(const childState of childStates){
                let currentEvaluation = this.miniMax(childState, depth - 1, alpha, beta)
                
                if(currentEvaluation.value < minEval){
                    bestMove = childState
                }

                minEval = Math.min(minEval, currentEvaluation.value)

                beta = Math.min(alpha, currentEvaluation.value)
                if(beta <= alpha) break;
            }
            return {
                value: minEval,
                move: bestMove
            }
        }
    }

    // does not check if both are the same state
    private differenciateMoveFromTwoStates(initialState : maskedBoard, nextState : maskedBoard) : Coordinate3D{
        const l = this.parentGame.board.length
        
        const cleanMask = initialState.replace(/,|\||-/g, '')
        const cleanMask2 = nextState.replace(/,|\||-/g, '')
        let col = 0
        for(; col < cleanMask.length; col++){
            if(cleanMask[col] !== cleanMask2[col]){
                break
            }
        }
        let floor = 0;
        let row = 0;

        for(let i = 0; i < initialState.length ; i++){
            if(initialState[i] !== nextState[i]){
                break
            } else if (initialState[i] == '-'){
                row++
            } else if (initialState[i] == '|'){
                row++
                floor++
            }
        }
        return this.to3Dcoord(floor, row % l, col % l)
    }

    private getPlayerInTurnBasedOnGameState(state : maskedBoard) : Marker{
        const Xs = state.split('').filter((v)=>v === 'x').length
        const Os = state.split('').filter((v)=>v === 'o').length

        if(Xs === Os){
            return 'x'
        } else {
            return 'o'
        }
    }

    private evaluateState( state : maskedBoard ){  // state should be converted to a game board when vector checks are implemented
        const l = this.parentGame.board.length;
        const nextTurnPlayer = this.getPlayerInTurnBasedOnGameState(state)

        const boardXCount = []
        const boardOcount = []
       for(let z = 0; z < l; z++){
        for(let y = 0; y < l; y++){
            for(let x = 0; x < l; x++){
                const currentSpotDirections = this.parentGame.board.getAllLinesFromSpot({
                    floor: z,
                    row: y,
                    col: x
                }, state)

                boardXCount.push(this.parentGame.board.mapReduceSpotDirectionsToValue('x', currentSpotDirections, nextTurnPlayer))
                boardOcount.push(this.parentGame.board.mapReduceSpotDirectionsToValue('o', currentSpotDirections, nextTurnPlayer))
            }
        }
    }

    const Xeval = boardXCount.reduce((acc,v)=>acc+v,0)
    const Oeval = boardOcount.reduce((acc,v)=>acc+v,0)
    
        if(!state.includes('.') && Xeval !== Infinity && Oeval !== -Infinity){ // && no one has won function
            return 0
        } else return Xeval + Oeval
    
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
        console.log('\n', '__________________', '\n')
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
    checkTerminalState = (state? : maskedBoard, spot? : Coordinate3D) => { // must decouple into isTerminalTie, isTerminal returns just boolean
        const l = this.board.length

        const boardState = (state || this.board.stringMask())

        if(!spot){
            // check all spots
            // Use REGEX for n < regexLimit and loops for over the RegexLimit, i think
            for(let i = 0; i < l; i++){
                for(let j = 0; j < l; j++){
                    for(let k = 0; k < l; k++){
                        const currentSpotDirections = this.board.getAllLinesFromSpot({
                            floor: i,
                            row: j,
                            col: k
                        }, boardState)
    
                        const highestXLine = this.board.reduceSpotDirectionstoHighestOcurrences('x' , currentSpotDirections)
    
                        if(highestXLine.length === this.board.length){
                            return Infinity
                        }
    
                        const highestOLine = this.board.reduceSpotDirectionstoHighestOcurrences('o' , currentSpotDirections)
    
                        if(highestOLine.length === this.board.length){
                            return -Infinity
                        }
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

            const spotDirections = this.board.getAllLinesFromSpot({
                floor: spot.floor,
                row: spot.row,
                col: spot.col
            }, boardState)

            const highestLine = this.board.reduceSpotDirectionstoHighestOcurrences( marker , spotDirections)

            if(highestLine.length === this.board.length){
                return true
            } else return false // still going
        }
    }


    // tests = (player : Marker , spot : Coordinate3D) => {
    //     const boardState = (this.board.stringMask())
    //     const spotDirections = this.board.getAllLinesFromSpot({
    //         floor: spot.floor,
    //         row: spot.row,
    //         col: spot.col
    //     }, boardState)

    //     const v = this.mapReduceSpotDirectionsToValue(player, spotDirections)
        
    // }


    checkWin = () => {
        const isTerminal = this.checkTerminalState()
        if(isTerminal){
            this.finish = true
        }
    }


    
    
    /**
     * 
     * Player agnostic direction check
     * 
     * @param spot
     * @returns an Array of all directions, the resulting array must be postprocesed by another function to check if wins or anything
     * 
     */

    

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

    stringUnmask = () => {
        const board = this.split('|').map(floor=>floor.split('-').map((row)=>row.split('')))
        return new full3Dboard(...board)
    }


    getAllChildStates = (player : Marker) => { 
        const states = [] // must be maskedBoard[] but I think maskedBoard needs to be changed to Array
        
        for(let i = 0; i < this.length; i++){
            if(this[i] === '.'){
                const child = this.split('')
                child[i] = player

                // THIS LINE OF CODE MUST GO AWAY GOOD LORD... 
                const state = child.join().replace(/,/g , '').split('|').map(floor=>floor.split('-').map((row)=>row.split('')))

                states.push(new maskedBoard(state))
            }
        }
        return states
    }
}


function addVectors(a : Coordinate3D, b : Coordinate3D){

    const resultingVector : Coordinate3D = {
        col: a.col + b.col,
        row: a.row + b.row,
        floor: a.floor + b.floor,  
    }

    return resultingVector
}

function substractVectors(a : Coordinate3D, b : Coordinate3D){

    const resultingVector : Coordinate3D = {
        col: a.col - b.col,
        row: a.row - b.row,
        floor: a.floor - b.floor,  
    }

    return resultingVector
}