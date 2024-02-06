class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            voiceButton: document.getElementById('voiceButton'),
            voiceResponse: document.getElementById('voiceResponse')
        }

        this.state = true;
        this.messages = [];
        this.speechSynthesis = window.speechSynthesis;
        this.speechUtterance = new SpeechSynthesisUtterance();
        this.voiceButtonEnabled = false;
        this.isSpeaking = false;
    }

    display() {
        const { openButton, chatBox, sendButton, voiceButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        voiceButton.addEventListener('click', () => this.toggleVoice());

        voiceButton.style.color = 'white';

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hide the box
        if (this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    toggleVoice() {
        // Toggle the voice speaking state
        this.isSpeaking = !this.isSpeaking;

        // Toggle the class of the microphone icon element
        const voiceButton = this.args.voiceButton;
        voiceButton.classList.toggle('fa-microphone-slash', this.isSpeaking);

        if (this.isSpeaking) {
            // If voice is enabled, speak the most recent chatbot response
            this.speakMostRecentChatbotResponse();
        } else {
            // If voice is disabled, stop speaking
            this.stopSpeaking();
        }
    }

    speakMostRecentChatbotResponse() {
        if (this.messages.length > 0) {
            const lastChatbotResponse = this.messages
                .slice()
                .reverse()
                .find((message) => message.name === "Sam");

            if (lastChatbotResponse) {
                // Speak the most recent chatbot response
                this.speechUtterance.text = lastChatbotResponse.message;
                this.speechSynthesis.speak(this.speechUtterance);
            }
        }
    }

    speakResponse() {
        if (this.messages.length > 0) {
            const lastMessage = this.messages[this.messages.length - 1];
            const textToSpeak = lastMessage.message;
            this.speechUtterance.text = textToSpeak;
            this.speechSynthesis.speak(this.speechUtterance);
        }
    }

    stopSpeaking() {
        this.speechSynthesis.cancel();
    }

    onSendButton(chatbox) {
        const textField = chatbox.querySelector('input');
        const text = textField.value.trim();

        if (text === "") {
            return;
        }

        // Add the user's message to the chat history
        const userMessage = { name: "User", message: text };
        this.messages.push(userMessage);

        // Update the UI to show the user's message
        this.updateChatText(chatbox);
        textField.value = '';

        // Make a prediction using the Sentence Transformer model
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            const botMessage = { name: "Sam", message: data.answer };

            // Add the chatbot's response to the chat history
            this.messages.push(botMessage);

            // Update the UI to show the chatbot's response
            this.updateChatText(chatbox);

            if (this.voiceButtonEnabled) {
                this.speakResponse();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle any errors if necessary
        });
    }

    updateChatText(chatbox) {
        let html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Sam") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();