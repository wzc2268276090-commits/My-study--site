// === Supabase 配置 ===
const SUPABASE_URL = 'https://tcvpfbolzomdyygscyuc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zdSKMIkXLGKGFHkL6IOQ3w_zlPE5zBw';

// 检查 SDK 是否加载成功
if (typeof window.supabase === 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('loginError');
    if (el) el.textContent = 'Supabase SDK 加载失败，请检查网络后刷新。';
  });
}

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
