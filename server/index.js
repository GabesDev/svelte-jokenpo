const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, updateUser, removeUser, getUser, getUsers, makeBusy, makeFree } = require('./users');
const { addMessage, getMessages } = require('./messages');

const PORT = process.env.PORT || 3000;
const router = require('./router');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on('connect', (socket) => {
	socket.on('join', (name, callback) => {
		const { error, user } = addUser({ id: socket.id, name: name });
		if (error) return callback({ error });

		let allMessages = getMessages()
		io.emit('renderMessages', allMessages)
		renderAll()
		callback({ user });
	});

	socket.on('updatePosition', (user) => {
		updateUser(user);
		renderAll()
	});

	socket.on('newMessage', ({ text }) => {
		let user = getUser(socket.id)
		let allMessages = addMessage({ user, text })
		io.emit('renderMessages', allMessages)
	})

	socket.on('askBattle', (challenged) => {
		let enemy = getUser(socket.id)

		makeBusy(enemy)
		makeBusy(challenged)
		renderAll()

		io.to(challenged.id).emit('challenged', enemy)
		io.to(enemy.id).emit('waiting')
	})

	socket.on('answerBattle', ({ enemy, answer }) => {
		let challenged = getUser(socket.id)
		if (answer) {
			io.to(challenged.id).emit('openModal', enemy)
			io.to(enemy.id).emit('openModal', challenged)
		} else {
			io.to(enemy.id).emit('battleDenied', challenged)
			io.to(challenged.id).emit('battleDenied', enemy)
			makeFree(enemy)
			makeFree(challenged)
			renderAll()
		}
	})

	socket.on('choiceMade', ({ option, enemy }) => {
		let sender = getUser(socket.id)
		io.to(enemy.id).emit('option', { sender, option })
	})

	socket.on('battleEnded', (enemy) => {
		let challenged = getUser(socket.id)
		if (enemy) makeFree(enemy)
		if (challenged) makeFree(challenged)
		renderAll()
	})

	socket.on('disconnect', () => {
		removeUser(socket.id);
		renderAll()
	});

	let renderAll = () => {
		const users = getUsers();
		io.emit('renderAll', { users });
	}
});

server.listen(PORT, () => {
	console.log(`Server has started on Port ${PORT}`);
});