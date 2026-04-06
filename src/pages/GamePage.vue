<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SudokuBoard from '../components/SudokuBoard.vue';
import NumberKeyboard from '../components/NumberKeyboard.vue';
import { generateSudoku, checkBoardErrors, isBoardComplete, isBoardCorrect, formatTime } from '../lib/sudoku';
import { RotateCcw, Trophy, Clock, CheckCircle2, ArrowLeft, Check } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const difficulty = ref('easy');
const board = ref(Array(9).fill(null).map(() => Array(9).fill(null)));
const solution = ref(Array(9).fill(null).map(() => Array(9).fill(null)));
const initialBoard = ref(Array(9).fill(null).map(() => Array(9).fill(null)));
const selectedCell = ref(null);
const errors = ref(Array(9).fill(false).map(() => Array(9).fill(false)));
const timer = ref(0);
const gameWon = ref(false);
const gameStarted = ref(false);
const showKeyboard = ref(false);
const showValidation = ref(false);
const stats = reactive({
  gamesPlayed: 0,
  bestTime: {
    easy: null,
    medium: null,
    hard: null
  }
});

let timerInterval = null;
let unregisterRouterGuard = null;

function startNewGame() {
  const { board: newBoard, solution: newSolution } = generateSudoku(difficulty.value);
  board.value = newBoard.map(row => [...row]);
  initialBoard.value = newBoard.map(row => [...row]);
  solution.value = newSolution;
  selectedCell.value = null;
  showKeyboard.value = false;
  errors.value = checkBoardErrors(newBoard);
  timer.value = 0;
  gameWon.value = false;
  gameStarted.value = true;
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer.value++;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function selectCell(row, col) {
  selectedCell.value = { row, col };
  showKeyboard.value = true;
}

function inputNumber(num) {
  if (!selectedCell.value || gameWon.value) return;
  
  const { row, col } = selectedCell.value;
  
  if (initialBoard.value[row][col] !== null) return;
  
  board.value[row][col] = num;
  
  // 根据难度级别决定是否进行实时错误检查
  if (difficulty.value === 'easy') {
    // 简单模式：实时检查错误
    errors.value = checkBoardErrors(board.value);
  } else if (difficulty.value === 'medium') {
    // 中等模式：部分提示（只检查当前行、列和宫格）
    const boardErrors = checkBoardErrors(board.value);
    errors.value = Array(9).fill(false).map(() => Array(9).fill(false));
    errors.value[row][col] = boardErrors[row][col];
  }
  // 困难模式：不进行任何提示
  
  checkWin();
}

function deleteNumber() {
  if (!selectedCell.value || gameWon.value) return;
  
  const { row, col } = selectedCell.value;
  
  if (initialBoard.value[row][col] !== null) return;
  
  board.value[row][col] = null;
  
  // 根据难度级别决定是否进行实时错误检查
  if (difficulty.value === 'easy') {
    errors.value = checkBoardErrors(board.value);
  } else if (difficulty.value === 'medium') {
    // 中等模式：重新检查所有错误
    const boardErrors = checkBoardErrors(board.value);
    errors.value = Array(9).fill(false).map(() => Array(9).fill(false));
    // 只标记当前行、列和宫格的错误
    for (let i = 0; i < 9; i++) {
      if (boardErrors[row][i]) errors.value[row][i] = true;
      if (boardErrors[i][col]) errors.value[i][col] = true;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (boardErrors[i][j]) errors.value[i][j] = true;
      }
    }
  }
  // 困难模式：不进行任何提示
}

function checkWin() {
  if (isBoardComplete(board.value) && isBoardCorrect(board.value, solution.value)) {
    gameWon.value = true;
    showKeyboard.value = false;
    stopTimer();
    updateStats();
  }
}

function validateBoard() {
  if (!isBoardComplete(board.value)) {
    alert('请完成所有空格后再提交！');
    return;
  }
  
  // 验证时总是显示所有错误，不考虑难度级别
  const boardErrors = checkBoardErrors(board.value);
  errors.value = boardErrors;
  showValidation.value = true;
  
  if (isBoardCorrect(board.value, solution.value)) {
    gameWon.value = true;
    showKeyboard.value = false;
    stopTimer();
    updateStats();
  }
}

function updateStats() {
  stats.gamesPlayed++;
  const currentBest = stats.bestTime[difficulty.value];
  if (currentBest === null || timer.value < currentBest) {
    stats.bestTime[difficulty.value] = timer.value;
  }
  saveStats();
}

function saveStats() {
  localStorage.setItem('sudoku-stats', JSON.stringify(stats));
}

function saveGameProgress() {
  const progress = {
    difficulty: difficulty.value,
    board: board.value,
    solution: solution.value,
    initialBoard: initialBoard.value,
    timer: timer.value
  };
  localStorage.setItem('sudoku-progress', JSON.stringify(progress));
}

function loadStats() {
  const saved = localStorage.getItem('sudoku-stats');
  if (saved) {
    const parsed = JSON.parse(saved);
    stats.gamesPlayed = parsed.gamesPlayed || 0;
    stats.bestTime = parsed.bestTime || { easy: null, medium: null, hard: null };
  }
}

function hasProgress() {
  return localStorage.getItem('sudoku-progress') !== null;
}

function goBack() {
  if (gameStarted.value && !gameWon.value) {
    if (confirm('是否保存当前游戏进度？')) {
      saveGameProgress();
    } else {
      localStorage.removeItem('sudoku-progress');
    }
  }
  router.push({ name: 'start' });
}

function changeDifficulty(level) {
  if (gameStarted.value && !gameWon.value) {
    if (confirm('切换难度将重置当前游戏，确定继续吗？')) {
      difficulty.value = level;
      localStorage.removeItem('sudoku-progress');
      startNewGame();
    }
  } else {
    difficulty.value = level;
    localStorage.removeItem('sudoku-progress');
    startNewGame();
  }
}

watch(() => route.query, (query) => {
  if (query.continue === 'true') {
    const saved = localStorage.getItem('sudoku-progress');
    if (saved) {
      const progress = JSON.parse(saved);
      difficulty.value = progress.difficulty;
      board.value = progress.board;
      solution.value = progress.solution;
      initialBoard.value = progress.initialBoard;
      timer.value = progress.timer;
      selectedCell.value = null;
      showKeyboard.value = false;
      errors.value = checkBoardErrors(board.value);
      gameWon.value = false;
      gameStarted.value = true;
      startTimer();
    }
  } else if (query.difficulty) {
    difficulty.value = query.difficulty;
    startNewGame();
  }
}, { immediate: true });

onMounted(() => {
  loadStats();
  
  unregisterRouterGuard = router.beforeEach((to, from, next) => {
    if (from.name === 'game' && to.name !== 'game' && gameStarted.value && !gameWon.value) {
      if (confirm('是否保存当前游戏进度？')) {
        saveGameProgress();
      } else {
        localStorage.removeItem('sudoku-progress');
      }
    }
    next();
  });
});

onUnmounted(() => {
  stopTimer();
  if (unregisterRouterGuard && typeof unregisterRouterGuard === 'function') {
    unregisterRouterGuard();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="container mx-auto px-4 py-6 max-w-2xl flex-1 flex flex-col">
      <header class="flex justify-between items-center mb-6">
        <button
          @click="goBack"
          class="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors active:scale-95"
        >
          <ArrowLeft class="w-6 h-6 text-gray-700" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900">
          🧩 数独游戏
        </h1>
        <div class="w-12"></div>
      </header>

      <div class="flex justify-center items-center gap-6 mb-4">
        <div class="flex items-center gap-2 text-gray-700">
          <Clock class="w-5 h-5" />
          <span class="text-lg sm:text-xl font-mono">{{ formatTime(timer) }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-700">
          <Trophy class="w-5 h-5" />
          <span class="text-base sm:text-lg">{{ stats.gamesPlayed }} 局</span>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center mb-6">
        <SudokuBoard
          :board="board"
          :solution="solution"
          :selected-cell="selectedCell"
          :errors="errors"
          :difficulty="difficulty"
          @select-cell="selectCell"
        />
      </div>

      <div class="flex justify-center gap-4">
        <button
          @click="validateBoard"
          class="px-6 py-3 bg-green-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-600 transition-all active:scale-95 shadow-lg touch-action-manipulation"
        >
          <Check class="w-5 h-5" />
          验证答案
        </button>
        <button
          @click="startNewGame"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-lg touch-action-manipulation"
        >
          <RotateCcw class="w-5 h-5" />
          新游戏
        </button>
      </div>
    </div>

    <transition name="slide-up">
      <NumberKeyboard
        v-if="showKeyboard"
        :disabled="gameWon"
        @input-number="inputNumber"
        @delete="deleteNumber"
      />
    </transition>

    <div v-if="gameWon" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
        <CheckCircle2 class="w-16 sm:w-20 h-16 sm:h-20 text-green-500 mx-auto mb-4" />
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          🎉 恭喜获胜！
        </h2>
        <p class="text-gray-600 mb-2">
          用时：{{ formatTime(timer) }}</p>
        <p class="text-gray-600 mb-6">
          难度：{{ difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难' }}
        </p>
        <div class="flex gap-3">
          <button
            @click="startNewGame"
            class="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all touch-action-manipulation"
          >
            再来一局
          </button>
          <button
            @click="goBack"
            class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all touch-action-manipulation"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
