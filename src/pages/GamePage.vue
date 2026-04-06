<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import SudokuBoard from '../components/SudokuBoard.vue';
import NumberKeyboard from '../components/NumberKeyboard.vue';
import { generateSudoku, checkBoardErrors, isBoardComplete, isBoardCorrect, formatTime } from '../lib/sudoku';
import { Moon, Sun, RotateCcw, Trophy, Clock, CheckCircle2, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const { theme, toggleTheme, isDark } = useTheme();

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
  errors.value = checkBoardErrors(board.value);
  
  checkWin();
}

function deleteNumber() {
  if (!selectedCell.value || gameWon.value) return;
  
  const { row, col } = selectedCell.value;
  
  if (initialBoard.value[row][col] !== null) return;
  
  board.value[row][col] = null;
  errors.value = checkBoardErrors(board.value);
}

function checkWin() {
  if (isBoardComplete(board.value) && isBoardCorrect(board.value, solution.value)) {
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
    <div class="container mx-auto px-4 py-6 max-w-2xl flex-1 flex flex-col">
      <header class="flex justify-between items-center mb-6">
        <button
          @click="goBack"
          class="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          <ArrowLeft class="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          🧩 数独游戏
        </h1>
        <button
          @click="toggleTheme"
          class="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          <Sun v-if="isDark" class="w-6 h-6 text-yellow-500" />
          <Moon v-else class="w-6 h-6 text-gray-700" />
        </button>
      </header>

      <div class="flex justify-center gap-3 mb-4">
        <button
          v-for="level in ['easy', 'medium', 'hard']"
          :key="level"
          @click="changeDifficulty(level)"
          :disabled="gameStarted && !gameWon"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all active:scale-95 touch-action-manipulation',
            difficulty === level
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
            (gameStarted && !gameWon) && 'opacity-50 cursor-not-allowed'
          ]"
        >
          {{ level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难' }}
        </button>
      </div>

      <div class="flex justify-center items-center gap-6 mb-4">
        <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Clock class="w-5 h-5" />
          <span class="text-lg sm:text-xl font-mono">{{ formatTime(timer) }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
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
      <div class="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
        <CheckCircle2 class="w-16 sm:w-20 h-16 sm:h-20 text-green-500 mx-auto mb-4" />
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎉 恭喜获胜！
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-2">
          用时：{{ formatTime(timer) }}</p>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
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
            class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all touch-action-manipulation"
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
