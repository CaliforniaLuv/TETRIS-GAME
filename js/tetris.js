import BLOCKS from "./blocks.js";


const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score")
const playground = document.querySelector(".playground > ul");
const reStartButton = document.querySelector(".game-text > button");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;
let score = 0;
// 블럭이 떨어지는 시간
let duration = 500;
let downInterval;
// 무빙을 실행 전 잠시 담아둠
let tempMovingItem;


// 다음 블록의 타입과 좌표
const movingItem = {
    type: "",
    // 화살표 키를 통해 좌, 우 도형 형태 변경
    direction: 3, 
    top: 0,
    left: 0,
}

init()


function init() {
    tempMovingItem = {...movingItem};
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine()
    }
    generateNewBlock()
}


function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j = 0; j < GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}


function renderBlocks(moveType = "") {
    const {type, direction, top, left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving")
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving")
    })
    
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null
        const isAvailable = checkEmpty(target);

        if(isAvailable) {
            target.classList.add(type, "moving")
        } else {
            tempMovingItem = { ...movingItem }
            // maxium callstack 방지하에 settimeout
            if(moveType === 'retry') {
                clearInterval(downInterval);
                showGameoverText()
            }
            setTimeout(() => {
                // 재귀함수    
                renderBlocks('retry')
                if(moveType === "top") {
                    sizeBlock();
                }
            }, 0)
            return true;
        }
    })
    // 새로 업데이트
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function showGameoverText() {
    gameText.style.display = "flex"
}

// 맨 밑 정착 시 더이상 못내려가도록 막는 역할
function sizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving")
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving")
        moving.classList.add("seized")
    })
    checkMatch()
}

function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child=> {
        let matched = true;
        child.children[0].childNodes.forEach(li=> {
            if(!li.classList.contains("seized")) {
                matched = false
            }
        })
        if(matched) {
            child.remove();
            // 한줄이 없어질 때마다  
            prependNewLine()
            score++
            scoreDisplay.innerText = score;
        }
    })
    generateNewBlock()
}

function generateNewBlock() {

    // 자동으로 밑으로 내려가는 액션
    clearInterval(downInterval);
    downInterval = setInterval(()=> {
        moveBlock('top', 1)
    }, duration)

    const blockArray = Object.entries(BLOCKS)
    const randomIndex = Math.floor(Math.random() * blockArray.length)
    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem };
    renderBlocks();
}

function checkEmpty(target) {
    if(!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount
    renderBlocks(moveType)
}

function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks()
}

function dropBlock() {
    clearInterval(downInterval)
    downInterval = setInterval(() => {
       moveBlock("top", 1) 
    }, 10);
}


// event handling
document.addEventListener("keydown", e => {
    switch(e.keyCode) {
        case 39:
                moveBlock("left", 1);
                break;
        case 37:
                moveBlock("left", -1)
                break;
        case 40:
                moveBlock("top", 1);
                break;                      
        case 38: 
                changeDirection();
                break;
        case 32:
                dropBlock()
                break;        
        default:
                break;
    }

    reStartButton.addEventListener("click", () => {
        playground.innerHTML = "";
        gameText.style.display = "none";
        init();   
    })   
})