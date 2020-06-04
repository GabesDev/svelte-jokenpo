<script>
  import { onMount, afterUpdate } from "svelte";
  export let socket;

  let messages = [];
  let recAnimation = "none";
  let messagesContainer;

  let SpeechRecognition;
  let SpeechGrammarList;
  let grammar;
  let recognition;
  let speechRecognitionList;

  let initRecordingObjects = () => {
    SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    grammar = "#JSGF V1.0;";

    recognition = new SpeechRecognition();
    speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);

    recognition.grammars = speechRecognitionList;
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuos = true;
  };

  let recordEventBinding = () => {
    recognition.onspeechend = () => stopRecording();

    recognition.onresult = e => {
      let last = e.results.length - 1;
      let command = e.results[last][0].transcript;

      let text = command.toLowerCase();
      if (!isCommand(text)) socket.emit("newMessage", { text });
    };

    recognition.onerror = e => console.log("Não reconheceu: " + e.error);
  };

  let isCommand = text => {
    if (text === "alerta") {
      alert("Exemplo de comando");
      return true;
    }
    return false;
  };

  onMount(() => {
    initRecordingObjects();
    recordEventBinding();
  });

  afterUpdate(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });

  let stopRecording = () => {
    recognition.stop();
    recAnimation = "none";
  };

  let recordToggle = () => {
    if (recAnimation === "animating") {
      stopRecording();
    } else {
      recognition.start();
      recAnimation = "animating";
    }
  };

  socket.on("renderMessages", allMessages => {
    messages = [...allMessages.messages];
  });
</script>

<style type="text/scss">
  .container {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 400px;
    width: 400px;
    padding: 0;
    background: rgba(0, 0, 0, 0.5);
    border-top: 2px solid white;
    color: white;
  }

  .messages {
    height: 360px;
    overflow-y: scroll;
    p {
      margin: 5px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 5px;
    }
    .user {
      color: lightblue;
      text-transform: capitalize;
    }
    .me {
      color: gold;
    }
  }

  .record-container {
    width: 100%;
    background: white;
    height: 35px;
    padding: 0 20px;
    cursor: pointer;
    color: black;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &.animating {
      background: rgb(218, 73, 73);
      .record-button {
        animation: recording 1.5s infinite;
      }
    }
  }

  .record-button {
    border-radius: 50%;
    width: 15px;
    height: 15px;
    background: red;
    border: 2px solid white;
    box-shadow: 0px 0px 0px 2px red;
  }

  @keyframes recording {
    0% {
      background: red;
    }
    50% {
      background: white;
    }
    100% {
      background: red;
    }
  }
</style>

<div class="container">
  <div class="record-container {recAnimation}" on:click={recordToggle}>
    Click to record
    <div class="record-button" />
  </div>
  <div class="messages" bind:this={messagesContainer}>
    {#each messages as message}
      <p>
        <span class="user {message.uid === socket.id ? 'me' : ''}">
          {message.user}
        </span>
        {message.text}
      </p>
    {/each}
  </div>
</div>
