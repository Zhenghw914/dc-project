export default function formatUnixTimestamp(tsInSeconds) {
  // 1) 转为毫秒级
  const date = new Date(tsInSeconds);

  // 2) 提取各部分并补零
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // 3) 拼接返回
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
