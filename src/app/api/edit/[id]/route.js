import { NextResponse } from 'next/server';
import DbConnect from '@/lib/DbConnect';
import Todo from '@/models/todo';

export async function POST(request, { params }) {
    await DbConnect();

    const userid = params.id;
    const { todo_id, text, done, star, reminderAt, reminderSent ,reminderSentemail} = await request.json();

    if (!userid || !todo_id) {
        return NextResponse.json(
            { success: false, message: "Missing 'userid' or 'todo_id'" },
            { status: 400 }
        );
    }

    // Step 1: Fallback to DB reminderAt if not passed
    let actualReminderAt = reminderAt;
    if (!reminderAt) {
        const userTodo = await Todo.findOne(
            { userid, 'todos.todo_id': todo_id },
            { 'todos.$': 1 }
        );
        if (userTodo?.todos?.[0]?.reminderAt) {
            actualReminderAt = userTodo.todos[0].reminderAt;
        }
    }

    const updateFields = {};

    if (text !== undefined) updateFields['todos.$[elem].text'] = text;
    if (done !== undefined) updateFields['todos.$[elem].done'] = done;
    if (star !== undefined) updateFields['todos.$[elem].star'] = star;
    if (reminderAt !== undefined) updateFields['todos.$[elem].reminderAt'] = new Date(reminderAt);

    // Step 2: Logic to update reminderSent
    if (done !== undefined) {
        let updatedReminderSent = reminderSent;
        let updatedReminderSentemail = reminderSentemail;
        
        if (done === true) {
            updatedReminderSent = true;
            updatedReminderSentemail = true;
        } else if (actualReminderAt) {
            const currentTime = Date.now();
            const reminderTime = new Date(actualReminderAt).getTime();

            if (reminderTime > currentTime) {
                updatedReminderSent = false;
                updatedReminderSentemail = false;
            }
        }

        if (updatedReminderSent !== undefined) {
            updateFields['todos.$[elem].reminderSent'] = updatedReminderSent;
        }

        if (updatedReminderSentemail !== undefined) {
            updateFields['todos.$[elem].reminderSentemail'] = updatedReminderSentemail;
        }
    }
    else {
        if (reminderSent !== undefined) updateFields['todos.$[elem].reminderSent'] = reminderSent;
        if (reminderSentemail !== undefined) updateFields['todos.$[elem].reminderSentemail'] = reminderSentemail;
    }

    // Step 3: Perform update with array filter
    try {
        const updated = await Todo.findOneAndUpdate(
            { userid },
            { $set: updateFields },
            {
                new: true,
                arrayFilters: [{ 'elem.todo_id': todo_id }]
            }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, message: 'Todo not found or not updated' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Todo updated', data: updated },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
