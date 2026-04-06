
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const simpleContent = `&lt;script setup&gt;
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"&gt;
    &lt;div class="bg-white p-8 rounded-xl shadow-lg text-center"&gt;
      &lt;h1 class="text-3xl font-bold text-gray-800 mb-4"&gt;Hello Sudoku!&lt;/h1&gt;
      &lt;p class="text-gray-600 mb-4"&gt;Count: {{ count }}&lt;/p&gt;
      &lt;button 
        @click="increment"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      &gt;
        Increment
      &lt;/button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;
`;

const filePath = path.join(__dirname, 'src/pages/HomePage.vue');

fs.writeFileSync(filePath, simpleContent, { encoding: 'utf8', flag: 'w' });
console.log('Simple file created at:', filePath);
console.log('Content length:', simpleContent.length);

