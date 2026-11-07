const express = require('express');
const { closePool, executeQuery } = require('./db.js');

const app = express();
app.use(express.json());

function handleServerError(res, message) {
  res.status(500).json({ message });
}

app.get('/todos', async (req, res) => {
  try {
    const todos = await executeQuery('SELECT * FROM todos');
    res.status(200).json(todos);
  } catch (error) {
    handleServerError(res, 'ToDoの取得に失敗しました。');
  }
});

app.post('/todos', async (req, res) => {
  try {
    const { title, priority } = req.body;
    const result = await executeQuery(
    'INSERT INTO todos (title, priority) VALUES (?, ?)',
    [title, priority]
    );
    res.status(201).json({
        id: result.insertId,
        title: title,
        priority: priority,
        status: '未着手'
    });
  } catch (error) {
    handleServerError(res, 'ToDoの追加に失敗しました。');
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, priority, status } = req.body;
    const result = await executeQuery(
    'UPDATE todos SET title = ?, priority = ?, status = ? WHERE id = ?',
    [title, priority, status, id]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: '指定されたToDoが見つかりません。'
        });
    }
    res.status(200).json({
        id,
        title,
        priority,
        status
    });
  } catch (error) {
    handleServerError(res, 'ToDoの更新に失敗しました。');
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await executeQuery(
        'DELETE FROM todos WHERE id = ?',
        [id]
    );
    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: '指定されたToDoが見つかりません。'
        });
    }
    res.status(200).json({
    message: 'ToDoを削除しました。'
    });
  } catch (error) {
    handleServerError(res, 'ToDoの削除に失敗しました。');
  }
});

const server = app.listen(3000, () => {
  console.log('http://localhost:3000 でサーバーを起動しました。');
});

function shutdown() {
  server.close(async () => {
    try {
      await closePool();
      console.log('サーバーとDB接続を終了しました。');
    } catch (error) {
      console.error('終了処理に失敗しました。', error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);