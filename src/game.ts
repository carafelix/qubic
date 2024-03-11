import { select , input } from "@inquirer/prompts"



export class full3Dboard extends Array<Array<Array<string>>>{

    area = this.length * this.length

    // a lot of masking unmasking goes because of the way the functions are around this object.
    // if instead integrity is checked with a stringMask class it would not be necessary to be masking and unmasking that much
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
    
    reduceSpotDirectionstoHighestOccurrences = (player : Marker, spotDirections : spotLanes) => {
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

    logCurrentState = () => {
        for(const floor of this){
            for(const row of floor){
                console.log(row.join(' '));
            }
            console.log()
        }
        console.log('_______________')
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

    public setDumb = () => {
        this.getPlay = this.randomMove
        return this
    }

    private aboutToWinMove(player : Marker){
        const board = this.parentGame.board
        const mask = board.stringMask();
        const childStates = mask.getAllChildStates(player)
        const l = board.length;
        
        for(let z = 0; z < l; z++){
            for(let y = 0; y < l; y++){
                for(let x = 0; x < l; x++){
                    const tentativeMove = this.to3Dcoord(z,y,x)
                    if(board.getSpot(tentativeMove) !== '.'){
                        continue
                    }

                    const lanes = board.getAllLinesFromSpot(tentativeMove)
                    const occurrence = board.reduceSpotDirectionstoHighestOccurrences(player, lanes)
                    if(occurrence.length === board.length - 1){
                        return tentativeMove
                    }
                }
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

                        const tentativeMove = this.differentiateMoveFromTwoStates(actualState,childState)
                        if(tentativeMove.floor < l/2 - 1 && tentativeMove.floor > l/2 + 1){
                            continue
                        }
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

                    if(this.parentGame.board.getSpot(this.to3Dcoord(z,y,x)) !== '.,'){
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

    // does not check if both are the same state
    private differentiateMoveFromTwoStates(initialState : maskedBoard, nextState : maskedBoard) : Coordinate3D{
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
}

export class Game{
    public board : full3Dboard // must be private on production!
    private playerInTurn : Player
    public finish : boolean // must be private
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
        // this.displayInLog()
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
    
                        const highestXLine = this.board.reduceSpotDirectionstoHighestOccurrences('x' , currentSpotDirections)
    
                        if(highestXLine.length === this.board.length){
                            return Infinity
                        }
    
                        const highestOLine = this.board.reduceSpotDirectionstoHighestOccurrences('o' , currentSpotDirections)
    
                        if(highestOLine.length === this.board.length){
                            return -Infinity
                        }
                    }
                }
            }

            if(!boardState.includes('.')){
                return true // Ties cannot exist
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

            const highestLine = this.board.reduceSpotDirectionstoHighestOccurrences( marker , spotDirections)

            if(highestLine.length === this.board.length){
                return true
            } else return false // still going
        }
    }


    checkWin = () => {
        const isTerminal = this.checkTerminalState()
        if(isTerminal){
            this.finish = true
            this.winner = (this.playerOne === this.getPlayerInTurn()) ? this.playerTwo : this.playerOne
        }
    }

    isFinish = () => {
        return this.finish
    }

    setGameAsCPUOnly = (isP2Dumb? : boolean, isP1Dumb? : boolean) => {
        // next line doesn't allow for setting the game as cpu only after move already have been played
        if(this.board.stringMask().includes('o') || this.board.stringMask().includes('x')){
            return;
        }
        this.playerOne = new CPU_Player('x', this, 'cpu1');
        this.playerTwo = new CPU_Player('o', this, 'cpu2');
        if(isP1Dumb && isP2Dumb){
            this.playerOne = new CPU_Player('x', this, 'cpu1').setDumb()
            this.playerTwo = new CPU_Player('o', this, 'cpu2').setDumb()
        } else if(isP1Dumb){
            this.playerOne = new CPU_Player('x', this, 'cpu1').setDumb()
        } else if (isP2Dumb){
            this.playerTwo = new CPU_Player('o', this, 'cpu2').setDumb()
        }
        this.playerInTurn = this.playerOne;
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