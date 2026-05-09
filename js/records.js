const RecordsModule = (() => {
  async function render(container) {
    const today = new Date().toISOString().split('T')[0];
    container.innerHTML = `
      <h2>每日学习记录</h2>
      <div class="add-card">
        <h4>添加新记录</h4>
        <form id="recordForm">
          <input type="date" id="recDate" value="${today}" required>
          <input type="text" id="recSubject" placeholder="学科（选填，如 数学、英语...）" list="subjectList">
          <datalist id="subjectList">
            <option value="数学"><option value="英语"><option value="物理">
            <option value="化学"><option value="生物"><option value="历史">
            <option value="地理"><option value="政治"><option value="计算机">
          </datalist>
          <textarea id="recContent" placeholder="今天学了什么..." required></textarea>
          <button type="submit" class="btn-primary">添加记录</button>
        </form>
      </div>
      <div id="recordsList"><div class="loading">加载中...</div></div>
    `;

    document.getElementById('recordForm').addEventListener('submit', addRecord);
    await loadRecords();
  }

  async function loadRecords() {
    const list = document.getElementById('recordsList');
    const { data, error } = await supabaseClient
      .from('study_records')
      .select('*')
      .order('study_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) { list.innerHTML = '<div class="empty-state"><p>加载失败，请检查网络后重试</p></div>'; return; }
    if (!data || !data.length) {
      list.innerHTML = '<div class="empty-state"><p>还没有学习记录，开始写第一条吧</p></div>';
      return;
    }

    list.innerHTML = data.map(r => `
      <div class="card">
        <div class="card-header">
          <div style="flex:1;min-width:0">
            <div class="card-date">${formatDate(r.study_date)}</div>
            ${r.subject ? `<span class="card-subject">${escapeHtml(r.subject)}</span>` : ''}
            <div class="card-content">${escapeHtml(r.content)}</div>
          </div>
          <div class="card-actions">
            <button class="btn-sm danger" data-id="${r.id}">删除</button>
          </div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-sm.danger').forEach(btn => {
      btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
    });
  }

  async function addRecord(e) {
    e.preventDefault();
    const study_date = document.getElementById('recDate').value;
    const subject = document.getElementById('recSubject').value.trim() || null;
    const content = document.getElementById('recContent').value.trim();
    if (!content) return;

    const { error } = await supabaseClient.from('study_records').insert([{ study_date, subject, content }]);
    if (error) { alert('添加失败：' + error.message); return; }

    document.getElementById('recSubject').value = '';
    document.getElementById('recContent').value = '';
    await loadRecords();
  }

  async function deleteRecord(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    await supabaseClient.from('study_records').delete().eq('id', id);
    await loadRecords();
  }

  return { render };
})();
