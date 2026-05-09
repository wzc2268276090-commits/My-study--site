const ErrorsModule = (() => {
  async function render(container) {
    const today = new Date().toISOString().split('T')[0];
    container.innerHTML = `
      <h2>错题本</h2>
      <div class="add-card">
        <h4>添加错题</h4>
        <form id="errorForm">
          <input type="date" id="errDate" value="${today}" required>
          <input type="text" id="errSubject" placeholder="学科（选填）" list="subjectList">
          <textarea id="errQuestion" placeholder="题目内容..." required></textarea>
          <textarea id="errWrong" placeholder="我的错误答案或错误思路..."></textarea>
          <textarea id="errCorrect" placeholder="正确答案或解析..."></textarea>
          <button type="submit" class="btn-primary">添加错题</button>
        </form>
      </div>
      <div id="errorsList"><div class="loading">加载中...</div></div>
    `;

    document.getElementById('errorForm').addEventListener('submit', addError);
    await loadErrors();
  }

  async function loadErrors() {
    const list = document.getElementById('errorsList');
    const { data, error } = await supabaseClient
      .from('error_notes')
      .select('*')
      .order('created_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) { list.innerHTML = '<div class="empty-state"><p>加载失败，请检查网络后重试</p></div>'; return; }
    if (!data || !data.length) {
      list.innerHTML = '<div class="empty-state"><p>还没有错题记录，开始记录错题吧</p></div>';
      return;
    }

    list.innerHTML = data.map(r => `
      <div class="card">
        <div class="card-header">
          <div style="flex:1;min-width:0">
            <div class="card-date">${formatDate(r.created_date)}</div>
            ${r.subject ? `<span class="card-subject">${escapeHtml(r.subject)}</span>` : ''}
            <div class="card-content" style="font-weight:600;margin-bottom:8px">${escapeHtml(r.question)}</div>
            ${r.wrong_answer ? `
              <div class="error-detail">
                <div class="label">❌ 错误答案/思路</div>
                <div class="text">${escapeHtml(r.wrong_answer)}</div>
              </div>
            ` : ''}
            ${r.correct_answer ? `
              <div class="error-detail">
                <div class="label">✅ 正确答案/解析</div>
                <div class="text">${escapeHtml(r.correct_answer)}</div>
              </div>
            ` : ''}
          </div>
          <div class="card-actions">
            <button class="btn-sm danger" data-id="${r.id}">删除</button>
          </div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-sm.danger').forEach(btn => {
      btn.addEventListener('click', () => deleteError(btn.dataset.id));
    });
  }

  async function addError(e) {
    e.preventDefault();
    const created_date = document.getElementById('errDate').value;
    const subject = document.getElementById('errSubject').value.trim() || null;
    const question = document.getElementById('errQuestion').value.trim();
    const wrong_answer = document.getElementById('errWrong').value.trim() || null;
    const correct_answer = document.getElementById('errCorrect').value.trim() || null;
    if (!question) return;

    const { error } = await supabaseClient.from('error_notes').insert([{
      created_date, subject, question, wrong_answer, correct_answer
    }]);
    if (error) { alert('添加失败：' + error.message); return; }

    document.getElementById('errSubject').value = '';
    document.getElementById('errQuestion').value = '';
    document.getElementById('errWrong').value = '';
    document.getElementById('errCorrect').value = '';
    await loadErrors();
  }

  async function deleteError(id) {
    if (!confirm('确定要删除这道错题吗？')) return;
    await supabaseClient.from('error_notes').delete().eq('id', id);
    await loadErrors();
  }

  return { render };
})();
