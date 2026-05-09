const TodosModule = (() => {
  async function render(container) {
    const today = new Date().toISOString().split('T')[0];
    container.innerHTML = `
      <h2>待办事项</h2>
      <div class="add-card">
        <h4>添加待办</h4>
        <form id="todoForm">
          <div class="form-row">
            <input type="date" id="todoDate" value="${today}" required style="flex:0 0 160px">
            <input type="text" id="todoTask" placeholder="要做什么..." required style="flex:1">
          </div>
          <button type="submit" class="btn-primary">添加待办</button>
        </form>
      </div>
      <div id="todosList"><div class="loading">加载中...</div></div>
    `;

    document.getElementById('todoForm').addEventListener('submit', addTodo);
    await loadTodos();
  }

  async function loadTodos() {
    const list = document.getElementById('todosList');
    const { data, error } = await supabaseClient
      .from('todos')
      .select('*')
      .order('due_date', { ascending: false })
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) { list.innerHTML = '<div class="empty-state"><p>加载失败，请检查网络后重试</p></div>'; return; }
    if (!data || !data.length) {
      list.innerHTML = '<div class="empty-state"><p>还没有待办事项，添加一条吧</p></div>';
      return;
    }

    // 按日期分组
    const grouped = {};
    data.forEach(t => {
      const key = t.due_date;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });

    list.innerHTML = Object.entries(grouped).map(([date, todos]) => `
      <div class="card">
        <div class="card-date" style="margin-bottom:8px">${formatDate(date)}</div>
        ${todos.map(t => `
          <div class="todo-item">
            <input type="checkbox" class="todo-checkbox" data-id="${t.id}" ${t.completed ? 'checked' : ''}>
            <span class="todo-text${t.completed ? ' done' : ''}">${escapeHtml(t.task)}</span>
            <button class="btn-sm danger" data-id="${t.id}">删除</button>
          </div>
        `).join('')}
      </div>
    `).join('');

    // 绑定复选框事件
    list.querySelectorAll('.todo-checkbox').forEach(cb => {
      cb.addEventListener('change', () => toggleTodo(cb.dataset.id, cb.checked));
    });
    list.querySelectorAll('.btn-sm.danger').forEach(btn => {
      btn.addEventListener('click', () => deleteTodo(btn.dataset.id));
    });
  }

  async function addTodo(e) {
    e.preventDefault();
    const due_date = document.getElementById('todoDate').value;
    const task = document.getElementById('todoTask').value.trim();
    if (!task) return;

    const { error } = await supabaseClient.from('todos').insert([{ due_date, task }]);
    if (error) { alert('添加失败：' + error.message); return; }

    document.getElementById('todoTask').value = '';
    await loadTodos();
  }

  async function toggleTodo(id, completed) {
    await supabaseClient.from('todos').update({ completed }).eq('id', id);
    await loadTodos();
  }

  async function deleteTodo(id) {
    if (!confirm('确定要删除这条待办吗？')) return;
    await supabaseClient.from('todos').delete().eq('id', id);
    await loadTodos();
  }

  return { render };
})();
