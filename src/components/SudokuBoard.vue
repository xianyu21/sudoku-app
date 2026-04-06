<script setup>
import { computed } from 'vue';

const props = defineProps({
  board: Array,
  solution: Array,
  selectedCell: Object,
  errors: Array,
  difficulty: String
});

const emit = defineEmits(['select-cell']);

const initialBoard = computed(() => {
  const initial = Array(9).fill(null).map(() => Array(9).fill(null));
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      initial[row][col] = props.board[row][col];
    }
  }
  return initial;
});

function isSameRow(row) {
  return props.selectedCell !== null && props.selectedCell.row === row;
}

function isSameCol(col) {
  return props.selectedCell !== null && props.selectedCell.col === col;
}

function isSameBox(row, col) {
  if (!props.selectedCell) return false;
  const selectedBoxRow = Math.floor(props.selectedCell.row / 3);
  const selectedBoxCol = Math.floor(props.selectedCell.col / 3);
  const currentBoxRow = Math.floor(row / 3);
  const currentBoxCol = Math.floor(col / 3);
  return selectedBoxRow === currentBoxRow && selectedBoxCol === currentBoxCol;
}

function isSameNumber(row, col) {
  if (!props.selectedCell) return false;
  const selectedValue = props.board[props.selectedCell.row][props.selectedCell.col];
  const currentValue = props.board[row][col];
  return selectedValue !== null && currentValue !== null && selectedValue === currentValue;
}

function getCellClass(row, col) {
  const classes = [];
  const isSelected = props.selectedCell?.row === row && props.selectedCell?.col === col;
  const isFixed = initialBoard.value[row][col] !== null;
  const hasError = props.errors[row][col];
  const value = props.board[row][col];

  if (isSelected) {
    classes.push('bg-blue-500 text-white');
  } else if (isSameNumber(row, col) && value !== null) {
    classes.push('bg-blue-200');
  } else if (isSameRow(row) || isSameCol(col) || isSameBox(row, col)) {
    classes.push('bg-blue-50');
  }

  if (hasError) {
    classes.push(isSelected ? 'bg-red-500' : 'bg-red-100 text-red-600');
  }

  if (isFixed && !isSelected && !hasError) {
    classes.push('text-gray-900 font-bold');
  } else if (!isFixed && !isSelected && !hasError) {
    classes.push('text-blue-600');
  }

  return classes.join(' ');
}

function getBorderClass(row, col) {
  const classes = ['border', 'border-gray-300'];
  
  if (col % 3 === 2 && col !== 8) {
    classes.push('border-r-2 border-r-gray-800');
  }
  if (row % 3 === 2 && row !== 8) {
    classes.push('border-b-2 border-b-gray-800');
  }
  
  return classes.join(' ');
}
</script>

<template>
  <div class="grid grid-cols-9 gap-0 bg-blue-100 p-1 rounded-xl shadow-xl touch-manipulation">
    <div
      v-for="row in 9"
      :key="row"
      class="contents"
    >
      <div
        v-for="col in 9"
        :key="col"
        class="aspect-square flex items-center justify-center text-base sm:text-xl md:text-2xl cursor-pointer transition-all duration-150 hover:bg-blue-200 active:scale-95 touch-action-manipulation"
        :class="[getCellClass(row - 1, col - 1), getBorderClass(row - 1, col - 1)]"
        @click="emit('select-cell', row - 1, col - 1)"
      >
        <span v-if="board[row - 1][col - 1]">
          {{ board[row - 1][col - 1] }}
        </span>
      </div>
    </div>
  </div>
</template>
