import "./App.css";
let ws = new WebSocket("ws://localhost:8025/websockets/game");

function App() {
  //   console.log(ws);
  ws.onmessage = (e) => {
    let message = e.data;
    // console.log(message);
    let parsedMessage = JSON.parse(message);
    console.log("Message from server: \n" + message);
  };

  return (
    <div className="login" onClick={handleClick}>
      {"Login"}
    </div>
  );
}

const handleClick = () => {
  ws.send(
    JSON.stringify({
      type: 0,
      username: "Gruppe AI",
    })
  );
};

export default App;
