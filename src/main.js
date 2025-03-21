import './style.css'

import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, EVENT_MOVEMENT } from './consts'
// canvas initialize
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const $score = document.querySelector('span')

let score = 0

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

function createBoard(width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

// player piece
const piece = {
  position: {x: 5, y: 5},
  shape: [
    [1, 1],
    [1, 1]
  ]
}

// random pieces
const PIECES = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [1, 1, 1],
    [1, 0, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 0, 1],
    [1, 1, 1]
  ]
]

// game loop
//function update(){
//draw()
//window.requestAnimationFrame(update)
//} 

// auto drop
let dropCounter = 0
let lastTime = 0

function update(time = 0){
  console.log(time)
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if(dropCounter > 1000){
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
    dropCounter = 0
  }

  draw()
  window.requestAnimationFrame(update)
} 

// draw pieces
function draw(){
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value == 1) {
        context.fillStyle = 'white'
        context.fillRect(x, y, 1, 1)
      }
    })  
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'green'
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
      }
    })  
  })

  $score.innerText = score
}

// movement of pieces
document.addEventListener('keydown', event => {
  if (event.key == EVENT_MOVEMENT.LEFT) {
    piece.position.x--
    if (checkCollision()) {
      piece.position.x++
    }
  } 
  if (event.key == EVENT_MOVEMENT.RIGHT) {
    piece.position.x++
    if (checkCollision()) {
      piece.position.x--
    }
  } 
  if (event.key == EVENT_MOVEMENT.DOWN) {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  
  if (event.key == EVENT_MOVEMENT.UP) {
    const rotated = []
    
    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []

      for (let j = piece.shape.length - 1; j >= 0; j--){
        row.push(piece.shape[j][i])
      }

      rotated.push(row)
    }
    
    const previousShape = piece.shape
    piece.shape = rotated
    if (checkCollision()){
      piece.shape = previousShape
    }
  }
})

// check collision
function checkCollision () {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return ( 
        value != 0 && 
        board[y + piece.position.y]?.[x + piece.position.x] != 0
      )
    })
  })
}

// solidify piece
function solidifyPiece(){
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value == 1) {
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })  
  })

  // get random shape
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  
  // reset position
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2)
  piece.position.y = 0
  
  // game over
  if (checkCollision()){
    window.alert('Game Over :( ')
    board.forEach((row) => row.fill(0))
  } 
}

// remove rows
function removeRows() {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every(value => value == 1)) {
      rowsToRemove.push(y)
    }
  })
  
  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(newRow)
    score += 10
  })

}

const $section = document.querySelector('section')

$section.addEventListener('click', () => {
  update()

  $section.remove()
  const audio = new Audio ('./Tetris.mp3')
  audio.volume = 0.01
  audio.play()
})

//movile movement
let touchStartX = 0
let touchStartY = 0
let touchEndX = 0
let touchEndY = 0

document.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].screenX
  touchStartY = event.changedTouches[0].screenY
})

document.addEventListener('touchend', event => {
  touchEndX = event.changedTouches[0].screenX
  touchEndY = event.changedTouches[0].screenY
  handleGesture()
})

function handleGesture() {
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      // Deslizar a la derecha
      piece.position.x++
      if (checkCollision()) {
        piece.position.x--
      }
    } else {
      // Deslizar a la izquierda
      piece.position.x--
      if (checkCollision()) {
        piece.position.x++
      }
    }
  } else {
    if (deltaY > 0) {
      // Deslizar hacia abajo
      piece.position.y++
      if (checkCollision()) {
        piece.position.y--
        solidifyPiece()
        removeRows()
      }
    } else {
      // Deslizar hacia arriba (rotar pieza)
      const rotated = []
      for (let i = 0; i < piece.shape[0].length; i++) {
        const row = []
        for (let j = piece.shape.length - 1; j >= 0; j--) {
          row.push(piece.shape[j][i])
        }
        rotated.push(row)
      }
      const previousShape = piece.shape
      piece.shape = rotated
      if (checkCollision()) {
        piece.shape = previousShape
      }
    }
  }
}


