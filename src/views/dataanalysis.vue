<template>
  <div class="table-container">
    <!-- 表头 -->
    <div class="table-header">
      <div class="cell">名称</div>
      <div class="cell">状态</div>
      <div class="cell">操作</div>
    </div>

    <!-- 表格主体 -->
    <van-grid :column-num="3" clickable>
      <van-grid-item v-for="(item, index) in tableData" :key="index">
        <div class="cell">{{ item.name }}</div>
        <div class="cell">{{ item.status }}</div>
        <div class="cell">
          <van-button type="primary" size="small" @click="handleClick(item)">
            详情
          </van-button>
        </div>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tableData = ref([
  { name: '设备A', status: '在线' },
  { name: '设备B', status: '离线' },
  { name: '设备C', status: '故障' }
]);

const handleClick = (item) => {
  console.log('查看详情', item);
};
</script>

<style scoped>
.table-container {
  margin: 20px;
}

.table-header,
.van-grid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ebebeb;
}

.cell {
  flex: 1;
  text-align: center;
}

.table-header {
  background-color: #f7f8fa;
  font-weight: bold;
}
</style>
