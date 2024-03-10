import { CPU_Player, Coordinate3D, Game, Player } from "./game";
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
let gameL = 3;
const nGridSizeInput = document.querySelector("#n-grid-size-input") as HTMLInputElement;
const gridSizeOutput = nGridSizeInput!.previousElementSibling! as HTMLOutputElement

        gridSizeOutput.innerText = `Grid Size: ${nGridSizeInput.value}`;

        nGridSizeInput.oninput = () => {
            gridSizeOutput.innerText = `Grid Size: ${nGridSizeInput.value}`
        }

const startGameBtn = document.querySelector('#new-game') as HTMLButtonElement;
        startGameBtn.addEventListener('click', async ()=>{
            const cpuGameCheckbox = document.querySelector('#cpu-game') as HTMLInputElement
            const cpuFirstCheckbox = document.querySelector('#cpu-first') as HTMLInputElement
            const cpuOnlyCheckbox = document.querySelector('#cpu-only') as HTMLInputElement;

            const runningGame = new Game(+nGridSizeInput.value, cpuGameCheckbox.checked, cpuFirstCheckbox.checked);
                gameL = runningGame.board.length
                if(cpuOnlyCheckbox.checked){
                        const p1Dumb = confirm('Player 1 is dumb?')
                        const p2Dumb = confirm('Player 2 is dumb?')
                        runningGame.setGameAsCPUOnly(p1Dumb,p2Dumb)

                        composeDOMboard(runningGame)
                        
                        function cpuOnlyGameLoop(){
                                if(runningGame.isFinish()){return}

                                const playerInTurn = runningGame.getPlayerInTurn()

                                let desiredPlay;
                                while(!desiredPlay){
                                        desiredPlay = playerInTurn.getPlay()
                                        if(!runningGame.checkPlaySpotIsEmpty(desiredPlay)){
                                                desiredPlay = undefined;
                                        }
                                }
                                playerInTurn.plays(desiredPlay)

                                const playedSpot = document.querySelector(`[data-cord="${cordToParentesis(desiredPlay)}"]`) as HTMLDivElement
                                playedSpot.innerText = playerInTurn.marker
                                
                                updateLog(runningGame,desiredPlay,playerInTurn)
                                ifWinColorDOM(runningGame,desiredPlay)

                                // quirky way to make the thing go step by step lol

                                const emptyImg = document.createElement('img')
                                        emptyImg.setAttribute('src',"./assets/transparent.webp");
                                        emptyImg.style.position = 'absolute'
                                playedSpot.appendChild(
                                        emptyImg
                                )
                                emptyImg.addEventListener('load', ()=>{
                                        cpuOnlyGameLoop()
                                })
                                
                        }
                        cpuOnlyGameLoop();
                        
                } else {
                        if(cpuGameCheckbox.checked && cpuFirstCheckbox.checked){
                                composeDOMboard(runningGame, true, true, true);
                        } else if (cpuGameCheckbox.checked) {
                                composeDOMboard(runningGame, true, true);
                        } else {
                                composeDOMboard(runningGame, true);
                        }
                }
        })

function updateLog(runningGame : Game, playedPlay : Coordinate3D, player : Player){
        // better would be not to loop over the whole array everytime lol
        // just append a new line each time anyone plays a move
        
        const log = document.querySelector('#log') as HTMLDivElement;
                if(log.innerText.length > 'turn 100 : cpu2 played o (4,5,5)'.length*20){
                        log.innerText = 'Play Log: \n'
                }
                log.innerText += `Turn ${runningGame.turn} : ${player.name} played ${player.marker} ${`(${playedPlay.floor},${playedPlay.row},${playedPlay.col})`}\n`
        // log.innerText = '';
        // for(const [index, play] of runningGame.playLog.entries()){
        //         log.innerText += `in turn ${index + 1}: ${play.from.name} played ${cordToParentesis(play.cord)}\n`
        // }
}

function composeDOMboard(runningGame : Game, isHumanPlaying? : boolean, isCpuPlaying? : boolean, isCpuFirst? : boolean){
        const boards = document.querySelector('#boards');  // break down in smaller functions
        const log =  document.querySelector('#log') as HTMLDivElement; 
        if(boards && log){
            boards.innerHTML = ''
            log.innerText = 'Play Log: \n'
            const l = runningGame.board.length;
            
                if(isCpuFirst){
                        const cpu = runningGame.getPlayerInTurn()
                        const play = cpu.getPlay()
                        cpu.plays(play)
                        updateLog(runningGame,play, cpu)
                }

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
                                    square.setAttribute('title',`(${i},${j},${k})`)
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
                                                                                                
                                                updateLog(runningGame,desiredPlay, playingPlayer)
                                                ifWinColorDOM(runningGame,desiredPlay)

                                                if(isCpuPlaying){
                                                        // previous move was valid
                                                        if(playingPlayer !== runningGame.getPlayerInTurn()  && !runningGame.isFinish()){
                                                                const cpuPlayer = runningGame.getPlayerInTurn()
                                                                while(cpuPlayer === runningGame.getPlayerInTurn()){
                                                                        const cpuPlay = cpuPlayer.getPlay();
                                                                        cpuPlayer.plays(cpuPlay)
                                                                        if(cpuPlayer !== runningGame.getPlayerInTurn()){
                                                                                const format = cordToParentesis(cpuPlay)
                                                                                const cpuSquare = document.querySelector(`[data-cord="${format}"]`) as HTMLDivElement
                                                                                cpuSquare.innerText = cpuPlayer.marker
                                                                                updateLog(runningGame, cpuPlay, cpuPlayer)
                                                                                ifWinColorDOM(runningGame,cpuPlay)
                                                                        }
                                                                }
                                                        }
                                                }
                                        })
                                    }
                                    floorDiv.appendChild(square)
                            }
                    }
             boards.appendChild(floorDiv)
            }
        };
}

function ifWinColorDOM(runningGame : Game, desiredPlay : Coordinate3D){
        const winningLine = runningGame.checkWin(runningGame.board.stringMask(), desiredPlay).line
    
        if(runningGame.isFinish()){
        
                winningLine?.forEach((spot)=>{
                const winningSpot = document.querySelector(`[data-cord="(${spot.cord.floor},${spot.cord.row},${spot.cord.col})"]`) as HTMLDivElement
                        if(winningSpot){
                                winningSpot.style.backgroundColor = 'lightgreen';
                                winningSpot.style.color = 'black';
                        }
                })
                
        const log = document.querySelector('#log') as HTMLDivElement;
                log.innerText += `Winner is: ${runningGame.winner?.name}`
        }

}

function cordToParentesis(cord : Coordinate3D){
        return `(${cord.floor},${cord.row},${cord.col})`
}


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('canvas') as HTMLCanvasElement,
})

renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight / 1.5 )
camera.position.setZ(30)


for(let i = 0; i<gameL; i++){
        const geometry = new THREE.CylinderGeometry( 1, 1, 20, 50 ); 
        const material = new THREE.MeshStandardMaterial( {color: 0xffffff} ); 
        const cylinder = new THREE.Mesh( geometry, material ); scene.add( cylinder );
        cylinder.position.x = i*5
}


const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)

const gridHelper = new THREE.GridHelper(100)
scene.add(gridHelper)

const controls = new OrbitControls(camera, renderer.domElement)



function animate(){
        requestAnimationFrame( animate )
        controls.update()
        renderer.render( scene, camera )
}
animate()
