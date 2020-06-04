<script>
  import { onMount } from "svelte";
  import io from "socket.io-client";

  import UserList from "./components/UserList.svelte";
  import Chat from "./components/Chat.svelte";
  import Battle from "./components/Battle.svelte";

  const ENDPOINT = "https://svelte-jokenpo.herokuapp.com/";
  const STEP = 4;

  let socket = io(ENDPOINT);
  let users = [];
  let currentUser;
  let name;
  let showBattle = false;

  onMount(() => {
    name = prompt("What's your name?");
    if (!name || !name.trim()) location.reload();

    socket.emit("join", name, ({ user, error }) => {
      if (error) {
        alert("Name taken. Please, choose another.");
        location.reload();
      }
      if (user) {
        currentUser = user;
        showBattle = true;
      }
    });
  });

  socket.on("renderAll", usersData => {
    users = usersData.users;
  });

  let keydown = e => {
    if (
      e.code === "ArrowUp" ||
      e.code === "ArrowDown" ||
      e.code === "ArrowLeft" ||
      e.code === "ArrowRight" ||
      e.code === "Space"
    ) {
      if (e.code === "Space") {
        currentUser.char = currentUser.char >= 12 ? 1 : ++currentUser.char;
      } else {
        if (e.code === "ArrowUp") {
          if (currentUser.posY >= STEP) {
            currentUser.posY -= STEP * 2;
          }
        }
        if (e.code === "ArrowDown") {
          if (currentUser.posY <= 100 - STEP * 4) {
            currentUser.posY += STEP * 2;
          }
        }
        if (e.code === "ArrowLeft") {
          if (currentUser.posX >= STEP) {
            currentUser.posX -= STEP;
          }
        }
        if (e.code === "ArrowRight") {
          if (currentUser.posX <= 100 - STEP * 2) {
            currentUser.posX += STEP;
          }
        }
        currentUser.face = e.code;
        currentUser.extraClass = "moving";
      }

      socket.emit("updatePosition", currentUser);
    }
  };
</script>

<main>
  <UserList {users} {socket} />
</main>
<Chat {socket} />

{#if showBattle}
  <Battle {currentUser} {socket} />
{/if}

<svelte:window on:keydown={keydown} />
