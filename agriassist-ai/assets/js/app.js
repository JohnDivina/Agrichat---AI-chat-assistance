const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatBox = document.getElementById('chat-box');
const statusPill = document.getElementById('status-pill');
const sampleButtons = document.querySelectorAll('.sample-button');

let isWaiting = false;

function setWaiting(waiting) {
    isWaiting = waiting;
    sendButton.disabled = waiting;
    messageInput.disabled = waiting;
    statusPill.textContent = waiting ? 'Thinking' : 'Ready';
    statusPill.classList.toggle('loading', waiting);
}

function scrollChatToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendInlineText(parent, text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    parts.forEach((part) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            const strong = document.createElement('strong');
            strong.textContent = part.slice(2, -2);
            parent.appendChild(strong);
            return;
        }

        parent.appendChild(document.createTextNode(part));
    });
}

function appendParagraph(container, lines) {
    const paragraph = document.createElement('p');

    lines.forEach((line, index) => {
        if (index > 0) {
            paragraph.appendChild(document.createElement('br'));
        }

        appendInlineText(paragraph, line);
    });

    container.appendChild(paragraph);
}

function appendList(container, items, ordered) {
    const list = document.createElement(ordered ? 'ol' : 'ul');

    items.forEach((item) => {
        const listItem = document.createElement('li');
        appendInlineText(listItem, item);
        list.appendChild(listItem);
    });

    container.appendChild(list);
}

function renderMessageContent(text) {
    const container = document.createElement('div');
    container.className = 'message-content';

    const lines = text.split(/\r?\n/);
    let paragraphLines = [];
    let listItems = [];
    let listType = null;

    function flushParagraph() {
        if (paragraphLines.length > 0) {
            appendParagraph(container, paragraphLines);
            paragraphLines = [];
        }
    }

    function flushList() {
        if (listItems.length > 0) {
            appendList(container, listItems, listType === 'ordered');
            listItems = [];
            listType = null;
        }
    }

    lines.forEach((line) => {
        const trimmed = line.trim();
        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);

        if (trimmed === '') {
            flushParagraph();
            flushList();
            return;
        }

        if (orderedMatch) {
            flushParagraph();
            if (listType !== 'ordered') {
                flushList();
                listType = 'ordered';
            }
            listItems.push(orderedMatch[1]);
            return;
        }

        if (unorderedMatch) {
            flushParagraph();
            if (listType !== 'unordered') {
                flushList();
                listType = 'unordered';
            }
            listItems.push(unorderedMatch[1]);
            return;
        }

        flushList();
        paragraphLines.push(trimmed);
    });

    flushParagraph();
    flushList();

    if (!container.hasChildNodes()) {
        appendParagraph(container, [text]);
    }

    return container;
}

function addMessage(role, text, options = {}) {
    const message = document.createElement('div');
    message.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;

    if (options.error) {
        message.classList.add('error-message');
    }

    if (options.thinking) {
        message.classList.add('thinking-message');
    }

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = role === 'user' ? 'You' : 'AgriAssist AI';

    const body = renderMessageContent(text);

    message.append(label, body);
    chatBox.appendChild(message);
    scrollChatToBottom();

    return message;
}

function getErrorMessage(error, fallback) {
    if (error && typeof error === 'object' && 'message' in error) {
        return error.message;
    }

    return fallback;
}

async function sendQuestion(question) {
    const trimmedQuestion = question.trim();

    if (trimmedQuestion === '' || isWaiting) {
        return;
    }

    addMessage('user', trimmedQuestion);
    messageInput.value = '';
    setWaiting(true);

    const thinkingMessage = addMessage('assistant', 'AgriAssist is thinking...', {
        thinking: true
    });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: trimmedQuestion
            })
        });

        const data = await response.json();
        thinkingMessage.remove();

        if (!response.ok || !data.success) {
            addMessage('assistant', data.error || 'Something went wrong while getting a response.', {
                error: true
            });
            return;
        }

        addMessage('assistant', data.reply);
    } catch (error) {
        thinkingMessage.remove();
        addMessage('assistant', getErrorMessage(error, 'Unable to reach the chat endpoint.'), {
            error: true
        });
    } finally {
        setWaiting(false);
        messageInput.focus();
    }
}

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendQuestion(messageInput.value);
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

sampleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        messageInput.value = button.dataset.question || '';
        sendQuestion(messageInput.value);
    });
});
