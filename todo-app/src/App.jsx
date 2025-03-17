import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  // Görevleri getir
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yeni görev ekle
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask, is_completed: false }])
        .select();

      if (error) throw error;

      setTodos([data[0], ...todos]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // Görev tamamlandı/tamamlanmadı olarak işaretle
  const toggleTodo = async (id, isCompleted) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !isCompleted })
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_completed: !isCompleted } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // Görev silme
  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="container">
      <h1>Todo Uygulaması</h1>
      
      <form onSubmit={addTodo} className="add-todo-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Yeni görev ekle..."
        />
        <button type="submit">Ekle</button>
      </form>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => toggleTodo(todo.id, todo.is_completed)}
              />
              <span>{todo.task}</span>
              <button onClick={() => deleteTodo(todo.id)}>Sil</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
