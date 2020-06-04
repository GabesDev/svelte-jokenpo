<script>
  import { slide, fly } from "svelte/transition";

  export let currentUser;
  export let socket;

  let enemy;
  let askModal = false;
  let openModal = false;
  let challenged = false;
  let waiting = false;
  let animated = "animated";
  let compareValues = [];
  let battleResult = "";
  let myOption = "";
  let enemyOption = "";

  let options = [
    {
      name: "rock",
      selected: false
    },
    {
      name: "paper",
      selected: false
    },
    {
      name: "scissors",
      selected: false
    }
  ];

  let resetStatus = () => {
    enemy = {};
    askModal = false;
    openModal = false;
    challenged = false;
    waiting = false;
    animated = "animated";
    battleResult = "";
    myOption = "";
    enemyOption = "";
    options = [
      {
        name: "rock",
        selected: false
      },
      {
        name: "paper",
        selected: false
      },
      {
        name: "scissors",
        selected: false
      }
    ];

    compareValues = [];
  };

  socket.on("challenged", challenger => {
    enemy = challenger;
    askModal = true;
    challenged = true;
  });

  socket.on("waiting", () => {
    askModal = true;
    waiting = true;
  });

  socket.on("openModal", newEnemy => {
    resetStatus();
    enemy = { ...newEnemy };
    openModal = true;
  });

  socket.on("battleDenied", enemy => {
    resetStatus();
  });

  let answerBattle = answer => {
    socket.emit("answerBattle", { enemy, answer });
  };

  let selected = option => {
    const hasSelected = options.findIndex(o => o.selected === true);
    if (hasSelected !== -1) return;
    animated = "";
    option.selected = true;

    const optionIndex = options.findIndex(o => o.name === option.name);
    options[optionIndex] = option;
    options = [...options];
    compareValues[0] = option;
    socket.emit("choiceMade", { option, enemy });
  };

  socket.on("option", ({ sender, option }) => {
    compareValues[1] = option;
  });

  $: {
    if (compareValues[0] && compareValues[1]) {
      if (compareValues[0].name === "rock") {
        if (compareValues[1].name === "rock")
          finishBattle({
            result: "tie",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
        if (compareValues[1].name === "paper")
          finishBattle({
            result: "lost",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
        if (compareValues[1].name === "scissors")
          finishBattle({
            result: "won",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
      } else if (compareValues[0].name === "paper") {
        if (compareValues[1].name === "rock")
          finishBattle({
            result: "won",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
        if (compareValues[1].name === "paper")
          finishBattle({
            result: "tie",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
        if (compareValues[1].name === "scissors")
          finishBattle({
            result: "lost",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
      } else if (compareValues[0].name === "scissors") {
        if (compareValues[1].name === "rock")
          finishBattle({
            result: "lost",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
        if (compareValues[1].name === "paper")
          finishBattle({
            result: "won",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
        if (compareValues[1].name === "scissors")
          finishBattle({
            result: "tie",
            optionName: compareValues[0],
            enemyOptionName: compareValues[1]
          });
      }
      compareValues = [];
    }
  }

  let finishBattle = ({ result, optionName, enemyOptionName }) => {
    myOption = optionName.name;
    enemyOption = enemyOptionName.name;
    battleResult = result;

    setTimeout(() => {
      askModal = true;
      setTimeout(() => {
        socket.emit("battleEnded", enemy);
        resetStatus();
      }, 3000);
    }, 3000);
  };

  let keydown = e => {
    if (e.code === "Escape") {
      socket.emit("battleEnded", enemy);
      resetStatus();
    }
  };
</script>

<style type="text/scss">
  .container {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    overflow-x: hidden;
    position: absolute;
    z-index: 1;
  }
  .background {
    height: 300px;
    border-top: 3px solid white;
    border-bottom: 3px solid white;
    z-index: 1;
    width: 100%;
    img {
      width: 100%;
      object-fit: cover;
      object-position: bottom;
      max-height: 100%;
    }
  }
  .full-user {
    width: 100px;
    height: 160px;
    background: url(/images/sprites.png);
    position: absolute;
    z-index: 1;
    transform: scale(4);
    transition: all 1s;
    &.left {
      left: 20%;
    }
    &.right {
      right: 20%;
    }

    &.user-1 {
      background-position: -10px -25px;
    }
    &.user-2 {
      background-position: -250px -35px;
    }
    &.user-3 {
      background-position: -485px -30px;
    }
    &.user-4 {
      background-position: -10px -220px;
    }
    &.user-5 {
      background-position: -250px -220px;
    }
    &.user-6 {
      background-position: -485px -215px;
    }
    &.user-7 {
      background-position: -10px -410px;
    }
    &.user-8 {
      background-position: -250px -410px;
    }
    &.user-9 {
      background-position: -485px -410px;
    }
    &.user-10 {
      background-position: -10px -600px;
    }
    &.user-11 {
      background-position: -250px -600px;
    }
    &.user-12 {
      background-position: -485px -600px;
    }
  }
  .ask-modal {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    right: 0;
    top: calc(50% - 150px);
    width: 50%;
    height: 300px;
    background: white;
    margin: 0 auto;
    border: 2px solid black;
    border-radius: 4px;
    z-index: 2;
    button {
      width: 50%;
      font-size: 3rem;
      cursor: pointer;
      &.accept {
        background-color: rgba(0, 255, 0, 0.5);
      }
      &.deny {
        background-color: rgba(255, 0, 0, 0.5);
      }
    }
  }
  .options {
    position: absolute;
    z-index: 1;
    background: white;
    width: 200px;
    display: flex;
    align-items: center;
    flex-flow: column;
    border-radius: 100px;
  }
  .option {
    background: url(/images/jkp.png);
    width: 120px;
    height: 160px;
    transform: rotate(90deg);
    cursor: pointer;

    &.paper {
      background-position: -126px -460px;
    }
    &.scissors {
      background-position: -250px -460px;
    }
    &.rock {
      background-position: -380px -480px;
    }
  }
  .transparent {
    opacity: 0.5;
  }
  .animated {
    animation: 1.5s wiggle infinite;
    opacity: 1;
  }

  .result {
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    .option {
      position: absolute;
      z-index: 1;
      transition: left 2s cubic-bezier(0.16, 0.59, 0.75, -0.06),
        right 2s cubic-bezier(0.16, 0.59, 0.75, -0.06);
      &.me {
        left: -480px;
        transform: scale(3) rotate(90deg);
      }
      &.enemy {
        right: -480px;
        transform: scale(3) rotate(270deg);
      }
    }

    &.won {
      .option {
        &.me {
          transform: scale(3.5) rotate(90deg);
          left: 79%;
          z-index: 2;
        }
        &.enemy {
          transition: right 1.5s cubic-bezier(0.24, 0.64, 0.49, 1);
          transform: scale(2.5) rotate(270deg);
          right: 15%;
        }
      }
    }

    &.lost {
      .option {
        &.me {
          transition: left 1.5s cubic-bezier(0.24, 0.64, 0.49, 1);
          transform: scale(2.5) rotate(90deg);
          left: 15%;
        }
        &.enemy {
          transform: scale(3.5) rotate(270deg);
          right: 79%;
          z-index: 2;
        }
      }
    }
    &.tie {
      .option {
        &.me {
          transform: scale(3) rotate(90deg);
          left: calc(50% - 300px);
        }
        &.enemy {
          transform: scale(3) rotate(270deg);
          right: calc(50% - 300px);
        }
      }
    }
  }

  @keyframes wiggle {
    10%,
    90% {
      transform: rotate(90deg);
    }
    20%,
    80% {
      transform: rotate(92deg);
    }
    30%,
    50%,
    70% {
      transform: rotate(82deg);
    }
    40%,
    60% {
      transform: rotate(92deg);
    }
  }
</style>

{#if askModal}
  <div transition:slide class="ask-modal">
    {#if challenged}
      <h1>{enemy.name} challenged you!</h1>
      <button class="accept" on:click={() => answerBattle(true)}>Accept</button>
      <button class="deny" on:click={() => answerBattle(false)}>Deny</button>
    {:else if waiting}
      <h1>...</h1>
    {:else if battleResult}
      <h1>{battleResult === 'tie' ? 'Tied!' : `You ${battleResult}!`}</h1>
    {/if}
  </div>
{/if}

{#if openModal && enemy}
  <div class="container">
    <div in:fly={{ x: 1000, y: 0, duration: 1500 }} class="background">
      <img
        in:fly={{ x: -2000, duration: 1500 }}
        src="../images/battle.jpg"
        alt="Background" />
    </div>
    <div
      in:fly={{ x: -500, duration: 1000, delay: 1000 }}
      class="full-user user-{currentUser.char} left" />
    <div class="options" in:slide={{ delay: 2000 }}>
      {#each options as option}
        <div
          class="option {option.selected ? '' : 'transparent'}
          {animated}
          {option.name}"
          on:click={() => selected(option)} />
      {/each}
    </div>
    <div
      in:fly={{ x: 500, duration: 1000, delay: 1000 }}
      class="full-user user-{enemy.char} right" />
    <div class="result {battleResult}">
      <option class="option me {myOption}" />
      <option class="option enemy {enemyOption}" />
    </div>
  </div>
{/if}

<svelte:window on:keydown={keydown} />
