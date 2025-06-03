import React from 'react';
import './Todo.css';
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
// import './Res.css';
const Todo = ({ text, id, iscompleted, toggleComplete, onDelete, onEdit ,view }) => {
  return (
    <div>
      <div className="todo">
        <div className="text">
          <div className="cng">
            {iscompleted ? (
              <img
                onClick={() => toggleComplete(id, iscompleted)}
                className="checkimg"
                src="checkbox.svg"
                alt=""
              />
            ) : (
              <button
                onClick={() => toggleComplete(id, iscompleted)}
                className="checkbox"
              ></button>
            )}
          </div>
          <div className={`texxt ${ iscompleted &&view!="finished" ? "linethr" : ""}`}>
            {text}
          </div>
        </div>
        <div className="buttons">
          <button className="edit" onClick={() => onEdit(id)}>Edit</button>
          <button className="delete" onClick={() => onDelete(id)}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default Todo;
