<script setup>
import { computed } from 'vue';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['input-number', 'delete']);

function handleInput(num) {
  if (!props.disabled) {
    emit('input-number', num);
  }
}

function handleDelete() {
  if (!props.disabled) {
    emit('delete');
  }
}
</script>

<template>
  <div class="bg-gray-100 dark:bg-gray-800 rounded-t-2xl p-4 shadow-lg border-t border-gray-200 dark:border-gray-700">
    <div class="grid grid-cols-3 gap-3 max-w-md mx-auto">
      <button
        v-for="num in 9"
        :key="num"
        @click="handleInput(num)"
        :disabled="disabled"
        class="aspect-square text-3xl font-bold rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900 active:scale-95 transition-all touch-action-manipulation disabled:opacity-50"
      >
        {{ num }}
      </button>
      <div></div>
      <button
        @click="handleInput(0)"
        :disabled="disabled"
        class="aspect-square text-3xl font-bold rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900 active:scale-95 transition-all touch-action-manipulation disabled:opacity-50"
      >
        0
      </button>
      <button
        @click="handleDelete"
        :disabled="disabled"
        class="aspect-square text-xl font-bold rounded-2xl bg-red-400 text-white shadow-sm hover:bg-red-500 active:scale-95 transition-all touch-action-manipulation disabled:opacity-50 flex items-center justify-center"
      >
        删除
      </button>
    </div>
  </div>
</template>
