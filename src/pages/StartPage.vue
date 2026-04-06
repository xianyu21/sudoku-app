<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Play, Trophy, History } from 'lucide-vue-next';

const router = useRouter();
const selectedDifficulty = ref('easy');
const hasSavedProgress = ref(false);

const hasProgress = computed(() => {
  return localStorage.getItem('sudoku-progress') !== null;
});

function startGame() {
  router.push({
    name: 'game',
    query: { difficulty: selectedDifficulty.value }
  });
}

function continueGame() {
  router.push({
    name: 'game',
    query: { continue: 'true' }
  });
}

function goToProfile() {
  router.push({ name: 'profile' });
}

onMounted(() => {
  hasSavedProgress.value = hasProgress.value;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="container mx-auto px-4 py-8 max-w-2xl flex-1 flex flex-col">
      <header class="flex justify-between items-center mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">
          🧩 数独游戏
        </h1>
        <div class="w-12"></div>
      </header>

      <div class="text-center mb-12">
        <div class="text-6xl mb-4">🎮</div>
        <p class="text-xl text-gray-600">
          挑战你的逻辑思维能力！
        </p>
      </div>

      <div class="flex-1 flex flex-col justify-center">
        <button
          v-if="hasProgress"
          @click="continueGame"
          class="w-full py-4 mb-4 bg-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-amber-600 transition-all active:scale-95 touch-action-manipulation flex items-center justify-center gap-2"
        >
          <History class="w-6 h-6" />
          继续游戏
        </button>

        <h2 class="text-xl font-semibold text-gray-700 mb-6 text-center">
          选择难度
        </h2>
        
        <div class="space-y-4 mb-8">
          <button
            v-for="level in ['easy', 'medium', 'hard']"
            :key="level"
            @click="selectedDifficulty = level"
            :class="[
              'w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-95 touch-action-manipulation',
              selectedDifficulty === level
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            ]"
          >
            <div class="flex justify-between items-center">
              <span>
                {{ level === 'easy' ? '🌟 简单' : level === 'medium' ? '💪 中等' : '🔥 困难' }}
              </span>
              <span class="text-sm opacity-80">
                {{ level === 'easy' ? '适合新手' : level === 'medium' ? '需要思考' : '挑战极限' }}
              </span>
            </div>
          </button>
        </div>

        <button
          @click="startGame"
          class="w-full py-5 bg-green-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-green-600 transition-all active:scale-95 touch-action-manipulation flex items-center justify-center gap-3"
        >
          <Play class="w-7 h-7" />
          开始新游戏
        </button>
      </div>

      <div class="mt-8">
        <button
          @click="goToProfile"
          class="w-full py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-300 transition-all active:scale-95 touch-action-manipulation flex items-center justify-center gap-2"
        >
          <Trophy class="w-6 h-6" />
          我的主页
        </button>
      </div>
    </div>
  </div>
</template>
