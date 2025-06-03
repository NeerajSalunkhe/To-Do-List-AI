'use client';

import { useState, useEffect, useRef } from 'react';
import Todo from './components/todo';
import './App.css';
import './Res.css';
import { v4 as uuidv4 } from 'uuid';
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import Image from 'next/image';
export default function Page() {
  const [todo, setTodo] = useState("Add Your Task");
  const [todos, setTodos] = useState([]);
  const [view, setView] = useState("todo");
  const [ch1, setCh1] = useState(false);
  const [flag, setFlag] = useState(false);
  const [idd, setIdd] = useState(null);
  const inputRef = useRef(null);

  // Load todos and view on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    const savedView = localStorage.getItem("view");
    if (savedView) setView(savedView);
  }, []);

  // Save todos when changed
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Save view when changed
  useEffect(() => {
    localStorage.setItem("view", view);
  }, [view]);

  // === AI ACTIONS ===

  useCopilotAction({
    name: "addTodoItem",
    description: "Add a new todo item to the list",
    parameters: [
      {
        name: "todoText",
        type: "string",
        description: "The text of the todo item to add",
        required: true,
      },
    ],
    handler: async ({ todoText }) => {
      handleAdd(todoText);
    },
  });

  useCopilotAction({
    name: "deleteTodoItem",
    description: "Delete a todo item by its text",
    parameters: [
      {
        name: "todoText",
        type: "string",
        description: "The text of the todo to delete",
        required: true,
      },
    ],
    handler: async ({ todoText }) => {
      const item = todos.find(t => t.todo === todoText);
      if (item) handleDelete(item.id);
    },
  });

  useCopilotAction({
    name: "editTodoItem",
    description: "Edit a todo item text",
    parameters: [
      {
        name: "oldText",
        type: "string",
        required: true,
      },
      {
        name: "newText",
        type: "string",
        required: true,
      },
    ],
    handler: async ({ oldText, newText }) => {
      const item = todos.find(t => t.todo === oldText);
      if (item) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === item.id ? { ...todo, todo: newText } : todo
          )
        );
      }
    },
  });

  useCopilotAction({
    name: "toggleCompleteTodoItem",
    description: "Toggle completion status of a todo item",
    parameters: [
      {
        name: "todoText",
        type: "string",
        required: true,
      },
    ],
    handler: async ({ todoText }) => {
      const item = todos.find(t => t.todo === todoText);
      if (item) {
        console.log("Toggling complete for:", item.todo);
        toggleComplete(item.id);
      } else {
        console.warn("Todo not found for toggle:", todoText);
      }
    },
  });


  // === UI HANDLERS ===

  const handleChange = (e) => setTodo(e.target.value);

  const handleAdd = (task = todo) => {
    const trimmed = task.trim();
    if (!trimmed || trimmed === "Add Your Task") return;

    const existing = todos.find(t => t.todo === trimmed);
    if (existing) {
      console.warn("Todo already exists. Skipping add.");
      return;
    }

    if (!flag) {
      setTodos([{ id: uuidv4(), todo: trimmed, iscompleted: false }, ...todos]);
    } else {
      setTodos(prev =>
        prev.map(item =>
          item.id === idd ? { ...item, todo: trimmed } : item
        )
      );
      setFlag(false);
      setIdd(null);
    }
    setTodo("Add Your Task");
  };


  const handleDelete = (idToDelete) => {
    setTodos(prev => prev.filter(todo => todo.id !== idToDelete));
  };

  const handleEdit = (id) => {
    const item = todos.find(t => t.id === id);
    if (item) {
      setTodo(item.todo);
      inputRef.current?.focus();
      setFlag(true);
      setIdd(id);
    }
  };

  const toggleComplete = (id) => {
    setTodos(prev =>
      prev.map(item =>
        item.id === id ? { ...item, iscompleted: !item.iscompleted } : item
      )
    );
  };

  const erase = () => {
    if (todo === "Add Your Task") setTodo("");
  };

  const update = () => {
    if (todo.trim() === "") setTodo("Add Your Task");
  };

  const filteredTodos = todos.filter(item => {
    if (view === "todo") return !item.iscompleted;
    if (view === "finished") return item.iscompleted;
    return true;
  });

  return (
    <>
      <div className="body">
        <div className="container">
          <div className="heading">
            <div className="subhead">
              <h2 className="addt">To-Do List</h2>
              <div className="todologo">
                <img src="https://www.svgrepo.com/show/444531/gui-todo-list.svg" alt="logo" />
              </div>
            </div>
            <div className="input">
              <input
                ref={inputRef}
                type="text"
                onMouseLeave={update}
                onKeyDown={(e) => {
                  erase();
                  if (e.key === "Enter" && todo.trim() !== "" && todo !== "Add Your Task") {
                    handleAdd();
                  }
                }}
                onClick={erase}
                onChange={handleChange}
                value={todo}
                className="text"
              />
              <button
                onMouseDown={() => setCh1(true)}
                onMouseUp={() => setCh1(false)}
                onClick={() => handleAdd()}
                className={`add ${ch1 ? "active11" : ""}`}
              >
                ADD
              </button>
            </div>
          </div>

          <div className="showfinished">
            {["todo", "all", "finished"].map((type) => (
              <div key={type} className="mid" onClick={() => setView(type)}>
                <div className="btnss">
                  {view === type ? (

                    <Image
                      src="/checkbox.svg"
                      alt="checkbox"
                      width={24}   // specify width & height for optimization
                      height={24}
                    />

                  ) : (
                    <button className="circle"></button>
                  )}
                </div>
                <div className="mid_text">
                  {`Showing ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </div>
              </div>
            ))}
          </div>

          <div className="yourtodo">
            <div className="todos">
              {filteredTodos.length === 0 && <div className="empty">{"No To-Do's"}</div>
              }
              {filteredTodos.map((item) => (
                <Todo
                  key={item.id}
                  text={item.todo}
                  id={item.id}
                  iscompleted={item.iscompleted}
                  toggleComplete={toggleComplete}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  view={view}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <CopilotPopup
        instructions="You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        labels={{
          title: "Popup Assistant",
          initial: "Need any help?",
        }}
      />
    </>
  );
}
