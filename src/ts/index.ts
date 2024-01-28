import { CPU_Player, Coordinate3D, Game } from "./game";


const nGridSizeInput = document.querySelector("#n-grid-size-input") as HTMLInputElement;
const gridSizeOutput = nGridSizeInput!.nextElementSibling! as HTMLOutputElement

        gridSizeOutput.innerText = nGridSizeInput.value;

        nGridSizeInput.oninput = () => {
            gridSizeOutput.innerText = nGridSizeInput.value
        }

const startGameBtn = document.querySelector('#new-game') as HTMLButtonElement;
        startGameBtn.addEventListener('click', async ()=>{
            const cpuGameCheckbox = document.querySelector('#cpu-game') as HTMLInputElement
            const cpuFirstCheckbox = document.querySelector('#cpu-first') as HTMLInputElement
            const cpuOnlyCheckbox = document.querySelector('#cpu-only') as HTMLInputElement;

            const runningGame = new Game(+nGridSizeInput.value, cpuGameCheckbox.checked, cpuFirstCheckbox.checked);

                if(cpuOnlyCheckbox.checked){
                        const p1Dumb = confirm('Player 1 is dumb?')
                        const p2Dumb = confirm('Player 2 is dumb?')
                        runningGame.setGameAsCPUOnly(p1Dumb,p2Dumb)

                        composeDOMboard(runningGame)
                        
                        function gameLoop(){
                                if(runningGame.isFinish()){return}

                                const playerInTurn = runningGame.getPlayerInTurn()
                                const desiredPlay = playerInTurn.getPlay()

                                playerInTurn.plays(desiredPlay)

                                const playedSpot = document.querySelector(`[data-cord="(${desiredPlay.floor},${desiredPlay.row},${desiredPlay.col})"]`) as HTMLDivElement
                                playedSpot.innerText = playerInTurn.marker

                                const emptyImg = document.createElement('img')
                                        emptyImg.setAttribute('src',"./assets/transparent.webp");
                                        emptyImg.style.position = 'absolute'
                                playedSpot.appendChild(
                                        emptyImg
                                )
                                emptyImg.addEventListener('load', ()=>{
                                        gameLoop()
                                })
                                updateDOMcheckWin(runningGame,desiredPlay)
                        }
                        gameLoop();
                        
                } else {
                        composeDOMboard(runningGame, true);

                        if(cpuGameCheckbox.checked && cpuFirstCheckbox.checked){
                        
                        }
                }
        })



function composeDOMboard(runningGame : Game, isHumanPlaying? : boolean){
        const boards = document.querySelector('#boards');  // break down in smaller functions
        if(boards){
            boards.innerHTML = ''

            const l = runningGame.board.length;
            
            for(let i=0; i<l;i++){
             const floorDiv = document.createElement('div');
                    floorDiv.classList.add('boardFloor');
                    floorDiv.style.gridTemplateColumns = `repeat(${l}, 100px)`;
                    floorDiv.style.gridTemplateRows = `repeat(${l}, 100px)`

                    for(let j=0; j<l;j++){
                            for(let k=0; k<l;k++){
                                    const square = document.createElement('div');
                                    square.dataset.cord = `(${i},${j},${k})`
                                    square.innerText = runningGame.board[i][j][k]
                                    
                                    square.classList.add("spot")   
                                    if(j === 0){
                                            square.classList.add("top")   
                                    }
                                    if (j === l - 1) {
                                            square.classList.add("bottom")   
                                    }
                                    if (k === 0) {
                                            square.classList.add("left")   
                                    }
                                    if (k === l - 1) {
                                            square.classList.add("right")   
                                    }

                                    if(isHumanPlaying){
                                        square.addEventListener('click', ()=>{
                                                if(square.innerText !== '·' || runningGame.isFinish()){return}
                                                // when is there a CPU playing must ensure the human player con only play on its turn
                                                // on both cpu's, disable human input
    
                                                const playingPlayer = runningGame.getPlayerInTurn()
                                                const desiredPlay = playingPlayer.to3Dcoord(i,j,k)
    
                                                playingPlayer.plays(desiredPlay);
                                                square.innerText = playingPlayer.marker
                                                
                                                updateDOMcheckWin(runningGame,desiredPlay)
                                        })
                                    }
                                    floorDiv.appendChild(square)
                            }
                    }
             boards.appendChild(floorDiv)
            }
        };
}

function updateDOMcheckWin(runningGame : Game, desiredPlay : Coordinate3D){
        const winningLine = runningGame.checkWin(runningGame.board.stringMask(), desiredPlay).line
    
                                                if(runningGame.isFinish()){
                                                   winningLine?.forEach((spot)=>{
                                                        const winningSpot = document.querySelector(`[data-cord="(${spot.cord.floor},${spot.cord.row},${spot.cord.col})"]`) as HTMLDivElement
                                                                if(winningSpot){
                                                                        winningSpot.style.backgroundColor = 'lightgreen';
                                                                        winningSpot.style.color = 'black';
                                                                }
                                                        })
                                                        console.log(runningGame.playLog)
                                                }
}
