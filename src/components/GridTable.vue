<template>
  <div class="my-table">
    <!-- 表头 -->
    <div class="table-header" :style="gridTemplateStyle">
      <div class="header-cell" v-for="(col, cIndex) in columns" :key="cIndex">
        {{ col.label }}
      </div>
      <div class="header-cell" v-if="hasActions">操作</div>
    </div>
    <!-- 滚动的表格主体 -->
    <div class="table-body" :style="{ maxHeight: computedMaxHeight }">
      <div
        class="table-row"
        v-for="(row, rIndex) in tableData"
        :key="rIndex"
        :style="gridTemplateStyle"
      >
        <div class="row-cell" v-for="(col, cIndex) in columns" :key="cIndex">
          <slot :name="col.key" :row="row">
            {{ row[col.key] ? row[col.key] : "无" }}
          </slot>
        </div>
        <div class="row-cell" v-if="hasActions">
          <slot name="actions" :row="row">
            <button @click="handleEdit(row)">编辑</button>
            <button @click="handleDelete(row)" class="danger">删除</button>
          </slot>
        </div>
      </div>
    </div>
    <!-- 空数据提示 -->
    <div v-if="tableData.length === 0" class="no-data">暂无数据</div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  tableData: {
    type: Array,
    default: () => [],
  },
  maxHeight: {
    type: String,
    default: "", // 默认不限制高度
  },
});

// 计算最终表格最大高度
const computedMaxHeight = computed(() => {
  return props.maxHeight ? props.maxHeight : "auto";
});

// 计算是否需要显示操作栏
const hasActions = computed(() =>
  props.columns.some((col) => col.key === "actions")
);

// 计算网格列样式，使表头和内容行对齐
const gridTemplateStyle = computed(() => {
  const columnCount = props.columns.length + (hasActions.value ? 1 : 0);
  return `grid-template-columns: repeat(${columnCount}, minmax(120px, 1fr));`;
});

// 默认编辑操作
const handleEdit = (row) => {
  console.log("编辑:", row);
};

// 默认删除操作
const handleDelete = (row) => {
  console.log("删除:", row);
};
</script>

<style scoped>
.my-table {
  border-radius: 4px;
  overflow: hidden;
  font-size: 13px;
}

/* 表头固定 */
.table-header {
  display: grid;
  background-color: #f0f0f0;
  font-weight: 600;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  color: #969799;
  z-index: 10;
}

/* 表体滚动 */
.table-body {
  overflow-y: auto;
}

/* 表格行 */
.table-row {
  display: grid;
  /* padding: 8px 0; */
  border-bottom: 1px solid #ddd;
}

/* 表格单元格 */
.row-cell {
  text-align: center;
  padding: 4px 8px;
  color: #969799;
}

/* 按钮样式 */
button {
  margin: 0 5px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

button.danger {
  color: red;
  border-color: red;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #999;
}
.header-cell {
  text-align: center;
}
</style>
