// JSの冒頭あたりに追加
let blackImgUrl = '';
let whiteImgUrl = '';

// ファイル読み込み処理
document.getElementById('blackInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        blackImgUrl = URL.createObjectURL(file);
        const avatarLeft = document.getElementById('avatar-left');
        avatarLeft.src = blackImgUrl;
        avatarLeft.style.display = 'block';
        renderBoard(); // 読み込んだら即座に盤面を更新
    }
});

document.getElementById('whiteInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        whiteImgUrl = URL.createObjectURL(file);
        const avatarRight = document.getElementById('avatar-right');
        avatarRight.src = whiteImgUrl;
        avatarRight.style.display = 'block';
        renderBoard();
    }
});
// --- 設定・定数 ---
const BOARD_SIZE = 32;
const player1Name = 'Aさん';
const player2Name = 'Bさん';

// --- 変数 ---
let board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
let currentPlayer = 1; // 1:黒, 2:白

// 初期配置
board[15][15] = 2; board[15][16] = 1;
board[16][15] = 1; board[16][16] = 2;

const directions = [
    [-1,-1], [-1,0], [-1,1],
    [0,-1],           [0,1],
    [1,-1],  [1,0],  [1,1]
];

// --- 画面表示系 ---

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; 

    // renderBoard 内のループ内を以下のように変更
for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        // --- ここを修正 ---
        if (board[r][c] === 1) {
            if (blackImgUrl) {
                cell.style.backgroundImage = `url(${blackImgUrl})`;
                cell.style.backgroundSize = 'cover'; // マスに合わせる
                cell.style.backgroundPosition = 'center';  // ★ここを追加：画像を中央寄せにする
            } else {
                cell.classList.add('black'); // 画像がない時は元の色
            }
        }
        if (board[r][c] === 2) {
            if (whiteImgUrl) {
                cell.style.backgroundImage = `url(${whiteImgUrl})`;
                cell.style.backgroundSize = 'cover';
                cell.style.backgroundPosition = 'center';
            } else {
                cell.classList.add('white');
            }
        }
        // -----------------
        
        cell.onclick = () => handleCellClick(r, c);
        boardElement.appendChild(cell);
        }
    }
}
// 順番表示を更新する関数
function updateTurnDisplay() {
    const turnDisplay = document.getElementById('turn-display');
    // 名前を切り替えて表示
    const name = (currentPlayer === 1) ? player1Name : player2Name;
    turnDisplay.innerText = `現在のターンは${name}です`;
}

// --- ロジック・ルール系 ---

// 特定のマスで挟める石のリストを取得する（挟めないなら空の配列）
function getFlippableCells(r, c, player) {
    let allCellsToFlip = [];
    
    directions.forEach(([dr, dc]) => {
        let cellsToFlip = [];
        let nr = r + dr;
        let nc = c + dc;

        while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === (3 - player)) {
            cellsToFlip.push([nr, nc]);
            nr += dr;
            nc += dc;
        }

        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
            allCellsToFlip = allCellsToFlip.concat(cellsToFlip);
        }
    });
    return allCellsToFlip;
}

// プレイヤーがどこかに置けるかチェックする
function hasValidMove(player) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0 && getFlippableCells(r, c, player).length > 0) return true;
        }
    }
    return false;
}

// --- メイン処理 ---

function handleCellClick(r, c) {
    if (board[r][c] !== 0) return; // すでに石がある場所は無視

    const flippable = getFlippableCells(r, c, currentPlayer);

    if (flippable.length === 0) {
        alert("そこには置けません！");
        return;
    }

    // 1. 石を置く＆裏返す
    board[r][c] = currentPlayer;
    flippable.forEach(([fr, fc]) => {
        board[fr][fc] = currentPlayer;
    });

    // 2. ターン交代
    currentPlayer = 3 - currentPlayer;

    // 3. 次のプレイヤーが置ける場所があるかチェック（パス判定）
    if (!hasValidMove(currentPlayer)) {
        if (!hasValidMove(3 - currentPlayer)) {
            alert("両者置ける場所がないため終了です！");
        } else {
            const name = (currentPlayer === 1) ? player1Name : player2Name;
            alert(`${name}は置ける場所がないためパスします！`);
            currentPlayer = 3 - currentPlayer; // パスして手番を戻す
        }
    }

    updateTurnDisplay();
    renderBoard();
}

// --- 初期実行 ---
updateTurnDisplay();
renderBoard();