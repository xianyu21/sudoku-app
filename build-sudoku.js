
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sudokuTsContent = `export const DIFFICULTY_LEVELS = {
  easy: 30,
  medium: 45,
  hard: 60,
};

export function isValid(board, row, col, num) {
  for (let i = 0; i &lt; 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

function solveSudoku(board) {
  for (let row = 0; row &lt; 9; row++) {
    for (let col = 0; col &lt; 9; col++) {
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
  for (let i = newArray.length - 1; i &gt; 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateSudoku(difficulty) {
  const board = Array(9).fill(null).map(() =&gt; Array(9).fill(null));
  
  solveSudoku(board);
  
  const solution = board.map(row =&gt; [...row]);
  
  const cellsToRemove = DIFFICULTY_LEVELS[difficulty];
  const positions = [];
  
  for (let i = 0; i &lt; 9; i++) {
    for (let j = 0; j &lt; 9; j++) {
      positions.push([i, j]);
    }
  }
  
  const shuffledPositions = shuffleArray(positions);
  
  for (let i = 0; i &lt; cellsToRemove; i++) {
    const [row, col] = shuffledPositions[i];
    board[row][col] = null;
  }
  
  return { board, solution };
}

export function checkBoardErrors(board) {
  const errors = Array(9).fill(false).map(() =&gt; Array(9).fill(false));
  
  for (let row = 0; row &lt; 9; row++) {
    const seen = new Set();
    for (let col = 0; col &lt; 9; col++) {
      const num = board[row][col];
      if (num !== null) {
        if (seen.has(num)) {
          errors[row][col] = true;
          for (let c = 0; c &lt; col; c++) {
            if (board[row][c] === num) {
              errors[row][c] = true;
            }
          }
        }
        seen.add(num);
      }
    }
  }
  
  for (let col = 0; col &lt; 9; col++) {
    const seen = new Set();
    for (let row = 0; row &lt; 9; row++) {
      const num = board[row][col];
      if (num !== null) {
        if (seen.has(num)) {
          errors[row][col] = true;
          for (let r = 0; r &lt; row; r++) {
            if (board[r][col] === num) {
              errors[r][col] = true;
            }
          }
        }
        seen.add(num);
      }
    }
  }
  
  for (let boxRow = 0; boxRow &lt; 3; boxRow++) {
    for (let boxCol = 0; boxCol &lt; 3; boxCol++) {
      const seen = new Set();
      const positions = [];
      
      for (let i = 0; i &lt; 3; i++) {
        for (let j = 0; j &lt; 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          const num = board[row][col];
          if (num !== null) {
            positions.push([row, col]);
            if (seen.has(num)) {
              errors[row][col] = true;
              for (const [r, c] of positions) {
                if (board[r][c] === num &amp;&amp; (r !== row || c !== col)) {
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
  for (let row = 0; row &lt; 9; row++) {
    for (let col = 0; col &lt; 9; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

export function isBoardCorrect(board, solution) {
  for (let row = 0; row &lt; 9; row++) {
    for (let col = 0; col &lt; 9; col++) {
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
  return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
}
`;

const sudokuBoardVueContent = `&lt;script setup&gt;
import { computed } from 'vue';

const props = defineProps({
  board: Array,
  solution: Array,
  selectedCell: Object,
  errors: Array,
  difficulty: String
});

const emit = defineEmits(['select-cell']);

const initialBoard = computed(() =&gt; {
  const initial = Array(9).fill(null).map(() =&gt; Array(9).fill(null));
  for (let row = 0; row &lt; 9; row++) {
    for (let col = 0; col &lt; 9; col++) {
      initial[row][col] = props.board[row][col];
    }
  }
  return initial;
});

function isSameRow(row) {
  return props.selectedCell !== null &amp;&amp; props.selectedCell.row === row;
}

function isSameCol(col) {
  return props.selectedCell !== null &amp;&amp; props.selectedCell.col === col;
}

function isSameBox(row, col) {
  if (!props.selectedCell) return false;
  const selectedBoxRow = Math.floor(props.selectedCell.row / 3);
  const selectedBoxCol = Math.floor(props.selectedCell.col / 3);
  const currentBoxRow = Math.floor(row / 3);
  const currentBoxCol = Math.floor(col / 3);
  return selectedBoxRow === currentBoxRow &amp;&amp; selectedBoxCol === currentBoxCol;
}

function isSameNumber(row, col) {
  if (!props.selectedCell) return false;
  const selectedValue = props.board[props.selectedCell.row][props.selectedCell.col];
  const currentValue = props.board[row][col];
  return selectedValue !== null &amp;&amp; currentValue !== null &amp;&amp; selectedValue === currentValue;
}

function getCellClass(row, col) {
  const classes = [];
  const isSelected = props.selectedCell?.row === row &amp;&amp; props.selectedCell?.col === col;
  const isFixed = initialBoard.value[row][col] !== null;
  const hasError = props.errors[row][col];
  const value = props.board[row][col];

  if (isSelected) {
    classes.push('bg-blue-500 text-white');
  } else if (isSameNumber(row, col) &amp;&amp; value !== null) {
    classes.push('bg-blue-200 dark:bg-blue-900');
  } else if (isSameRow(row) || isSameCol(col) || isSameBox(row, col)) {
    classes.push('bg-blue-50 dark:bg-blue-950');
  }

  if (hasError) {
    classes.push(isSelected ? 'bg-red-500' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400');
  }

  if (isFixed &amp;&amp; !isSelected &amp;&amp; !hasError) {
    classes.push('text-gray-900 dark:text-white font-bold');
  } else if (!isFixed &amp;&amp; !isSelected &amp;&amp; !hasError) {
    classes.push('text-blue-600 dark:text-blue-400');
  }

  return classes.join(' ');
}

function getBorderClass(row, col) {
  const classes = ['border', 'border-gray-300 dark:border-gray-700'];
  
  if (col % 3 === 2 &amp;&amp; col !== 8) {
    classes.push('border-r-2 border-r-gray-800 dark:border-r-gray-400');
  }
  if (row % 3 === 2 &amp;&amp; row !== 8) {
    classes.push('border-b-2 border-b-gray-800 dark:border-b-gray-400');
  }
  
  return classes.join(' ');
}
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="grid grid-cols-9 gap-0 bg-gray-800 dark:bg-gray-600 p-0.5 rounded-lg shadow-lg"&gt;
    &lt;div
      v-for="row in 9"
      :key="row"
      class="contents"
    &gt;
      &lt;div
        v-for="col in 9"
        :key="col"
        class="aspect-square flex items-center justify-center text-xl md:text-2xl cursor-pointer transition-all duration-150 hover:bg-blue-100 dark:hover:bg-blue-800"
        :class="[getCellClass(row - 1, col - 1), getBorderClass(row - 1, col - 1)]"
        @click="emit('select-cell', row - 1, col - 1)"
      &gt;
        &lt;span v-if="board[row - 1][col - 1]"&gt;
          {{ board[row - 1][col - 1] }}
        &lt;/span&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;
`;

const homePageVueContent = `&lt;script setup&gt;
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import SudokuBoard from '../components/SudokuBoard.vue';
import { useTheme } from '../composables/useTheme';
import {
  generateSudoku,
  checkBoardErrors,
  isBoardComplete,
  isBoardCorrect,
  formatTime
} from '../lib/sudoku';

const { theme, toggleTheme } = useTheme();

const difficulty = ref('easy');
const board = ref([]);
const initialBoard = ref([]);
const solution = ref([]);
const selectedCell = ref(null);
const errors = ref([]);
const time = ref(0);
const timer = ref(null);
const showStats = ref(false);
const isGameComplete = ref(false);
const showMessage = ref(false);
const message = ref('');

const stats = reactive({
  gamesCompleted: 0,
  bestTime: {
    easy: null,
    medium: null,
    hard: null
  }
});

function startNewGame() {
  const { board: newBoard, solution: newSolution } = generateSudoku(difficulty.value);
  board.value = newBoard.map(row =&gt; [...row]);
  initialBoard.value = newBoard.map(row =&gt; [...row]);
  solution.value = newSolution;
  selectedCell.value = null;
  errors.value = Array(9).fill(false).map(() =&gt; Array(9).fill(false));
  time.value = 0;
  isGameComplete.value = false;
  showMessage.value = false;
  startTimer();
}

function startTimer() {
  if (timer.value) {
    clearInterval(timer.value);
  }
  timer.value = window.setInterval(() =&gt; {
    time.value++;
  }, 1000);
}

function stopTimer() {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
}

function selectCell(row, col) {
  if (isGameComplete.value) return;
  selectedCell.value = { row, col };
}

function inputNumber(num) {
  if (!selectedCell.value || isGameComplete.value) return;
  const { row, col } = selectedCell.value;
  
  if (initialBoard.value[row][col] !== null) return;
  
  board.value[row][col] = num;
  updateErrors();
  checkCompletion();
}

function deleteNumber() {
  if (!selectedCell.value || isGameComplete.value) return;
  const { row, col } = selectedCell.value;
  
  if (initialBoard.value[row][col] !== null) return;
  
  board.value[row][col] = null;
  updateErrors();
}

function updateErrors() {
  errors.value = checkBoardErrors(board.value);
}

function checkCompletion() {
  if (isBoardComplete(board.value)) {
    if (isBoardCorrect(board.value, solution.value)) {
      isGameComplete.value = true;
      stopTimer();
      saveStats();
      showMessage.value = true;
      message.value = 'Congratulations! You solved the Sudoku!';
    }
  }
}

function resetGame() {
  board.value = initialBoard.value.map(row =&gt; [...row]);
  selectedCell.value = null;
  errors.value = Array(9).fill(false).map(() =&gt; Array(9).fill(false));
  time.value = 0;
  isGameComplete.value = false;
  showMessage.value = false;
  startTimer();
}

function checkAnswer() {
  updateErrors();
  const hasErrors = errors.value.some(row =&gt; row.some(error =&gt; error));
  if (hasErrors) {
    showMessage.value = true;
    message.value = 'There are some errors, check again!';
    setTimeout(() =&gt; {
      showMessage.value = false;
    }, 2000);
  } else if (isBoardComplete(board.value)) {
    checkCompletion();
  } else {
    showMessage.value = true;
    message.value = 'Looking good so far!';
    setTimeout(() =&gt; {
      showMessage.value = false;
    }, 2000);
  }
}

function saveStats() {
  stats.gamesCompleted++;
  const currentBest = stats.bestTime[difficulty.value];
  if (currentBest === null || time.value &lt; currentBest) {
    stats.bestTime[difficulty.value] = time.value;
  }
  localStorage.setItem('sudokuStats', JSON.stringify(stats));
}

function loadStats() {
  const savedStats = localStorage.getItem('sudokuStats');
  if (savedStats) {
    const parsed = JSON.parse(savedStats);
    stats.gamesCompleted = parsed.gamesCompleted || 0;
    stats.bestTime = {
      easy: parsed.bestTime?.easy || null,
      medium: parsed.bestTime?.medium || null,
      hard: parsed.bestTime?.hard || null
    };
  }
}

function getDifficultyText(diff) {
  const texts = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };
  return texts[diff];
}

onMounted(() =&gt; {
  loadStats();
  startNewGame();
});

onUnmounted(() =&gt; {
  stopTimer();
});
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"&gt;
    &lt;div class="container mx-auto px-4 py-8 max-w-md"&gt;
      &lt;div class="flex justify-between items-center mb-6"&gt;
        &lt;h1 class="text-3xl font-bold text-gray-800 dark:text-white"&gt;
          Sudoku Game
        &lt;/h1&gt;
        &lt;button
          @click="toggleTheme"
          class="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-all"
        &gt;
          &lt;span class="text-xl"&gt;{{ theme === 'dark' ? '☀️' : '🌙' }}&lt;/span&gt;
        &lt;/button&gt;
      &lt;/div&gt;

      &lt;div class="flex justify-between items-center mb-4"&gt;
        &lt;div class="flex gap-2"&gt;
          &lt;button
            v-for="diff in ['easy', 'medium', 'hard']"
            :key="diff"
            @click="difficulty = diff; startNewGame()"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            :class="[
              difficulty === diff
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            ]"
          &gt;
            {{ getDifficultyText(diff) }}
          &lt;/button&gt;
        &lt;/div&gt;
        &lt;button
          @click="showStats = !showStats"
          class="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-all"
        &gt;
          &lt;span class="text-xl"&gt;📊&lt;/span&gt;
        &lt;/button&gt;
      &lt;/div&gt;

      &lt;div v-if="showStats" class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-lg"&gt;
        &lt;h3 class="text-lg font-bold text-gray-800 dark:text-white mb-3"&gt;Statistics&lt;/h3&gt;
        &lt;div class="grid grid-cols-2 gap-3"&gt;
          &lt;div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center"&gt;
            &lt;div class="text-2xl font-bold text-blue-600 dark:text-blue-400"&gt;
              {{ stats.gamesCompleted }}
            &lt;/div&gt;
            &lt;div class="text-sm text-gray-600 dark:text-gray-400"&gt;Games Played&lt;/div&gt;
          &lt;/div&gt;
          &lt;div class="bg-green-50 dark:bg-green-900/30 rounded-lg p-3"&gt;
            &lt;div class="text-xs text-gray-600 dark:text-gray-400 mb-1"&gt;Best Time&lt;/div&gt;
            &lt;div class="text-sm" v-for="diff in ['easy', 'medium', 'hard']" :key="diff"&gt;
              &lt;span class="text-gray-500 dark:text-gray-400"&gt;{{ getDifficultyText(diff) }}: &lt;/span&gt;
              &lt;span class="font-medium text-green-600 dark:text-green-400"&gt;
                {{ stats.bestTime[diff] ? formatTime(stats.bestTime[diff]) : '--:--' }}
              &lt;/span&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-lg"&gt;
        &lt;div class="flex justify-between items-center mb-4"&gt;
          &lt;div class="flex items-center gap-2"&gt;
            &lt;span class="text-xl"&gt;⏱️&lt;/span&gt;
            &lt;span class="text-2xl font-mono font-bold text-gray-800 dark:text-white"&gt;
              {{ formatTime(time) }}
            &lt;/span&gt;
          &lt;/div&gt;
          &lt;div class="flex gap-2"&gt;
            &lt;button
              @click="resetGame"
              class="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all"
              title="Reset"
            &gt;
              &lt;span class="text-lg"&gt;🔄&lt;/span&gt;
            &lt;/button&gt;
            &lt;button
              @click="checkAnswer"
              class="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
              title="Check"
            &gt;
              &lt;span class="text-lg"&gt;✅&lt;/span&gt;
            &lt;/button&gt;
            &lt;button
              @click="startNewGame"
              class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
              title="New Game"
            &gt;
              &lt;span class="text-lg"&gt;🎮&lt;/span&gt;
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div v-if="showMessage" class="mb-4 p-3 rounded-lg text-center font-medium" :class="isGameComplete ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'"&gt;
          {{ message }}
        &lt;/div&gt;

        &lt;SudokuBoard
          :board="board"
          :solution="solution"
          :selected-cell="selectedCell"
          :errors="errors"
          :difficulty="difficulty"
          @select-cell="selectCell"
        /&gt;
      &lt;/div&gt;

      &lt;div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"&gt;
        &lt;div class="grid grid-cols-5 gap-2 mb-2"&gt;
          &lt;button
            v-for="num in 5"
            :key="num"
            @click="inputNumber(num)"
            class="aspect-square flex items-center justify-center text-xl font-bold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
          &gt;
            {{ num }}
          &lt;/button&gt;
        &lt;/div&gt;
        &lt;div class="grid grid-cols-5 gap-2"&gt;
          &lt;button
            v-for="num in 4"
            :key="num + 5"
            @click="inputNumber(num + 5)"
            class="aspect-square flex items-center justify-center text-xl font-bold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
          &gt;
            {{ num + 5 }}
          &lt;/button&gt;
          &lt;button
            @click="deleteNumber"
            class="aspect-square flex items-center justify-center text-xl rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all active:scale-95"
          &gt;
            ⌫
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div class="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm"&gt;
        &lt;p&gt;Tap a cell, then tap a number&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;
`;

fs.writeFileSync(path.join(__dirname, 'src/lib/sudoku.ts'), sudokuTsContent, 'utf8');
fs.writeFileSync(path.join(__dirname, 'src/components/SudokuBoard.vue'), sudokuBoardVueContent, 'utf8');
fs.writeFileSync(path.join(__dirname, 'src/pages/HomePage.vue'), homePageVueContent, 'utf8');

console.log('All files created successfully!');

