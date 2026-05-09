const AuthModule = (() => {
  const loginPage = document.getElementById('loginPage');
  const appPage = document.getElementById('appPage');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const userEmail = document.getElementById('userEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  // SDK 未加载时，阻止表单提交
  if (typeof supabaseClient === 'undefined') {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      loginError.textContent = 'Supabase SDK 未加载，请检查网络后刷新页面。';
    });
    return { checkSession() {} };
  }

  async function checkSession() {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        showApp(session.user.email);
      } else {
        showLogin();
      }
    } catch (err) {
      showLogin();
      loginError.textContent = '连接 Supabase 失败，请检查网络：' + err.message;
    }
  }

  function showApp(email) {
    loginPage.style.display = 'none';
    appPage.style.display = '';
    userEmail.textContent = email;
    AppModule.switchTab('records');
  }

  function showLogin() {
    loginPage.style.display = '';
    appPage.style.display = 'none';
    loginError.textContent = '';
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    loginError.textContent = '';

    if (!email || !password) {
      loginError.textContent = '请填写邮箱和密码';
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === 'Invalid login credentials') {
          loginError.textContent = '邮箱或密码错误。请确认已在 Supabase 控制台 → Authentication → Users 中创建了该用户。';
        } else if (error.message.includes('Email not confirmed')) {
          loginError.textContent = '邮箱未验证。请在 Supabase 控制台关闭邮箱验证，或手动确认该用户。';
        } else {
          loginError.textContent = '登录失败：' + error.message;
        }
      } else {
        showApp(data.user.email);
      }
    } catch (err) {
      loginError.textContent = '网络错误，无法连接到 Supabase。请确认：\n1. 使用 Live Server 打开（不要用 file://）\n2. 网络可访问 supabase.com';
    }
  }

  async function handleLogout() {
    await supabaseClient.auth.signOut();
  }

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      showLogin();
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
    }
  });

  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);

  return { checkSession };
})();
