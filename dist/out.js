"use strict";
(() => {
  // src/ts/game.ts
  var full3Dboard = class extends Array {
    constructor() {
      super(...arguments);
      this.area = this.length * this.length;
      // a lot of masking unmasking goes because of the way the functions are around this object.
      // if instead integrity is checked with a stringMask class it would not be necessary to be masking and unmasking that much
      // I think any game state that is not stringified should be created using the new full3Dboard
      // Right now the board its composed at that lvl. Moving it out at the Game lvl would allow it to be used elsewhere
      this.stringMask = (state) => {
        const boardState = state || this;
        return new maskedBoard(boardState);
      };
      this.getAllLinesFromSpot = (spot, state) => {
        let stateBoard = void 0;
        if (state) {
          stateBoard = state.stringUnmask();
        }
        const unMaskedBoardState = stateBoard || this;
        const checkDirections = [
          { col: 1, row: 0, floor: 0 },
          { col: 0, row: 1, floor: 0 },
          { col: 0, row: 0, floor: 1 },
          { col: 1, row: 1, floor: 0 },
          { col: 1, row: -1, floor: 0 },
          { col: 1, row: 0, floor: 1 },
          { col: 1, row: 0, floor: -1 },
          { col: 0, row: 1, floor: 1 },
          { col: 0, row: 1, floor: -1 },
          { col: 1, row: 1, floor: 1 },
          { col: 1, row: 1, floor: -1 },
          { col: -1, row: -1, floor: 1 },
          { col: -1, row: 1, floor: 1 }
        ];
        const counts = [];
        for (const direction of checkDirections) {
          let forward = { ...spot };
          let backward = { ...spot };
          const count = [{
            spotState: this.getSpot(spot),
            cord: spot
          }];
          for (let i = 0; i < this.length - 1; i++) {
            forward = addVectors(forward, direction);
            backward = substractVectors(backward, direction);
            if (forward.col >= 0 && forward.col < this.length && forward.row >= 0 && forward.row < this.length && forward.floor >= 0 && forward.floor < this.length) {
              count.push({
                spotState: unMaskedBoardState[forward.floor][forward.row][forward.col],
                cord: forward
              });
            }
            if (backward.col >= 0 && backward.col < this.length && backward.row >= 0 && backward.row < this.length && backward.floor >= 0 && backward.floor < this.length) {
              count.push({
                spotState: unMaskedBoardState[backward.floor][backward.row][backward.col],
                cord: backward
              });
            }
          }
          counts.push(count);
        }
        return counts;
      };
      this.getSpot = (coord, state) => {
        if (state) {
          const boardState = state.stringUnmask();
          if (!boardState)
            throw "Something is wrong dude at getting the spot dude";
          return boardState[coord.floor][coord.row][coord.col];
        }
        return this[coord.floor][coord.row][coord.col];
      };
      this.reduceSpotDirectionstoHighestOccurrences = (player, spotDirections) => {
        return spotDirections.map((line) => {
          return line.filter((v) => {
            return v.spotState === player;
          });
        }).reduce((acc, v) => {
          return v.length >= acc.length ? v : acc;
        }, []);
      };
      this.reduceSumSpotDirections = (player, spotDirections) => {
      };
      this.mapReduceSpotDirectionsToValue = (player, spotDirections, nextTurnPlayer) => {
        const opponentMarker = player === "x" ? "o" : "x";
        return spotDirections.map((lane) => {
          const strLane = lane.map((v) => v.spotState);
          const laneCount = (strLane.join("").match(new RegExp(`${player}`, "g")) || []).length;
          if (strLane.includes(opponentMarker)) {
            return 0;
          } else if (laneCount === this.length) {
            return Infinity;
          } else {
            return laneCount;
          }
        }).reduce((acc, v) => acc + v, 0);
      };
      this.logCurrentState = () => {
        for (const floor of this) {
          for (const row of floor) {
            console.log(row.join(" "));
          }
          console.log();
        }
        console.log("_______________");
      };
    }
  };
  var HumanPlayer = class {
    constructor(marker, parentGame, name) {
      this.marker = marker;
      this.parentGame = parentGame;
      this.name = name;
      this.plays = (desiredPlay) => {
        this.parentGame.turnPlayHandler(desiredPlay, this);
      };
    }
    getPlay() {
      let play;
      let playInput;
      const l = this.parentGame.board.length;
      const validDelimiter = new RegExp(/^(\d{1,}\s\d{1,}\s\d{1,})$/m);
      while (!play) {
        try {
          playInput = prompt(`${this.name} Please input your play in the format of Z Y X, delimited by a space`);
        } catch {
        }
        if (!playInput || !validDelimiter.test(playInput.trim())) {
          console.log("Input is not in the valid format, try again");
          continue;
        }
        ;
        play = this.validStringToPlay(playInput.trim());
        if (!this.parentGame.checkPlaySpotIsEmpty(play)) {
          console.log("Play spot is out of range or occuppied, try again");
          play = null;
        }
      }
      return play;
    }
    validStringToPlay(str) {
      const ZXY = str.split(/\s/gm);
      return {
        floor: +ZXY[0] - 1,
        row: +ZXY[1] - 1,
        col: +ZXY[2] - 1
      };
    }
    setName(name) {
      this.name = name;
    }
    to3Dcoord(floor, row, col) {
      return {
        floor,
        row,
        col
      };
    }
  };
  var CPU_Player = class {
    constructor(marker, parentGame, name) {
      this.marker = marker;
      this.parentGame = parentGame;
      this.name = name;
      this.plays = (desiredPlay) => {
        this.parentGame.turnPlayHandler(desiredPlay, this);
      };
      this.setDumb = () => {
        this.getPlay = this.randomMove;
        return this;
      };
      this.mapReduceSpotDirectionsToValue = this.parentGame.board.mapReduceSpotDirectionsToValue;
    }
    getPlay() {
      const winningMove = this.aboutToWinMove(this.marker);
      if (winningMove) {
        return winningMove;
      }
      const opponentMarker = this.marker === "x" ? "o" : "x";
      const opponentAboutToWin = this.aboutToWinMove(opponentMarker);
      if (opponentAboutToWin) {
        return opponentAboutToWin;
      }
      return this.getMostStackSpot();
    }
    to3Dcoord(floor, row, col) {
      return {
        floor,
        row,
        col
      };
    }
    aboutToWinMove(player) {
      const board = this.parentGame.board;
      const mask = board.stringMask();
      const childStates = mask.getAllChildStates(player);
      const l = board.length;
      for (let z = 0; z < l; z++) {
        for (let y = 0; y < l; y++) {
          for (let x = 0; x < l; x++) {
            const tentativeMove = this.to3Dcoord(z, y, x);
            if (board.getSpot(tentativeMove) !== "\xB7") {
              continue;
            }
            const lanes = board.getAllLinesFromSpot(tentativeMove);
            const occurrence = board.reduceSpotDirectionstoHighestOccurrences(player, lanes);
            if (occurrence.length === board.length - 1) {
              return tentativeMove;
            }
          }
        }
      }
      return false;
    }
    randomMove() {
      return this.to3Dcoord(
        Math.floor(Math.random() * this.parentGame.board.length),
        Math.floor(Math.random() * this.parentGame.board.length),
        Math.floor(Math.random() * this.parentGame.board.length)
      );
    }
    getMostStackSpot() {
      const l = this.parentGame.board.length;
      const opponentMarker = this.marker === "x" ? "o" : "x";
      if (this.isPlayerFirstMove()) {
        return (() => {
          const actualState = this.parentGame.board.stringMask();
          const allChildStates = actualState.getAllChildStates(this.marker);
          let moveImpact = 0;
          let move2 = this.randomMove();
          for (const childState of allChildStates) {
            const tentativeMove = this.differentiateMoveFromTwoStates(actualState, childState);
            if (tentativeMove.floor < l / 2 - 1 && tentativeMove.floor > l / 2 + 1) {
              continue;
            }
            const allLinesFromTentativeMove = this.parentGame.board.getAllLinesFromSpot(tentativeMove);
            const currentMoveImpact = allLinesFromTentativeMove.reduce((acc, v) => {
              const strLine = v.map((line) => line.spotState);
              if (strLine.includes(opponentMarker)) {
                return acc;
              } else {
                return acc + v.join("");
              }
            }, "").length;
            if (currentMoveImpact > moveImpact) {
              moveImpact = currentMoveImpact;
              move2 = tentativeMove;
            }
          }
          return move2;
        })();
      }
      let move = this.randomMove();
      let moveValue = this.mapReduceSpotDirectionsToValue(this.marker, this.parentGame.board.getAllLinesFromSpot(move));
      for (let z = 0; z < l; z++) {
        for (let y = 0; y < l; y++) {
          for (let x = 0; x < l; x++) {
            if (this.parentGame.board.getSpot(this.to3Dcoord(z, y, x)) !== "\xB7") {
              continue;
            }
            const currentSpotDirections = this.parentGame.board.getAllLinesFromSpot(this.to3Dcoord(z, y, x));
            const currentSpotValue = this.mapReduceSpotDirectionsToValue(this.marker, currentSpotDirections);
            if (currentSpotValue > moveValue) {
              move = this.to3Dcoord(z, y, x);
              moveValue = currentSpotValue;
            }
          }
        }
      }
      return move;
    }
    isPlayerFirstMove() {
      return !this.parentGame.board.stringMask().includes(this.marker);
    }
    // does not check if both are the same state
    differentiateMoveFromTwoStates(initialState, nextState) {
      const l = this.parentGame.board.length;
      const cleanMask = initialState.replace(/,|\||-/g, "");
      const cleanMask2 = nextState.replace(/,|\||-/g, "");
      let col = 0;
      for (; col < cleanMask.length; col++) {
        if (cleanMask[col] !== cleanMask2[col]) {
          break;
        }
      }
      let floor = 0;
      let row = 0;
      for (let i = 0; i < initialState.length; i++) {
        if (initialState[i] !== nextState[i]) {
          break;
        } else if (initialState[i] == "-") {
          row++;
        } else if (initialState[i] == "|") {
          row++;
          floor++;
        }
      }
      return this.to3Dcoord(floor, row % l, col % l);
    }
  };
  var Game = class {
    constructor(gridSize, cpuGame, cpuFirst) {
      this.gridSize = gridSize;
      this.cpuGame = cpuGame;
      this.cpuFirst = cpuFirst;
      this.setPlayIntoBoard = (played, from) => {
        this.board[played.floor][played.row][played.col] = from.marker;
        return this;
      };
      this.turnPlayHandler = (played, from) => {
        if (this.playerInTurn === from && this.checkPlaySpotIsEmpty(played)) {
          this.setPlayIntoBoard(played, from);
          this.switchPlayerTurn();
          this.updateUI();
          this.playLog.push(
            {
              from,
              cord: played
            }
          );
        }
      };
      this.getPlayerInTurn = () => {
        return this.playerInTurn;
      };
      this.checkPlaySpotIsEmpty = (coord) => {
        return this.board?.[coord.floor]?.[coord.row]?.[coord.col] === "\xB7";
      };
      this.updateUI = () => {
      };
      this.switchPlayerTurn = () => {
        this.playerInTurn === this.playerOne ? this.playerInTurn = this.playerTwo : this.playerInTurn = this.playerOne;
      };
      this.displayInLog = () => {
        for (const floor of this.board) {
          console.log(floor.join("\n").replace(/,/g, " "), "\n");
        }
        console.log("\n", "__________________", "\n");
      };
      this.checkTerminalState = (state, spot) => {
        const l = this.board.length;
        const boardState = state || this.board.stringMask();
        if (!spot) {
          for (let i = 0; i < l; i++) {
            for (let j = 0; j < l; j++) {
              for (let k = 0; k < l; k++) {
                const currentSpotDirections = this.board.getAllLinesFromSpot({
                  floor: i,
                  row: j,
                  col: k
                }, boardState);
                const highestXLine = this.board.reduceSpotDirectionstoHighestOccurrences("x", currentSpotDirections);
                if (highestXLine.length === this.board.length) {
                  return {
                    bol: Infinity,
                    line: highestXLine
                  };
                }
                const highestOLine = this.board.reduceSpotDirectionstoHighestOccurrences("o", currentSpotDirections);
                if (highestOLine.length === this.board.length) {
                  return {
                    bol: -Infinity,
                    line: highestOLine
                  };
                }
              }
            }
          }
          return {
            bol: false,
            line: null
          };
        } else {
          const marker = boardState.stringUnmask()[spot.floor][spot.row][spot.col];
          const spotDirections = this.board.getAllLinesFromSpot({
            floor: spot.floor,
            row: spot.row,
            col: spot.col
          }, boardState);
          const highestLine = this.board.reduceSpotDirectionstoHighestOccurrences(marker, spotDirections);
          if (highestLine.length === this.board.length) {
            return {
              bol: true,
              line: highestLine
            };
          } else
            return {
              // still going
              bol: false,
              line: highestLine
            };
        }
      };
      this.checkWin = (state, spot) => {
        const isTerminal = this.checkTerminalState(state, spot);
        if (isTerminal.bol) {
          this.finish = true;
          this.winner = this.playerOne === this.getPlayerInTurn() ? this.playerTwo : this.playerOne;
        }
        return isTerminal;
      };
      this.isFinish = () => {
        return this.finish;
      };
      this.setGameAsCPUOnly = (setDumbPlayer, isP1Dumb) => {
        if (this.board.stringMask().includes("o") || this.board.stringMask().includes("x")) {
          return;
        }
        this.playerOne = new CPU_Player("x", this, "cpu1");
        this.playerTwo = new CPU_Player("o", this, "cpu2");
        if (setDumbPlayer && isP1Dumb) {
          this.playerOne = new CPU_Player("x", this, "cpu1").setDumb();
        } else if (setDumbPlayer) {
          this.playerTwo = new CPU_Player("o", this, "cpu2").setDumb();
        }
        this.playerInTurn = this.playerOne;
      };
      this.playLog = [];
      if (this.gridSize < 3)
        this.gridSize = 3;
      this.finish = false;
      const initialBoard = [];
      for (let i = 0; i < gridSize; i++) {
        const floor = [];
        for (let j = 0; j < gridSize; j++) {
          const row = [];
          for (let k = 0; k < gridSize; k++) {
            row.push("\xB7");
          }
          floor.push(row);
        }
        initialBoard.push(floor);
      }
      this.board = new full3Dboard(...initialBoard);
      this.playerOne = new HumanPlayer("x", this, "p1");
      this.playerTwo = new HumanPlayer("o", this, "p2");
      if (this.cpuGame && this.cpuFirst) {
        this.playerOne = new CPU_Player("x", this, "cpu");
      } else if (this.cpuGame) {
        this.playerTwo = new CPU_Player("o", this, "cpu");
      }
      this.playerInTurn = this.playerOne;
    }
  };
  var maskedBoard = class _maskedBoard extends String {
    constructor(boardState) {
      super(
        // workaround for super() call
        (() => {
          const str = [];
          for (let i = 0; i < boardState.length; i++) {
            str.push(boardState[i].join("-").replace(/,/g, ""));
          }
          return str;
        })().join("|").replace(/,/g, "")
      );
      this.stringUnmask = () => {
        const board = this.split("|").map((floor) => floor.split("-").map((row) => row.split("")));
        return new full3Dboard(...board);
      };
      this.getAllChildStates = (player) => {
        const states = [];
        for (let i = 0; i < this.length; i++) {
          if (this[i] === "\xB7") {
            const child = this.split("");
            child[i] = player;
            const state = child.join().replace(/,/g, "").split("|").map((floor) => floor.split("-").map((row) => row.split("")));
            states.push(new _maskedBoard(state));
          }
        }
        return states;
      };
    }
  };
  function addVectors(a, b) {
    const resultingVector = {
      col: a.col + b.col,
      row: a.row + b.row,
      floor: a.floor + b.floor
    };
    return resultingVector;
  }
  function substractVectors(a, b) {
    const resultingVector = {
      col: a.col - b.col,
      row: a.row - b.row,
      floor: a.floor - b.floor
    };
    return resultingVector;
  }

  // src/ts/index.ts
  var nGridSizeInput = document.querySelector("#n-grid-size-input");
  var gridSizeOutput = nGridSizeInput.nextElementSibling;
  gridSizeOutput.innerText = nGridSizeInput.value;
  nGridSizeInput.oninput = () => {
    gridSizeOutput.innerText = nGridSizeInput.value;
  };
  var startGameBtn = document.querySelector("#new-game");
  startGameBtn.addEventListener("click", async () => {
    const cpuGameCheckbox = document.querySelector("#cpu-game");
    const cpuFirstCheckbox = document.querySelector("#cpu-first");
    const cpuOnlyCheckbox = document.querySelector("#cpu-only");
    const runningGame = new Game(+nGridSizeInput.value, cpuGameCheckbox.checked, cpuFirstCheckbox.checked);
    if (cpuOnlyCheckbox.checked) {
      let gameLoop2 = function() {
        if (runningGame.isFinish()) {
          return;
        }
        const playerInTurn = runningGame.getPlayerInTurn();
        const desiredPlay = playerInTurn.getPlay();
        playerInTurn.plays(desiredPlay);
        const playedSpot = document.querySelector(`[data-cord="(${desiredPlay.floor},${desiredPlay.row},${desiredPlay.col})"]`);
        playedSpot.innerText = playerInTurn.marker;
        const emptyImg = document.createElement("img");
        emptyImg.setAttribute("src", "./assets/transparent.webp");
        emptyImg.style.position = "absolute";
        playedSpot.appendChild(
          emptyImg
        );
        emptyImg.addEventListener("load", () => {
          gameLoop2();
        });
        updateDOMcheckWin(runningGame, desiredPlay);
      };
      var gameLoop = gameLoop2;
      const p1Dumb = confirm("Player 1 is dumb?");
      const p2Dumb = confirm("Player 2 is dumb?");
      runningGame.setGameAsCPUOnly(p1Dumb, p2Dumb);
      composeDOMboard(runningGame);
      gameLoop2();
    } else {
      composeDOMboard(runningGame, true);
      if (cpuGameCheckbox.checked && cpuFirstCheckbox.checked) {
      }
    }
  });
  function composeDOMboard(runningGame, isHumanPlaying) {
    const boards = document.querySelector("#boards");
    if (boards) {
      boards.innerHTML = "";
      const l = runningGame.board.length;
      for (let i = 0; i < l; i++) {
        const floorDiv = document.createElement("div");
        floorDiv.classList.add("boardFloor");
        floorDiv.style.gridTemplateColumns = `repeat(${l}, 100px)`;
        floorDiv.style.gridTemplateRows = `repeat(${l}, 100px)`;
        for (let j = 0; j < l; j++) {
          for (let k = 0; k < l; k++) {
            const square = document.createElement("div");
            square.dataset.cord = `(${i},${j},${k})`;
            square.innerText = runningGame.board[i][j][k];
            square.classList.add("spot");
            if (j === 0) {
              square.classList.add("top");
            }
            if (j === l - 1) {
              square.classList.add("bottom");
            }
            if (k === 0) {
              square.classList.add("left");
            }
            if (k === l - 1) {
              square.classList.add("right");
            }
            if (isHumanPlaying) {
              square.addEventListener("click", () => {
                if (square.innerText !== "\xB7" || runningGame.isFinish()) {
                  return;
                }
                const playingPlayer = runningGame.getPlayerInTurn();
                const desiredPlay = playingPlayer.to3Dcoord(i, j, k);
                playingPlayer.plays(desiredPlay);
                square.innerText = playingPlayer.marker;
                updateDOMcheckWin(runningGame, desiredPlay);
              });
            }
            floorDiv.appendChild(square);
          }
        }
        boards.appendChild(floorDiv);
      }
    }
    ;
  }
  function updateDOMcheckWin(runningGame, desiredPlay) {
    const winningLine = runningGame.checkWin(runningGame.board.stringMask(), desiredPlay).line;
    if (runningGame.isFinish()) {
      winningLine?.forEach((spot) => {
        const winningSpot = document.querySelector(`[data-cord="(${spot.cord.floor},${spot.cord.row},${spot.cord.col})"]`);
        if (winningSpot) {
          winningSpot.style.backgroundColor = "lightgreen";
          winningSpot.style.color = "black";
        }
      });
      console.log(runningGame.playLog);
    }
  }
})();
