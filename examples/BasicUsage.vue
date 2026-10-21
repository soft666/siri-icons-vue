<script setup lang="ts">
import { ref } from 'vue'
import {
  IconSearch,
  IconPlus,
  IconCalendar,
  IconDeleteLine,
  IconCheckCircleSolid,
} from 'siri-icons-vue'

const query = ref('')
const status = ref('พร้อมใช้งาน')

function search() {
  status.value = query.value.trim()
    ? 'ค้นหา: ' + query.value.trim()
    : 'กรุณาระบุคำค้น'
}
</script>

<template>
  <main class="example">
    <h1>Siri Icons for Vue</h1>

    <form class="search-form" @submit.prevent="search">
      <label for="siri-example-search">ค้นหารายการ</label>
      <div class="search-row">
        <IconSearch :size="20" />
        <input
          id="siri-example-search"
          v-model="query"
          type="search"
          placeholder="พิมพ์คำค้น"
        />
        <button type="submit">ค้นหา</button>
      </div>
    </form>

    <div class="actions">
      <button type="button" @click="status = 'เพิ่มรายการแล้ว'">
        <IconPlus :size="20" />
        เพิ่มรายการ
      </button>
      <button type="button" @click="status = 'เลือกวันที่'">
        <IconCalendar :size="20" />
        เลือกวันที่
      </button>
      <button
          type="button"
          class="danger"
          aria-label="ลบรายการ"
          @click="status = 'ลบรายการแล้ว'"
      >
        <IconDeleteLine :size="20" />
      </button>
    </div>

    <p class="status" role="status">
      <IconCheckCircleSolid :size="20" color="#16a34a" />
      {{ status }}
    </p>
  </main>
</template>

<style scoped>
.example {
  max-width: 36rem;
  margin: 3rem auto;
  padding: 1.5rem;
  color: #172c3e;
  font-family: system-ui, sans-serif;
}
.search-form { display: grid; gap: 0.5rem; }
.search-row, .actions, button, .status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.actions { margin-top: 1rem; flex-wrap: wrap; }
input { flex: 1; min-width: 0; padding: 0.65rem; }
button {
  padding: 0.65rem 0.85rem;
  border: 1px solid #ccd5df;
  border-radius: 0.5rem;
  background: white;
  color: inherit;
  cursor: pointer;
}
button:focus-visible, input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 3px;
}
.danger { color: #dc2626; }
</style>
