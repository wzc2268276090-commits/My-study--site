-- 在 Supabase SQL Editor 中执行以下语句来创建表

-- 每日学习记录
CREATE TABLE study_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_date DATE NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id)
);

-- 错题本
CREATE TABLE error_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_date DATE NOT NULL,
  subject TEXT,
  question TEXT NOT NULL,
  wrong_answer TEXT,
  correct_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id)
);

-- 每日待办
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  due_date DATE NOT NULL,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id)
);

-- RLS：允许所有已认证用户读写全部数据（共享笔记本）
ALTER TABLE study_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "认证用户可读学习记录" ON study_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "认证用户可写学习记录" ON study_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "认证用户可删学习记录" ON study_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "认证用户可读错题" ON error_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "认证用户可写错题" ON error_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "认证用户可删错题" ON error_notes FOR DELETE TO authenticated USING (true);

CREATE POLICY "认证用户可读待办" ON todos FOR SELECT TO authenticated USING (true);
CREATE POLICY "认证用户可写待办" ON todos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "认证用户可改待办" ON todos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "认证用户可删待办" ON todos FOR DELETE TO authenticated USING (true);
