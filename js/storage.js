/**
 * 本地优先存储层
 * 所有个人数据先写 localStorage，联网后由 sync.js 同步到云端
 */

(function () {
  const KEY = 'er-bubu-data-v1';
  const AUTH_KEY = 'er-bubu-auth';

  // 默认数据结构
  window.defaultData = function () {
    return {
      version: 1,
      profile: null, // { username, token, groupId, role, inviteCode }
      updatedAt: Date.now(),
      pets: {
        yiEr: { name: '一二', color: 'white', hunger: 80, mood: 80, energy: 80, intimacy: 50, growth: 0, outfit: 'default', state: 'idle' },
        buBu: { name: '布布', color: 'brown', hunger: 80, mood: 80, energy: 80, intimacy: 50, growth: 0, outfit: 'default', state: 'idle' }
      },
      home: {
        theme: 'ghibli', // ghibli | pastoral
        furniture: ['bed', 'desk', 'bookshelf', 'plant', 'lamp', 'curtains'],
        wallpaper: 'default'
      },
      // 个人模块数据
      fridge: {
        cold: { 水果: [], 青菜: [], 肉类: [], 海鲜: [] },
        freeze: { 水果: [], 青菜: [], 肉类: [], 海鲜: [] }
      },
      todos: [],
      habits: { records: {}, streaks: {} },
      exam: {
        examName: '',
        examDate: '',
        plans: [],
        wrongQuestions: [],
        pomodoro: { today: 0, total: 0 }
      },
      travels: []
    };
  };

  // 个人数据读写
  window.Storage = {
    KEY,
    AUTH_KEY,

    get() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return defaultData();
        const parsed = JSON.parse(raw);
        return this.migrate(parsed);
      } catch (e) {
        console.error('Storage get error', e);
        return defaultData();
      }
    },

    set(data) {
      try {
        data.updatedAt = Date.now();
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Storage set error', e);
        alert('本地存储空间不足，建议导出备份');
      }
    },

    // 读取/保存特定字段
    getField(key, fallback) {
      const data = this.get();
      return data[key] !== undefined ? data[key] : fallback;
    },
    setField(key, value) {
      const data = this.get();
      data[key] = value;
      this.set(data);
    },

    // 读取/保存嵌套字段，如 'pets.yiEr.hunger'
    getPath(path, fallback) {
      const data = this.get();
      return path.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), data) ?? fallback;
    },
    setPath(path, value) {
      const data = this.get();
      const keys = path.split('.');
      const last = keys.pop();
      let target = data;
      for (const k of keys) {
        if (!target[k] || typeof target[k] !== 'object') target[k] = {};
        target = target[k];
      }
      target[last] = value;
      this.set(data);
    },

    // 认证信息
    getAuth() {
      try {
        return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
      } catch (e) { return null; }
    },
    setAuth(auth) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    },
    clearAuth() {
      localStorage.removeItem(AUTH_KEY);
      const data = this.get();
      data.profile = null;
      this.set(data);
    },

    // 前向兼容（字段补齐）
    migrate(data) {
      const def = defaultData();
      for (const k of Object.keys(def)) {
        if (data[k] === undefined) data[k] = JSON.parse(JSON.stringify(def[k]));
      }
      return data;
    },

    // 导出/导入
    export() {
      return JSON.stringify(this.get(), null, 2);
    },
    import(json) {
      const data = JSON.parse(json);
      this.set(this.migrate(data));
    }
  };
})();
