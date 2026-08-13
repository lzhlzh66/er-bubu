// 后端 API 配置（本地开发默认 localhost，部署前可改）
window.CONFIG = {
  APP_NAME: '一二布布',
  VERSION: '1.0.0',
  // 优先读取本地缓存的 API 地址，否则默认 localhost（开发）
  API_BASE: localStorage.getItem('er-bubu-api') || 'http://localhost:3000',
  // 默认出发地（随机旅行模块）
  DEFAULT_ORIGIN: '广州'
};

// 设置 API 地址（登录前调用）
window.setApiBase = (url) => {
  localStorage.setItem('er-bubu-api', url);
  window.CONFIG.API_BASE = url;
};
