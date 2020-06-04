const messages = [];

const addMessage = ({ user: { id, name }, text }) => {
    const message = { uid: id, user: name, text };
    messages.push(message);
    if (messages.length > 10) messages.shift()
    return { messages };
};

const getMessages = () => { return { messages } };

module.exports = { addMessage, getMessages };
