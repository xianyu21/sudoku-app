<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { ArrowLeft, Trophy, Clock, Trash2, Moon, Sun } from 'lucide-vue-next';
import { formatTime } from '@/lib/sudoku';

const router = useRouter();
const { theme, toggleTheme, isDark } = useTheme();

const stats = reactive({
  gamesPlayed: 0,
  bestTime: {
    easy: null,
    medium: null,
    hard: null
  }
});

function loadStats() {
  const saved = localStorage.getItem('sudoku-stats');
  if (saved) {
    const parsed = JSON.parse(saved);
    stats.gamesPlayed = parsed.gamesPlayed || 0;
    stats.bestTime = parsed.bestTime || { easy: null, medium: null, hard: null };
  }
}

function resetStats() {
  if (confirm('确定要清除所有游戏记录吗？')) {
    localStorage.removeItem('sudoku-stats');
    loadStats();
  }
}

function goBack() {
  router.push({ name: 'start' });
}

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <header class="flex items-center justify-between mb-8">
        <button
          @click="goBack"
          class="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          <ArrowLeft class="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          我的主页
        </h1>
        <button
          @click="toggleTheme"
          class="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
        >
          <Sun v-if="isDark" class="w-6 h-6 text-yellow-500" />
          <Moon v-else class="w-6 h-6 text-gray-700" />
        </button>
      </header>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
            <span class="text-4xl">🎮</span>
          </div>
        </div>
        
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            数独玩家
          </h2>
          <div class="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
            <Trophy class="w-5 h-5" />
            <span>已完成 {{ stats.gamesPlayed }} 局游戏</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Clock class="w-5 h-5" />
          最佳记录
        </h3>
        
        <div class="space-y-4">
          <div
            v-for="level in ['easy', 'medium', 'hard']"
            :key="level"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">
                {{ level === 'easy' ? '🌟' : level === 'medium' ? '💪' : '🔥' }}
              </span>
              <span class="font-semibold text-gray-700 dark:text-gray-300">
                {{ level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难' }}
              </span>
            </div>
            <span class="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
              {{ stats.bestTime[level] ? formatTime(stats.bestTime[level]) : '--:--' }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          数据管理
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          清除所有游戏记录和最佳时间，此操作不可恢复。
        </p>
        <button
          @click="resetStats"
          class="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 touch-action-manipulation flex items-center justify-center gap-2"
        >
          <Trash2 class="w-5 h-5" />
          清除所有记录
        </button>
      </div>

      <div class="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>继续挑战，创造更好的成绩！</p>
        <p class="mt-2">🎯 加油！</p>
      </div>
    </div>
  </div>
</template>
