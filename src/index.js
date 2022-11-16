const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find((current) => current.username === username);
  if (!user) {
    return response.status(404).json({error: "User not found! =/"});
  }
  request.user = user;

  return next();
}

function checksExistsTodoUser(request, response, next) {
  const {todos} = request.user;
  const {id} = request.params;
  const todo = todos.find((current) => current.id === id);
  if (!todo){
    return response.status(404).json({error: "Todo not found! =/"});
  }
  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const {body: user} = request;
  if (users.some((current) => current.username === user.username)){
    return response.status(400).json({
      error: "Username already exists! =/"
    });
  }
  user.id = uuidv4();
  user.todos = [];
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user;
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user;
  const {body: todo} = request;
  todo.deadline = new Date(todo.deadline);
  todo.created_at = new Date();
  todo.id = uuidv4();
  todo.done = false;
  todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodoUser, (request, response) => {
  const {todo} = request;
  const {body: update} = request;
  todo.deadline = new Date(update.deadline);
  todo.title = update.title;

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodoUser, (request, response) => {
  const {todo} = request;
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodoUser, (request, response) => {
  const {todo} = request;
  const {todos} = request.user;
  todos.splice(todos.indexOf(todo), 1);

  return response.status(204).send();
});

module.exports = app;