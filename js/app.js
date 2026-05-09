// === 工具函数 ===
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const w = weekDays[d.getDay()];
  return `${y}年${m}月${day}日 星期${w}`;
}

// === 主控制器 ===
const AppModule = (() => {
  const content = document.getElementById('mainContent');
  const tabBtns = document.querySelectorAll('.tab-btn');

  function switchTab(tab) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

    if (tab === 'records') RecordsModule.render(content);
    else if (tab === 'errors') ErrorsModule.render(content);
    else if (tab === 'todos') TodosModule.render(content);
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  return { switchTab };
})();

// === 启动 ===
AuthModule.checkSession();
