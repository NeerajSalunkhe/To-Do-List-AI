import mongoose from "mongoose";

const todoschema = new mongoose.Schema({
    userid: { type: String, required: true },
    phone: { type: String, required: true },
    todos: [
        {
            todo_id: { type: String, required: true },
            text: { type: String, required: true },
            done: { type: Boolean, default: false },
            star: { type: Boolean, default: false },
            reminderAt: { type: Date },
            reminderSent: { type: Boolean, default: false },
        },
    ],
    whatsapp_joined: {
        type: Boolean,
        default: false,
    },
    whatsapp_joined_at: {
        type: Date,
    }
});

const Todo = mongoose.models?.Todo || mongoose.model("Todo", todoschema);
export default Todo;

