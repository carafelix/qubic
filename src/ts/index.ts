import { CPU_Player, Game } from "./game";
console.log('vaya papi')

const nGridSizeInput = document.querySelector("#n-grid-size-input") as HTMLInputElement;
const gridSizeOutput = nGridSizeInput!.nextElementSibling! as HTMLOutputElement

        gridSizeOutput.innerText = nGridSizeInput.value;

        nGridSizeInput.oninput = () => {
            gridSizeOutput.innerText = nGridSizeInput.value
        }

const startGameBtn = document.querySelector('#start-game') as HTMLButtonElement;
        startGameBtn.addEventListener('click', ()=>{
            const cpuGameCheckbox = document.querySelector('#cpu-game') as HTMLInputElement
            const cpuFirstCheckbox = document.querySelector('#cpu-first') as HTMLInputElement
            const cpuOnlyCheckbox = document.querySelector('#cpu-only') as HTMLInputElement;

            const runninGame = new Game(+nGridSizeInput.value, cpuGameCheckbox.checked, cpuFirstCheckbox.checked);
                if(cpuOnlyCheckbox.checked){
                        const p1Dumb = confirm('Player 1 is dumb?')
                        const p2Dumb = confirm('Player 2 is dumb?')
                        runninGame.setGameAsCPUOnly(p1Dumb,p2Dumb)
                }

            const boards = document.querySelector('#boards');  // break down in smaller functions
                    if(boards){
                        boards.innerHTML = ''

                        const l = runninGame.board.length;
                        
                        for(let i=0; i<l;i++){
                         const floorDiv = document.createElement('div');
                                floorDiv.classList.add('boardFloor');
                                floorDiv.style.gridTemplateColumns = `repeat(${l}, 100px)`;
                                floorDiv.style.gridTemplateRows = `repeat(${l}, 100px)`

                                for(let j=0; j<l;j++){
                                        for(let k=0; k<l;k++){
                                                const square = document.createElement('div');
                                                square.dataset.value = `(${i},${j},${k})`
                                                square.innerText = runninGame.board[i][j][k]
                                                
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

                                                square.addEventListener('click', ()=>{
                                                        if(square.innerText !== '·'){return}
                                                        
                                                        // when is there a CPU playing must ensure the human player con only play on its turn
                                                        // on both cpu's, disable human input

                                                        const playingPlayer = runninGame.getPlayerInTurn()
                                                        const desiredPlay = playingPlayer.to3Dcoord(i,j,k)

                                                        playingPlayer.plays(desiredPlay);
                                                        square.innerText = playingPlayer.marker
                                                        
                                                        const winningLine = runninGame.checkWin(runninGame.board.stringMask(), desiredPlay).line

                                                        if(runninGame.isFinish()){
                                                           console.log(winningLine)     
                                                        }
                                                })


                                                floorDiv.appendChild(square)
                                        }
                                }
                         boards.appendChild(floorDiv)
                        }


                    };
            
        })



// const g = new Game(3);
