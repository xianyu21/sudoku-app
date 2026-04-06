export const DIFFICULTY_LEVELS = {
  easy: 30,
  medium: 45,
  hard: 60,
};

export function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateSudoku(difficulty) {
  const board = Array(9).fill(null).map(() => Array(9).fill(null));
  
  solveSudoku(board);
  
  const solution = board.map(row => [...row]);
  
  const cellsToRemove = DIFFICULTY_LEVELS[difficulty];
  const positions = [];
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }
  
  const shuffledPositions = shuffleArray(positions);
  
  for (let i = 0; i < cellsToRemove; i++) {
    const [row, col] = shuffledPositions[i];
    board[row][col] = null;
  }
  
  return { board, solution };
}

export function checkBoardErrors(board) {
  const errors = Array(9).fill(false).map(() => Array(9).fill(false));
  
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const num = board[row][col];
      if (num !== null) {
        if (seen.has(num)) {
          errors[row][col] = true;
          for (let c = 0; c < col; c++) {
            if (board[row][c] === num) {
              errors[row][c] = true;
            }
          }
        }
        seen.add(num);
      }
    }
  }
  
  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const num = board[row][col];
      if (num !== null) {
        if (seen.has(num)) {
          errors[row][col] = true;
          for (let r = 0; r < row; r++) {
            if (board[r][col] === num) {
              errors[r][col] = true;
            }
          }
        }
        seen.add(num);
      }
    }
  }
  
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set();
      const positions = [];
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          const num = board[row][col];
          if (num !== null) {
            positions.push([row, col]);
            if (seen.has(num)) {
              errors[row][col] = true;
              for (const [r, c] of positions) {
                if (board[r][c] === num && (r !== row || c !== col)) {
                  errors[r][c] = true;
                }
              }
            }
            seen.add(num);
          }
        }
      }
    }
  }
  
  return errors;
}

export function isBoardComplete(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

export function isBoardCorrect(board, solution) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
