import React, {useState} from 'react';
import firebase from '../firebase';
import {Link, Redirect} from 'react-router-dom';
import '../App.css';
import {v4 as uuidv4} from 'uuid';


export default function Home() {

  //string
  const [username, setUsername] = useState(localStorage.getItem("username") === null ? "" : localStorage.getItem("username"));
  //string
  const [joinLobbyId, setJoinLobbyId] = useState("");
  //string
  const [invalidNameMessage, setInvalidNameMessage] = useState("");
  //string
  const [invalidLobbyMessage, setInvalidLobbyMessage] = useState("");
  //bool
  const [returningUser] = useState(localStorage.getItem("username") !== null);
  
  const [redirect, setRedirect] = useState(() => {
    // if(localStorage.getItem("inGame") !== null) {
    //   return "game";
    // }
    // else 
    if(localStorage.getItem("inLobby") !== null)
      return '/lobby'
    return null;
  });


  function createLobby() {
    let gameId = uuidv4().substring(0,5);

    if(localStorage.getItem("gameId")) {
      gameId = localStorage.getItem("gameId");
    }

    localStorage.setItem("inLobby", true);
    localStorage.setItem("inGame", false);
    localStorage.setItem("gameId", gameId);

    let userId = localStorage.getItem('userId');
    let username = localStorage.getItem('username');

    let gameInfo = {
      hostId: userId,
    }
    let rootRef = firebase.database().ref();
    let lobbiesRef = rootRef.child('lobbies');
    lobbiesRef.child(gameId).set(gameInfo);
    lobbiesRef.child(gameId).child('players').child(userId).set({name: username});
  }

  function joinLobby() {
    document.getElementById('username')

    let userId = localStorage.getItem('userId');
    let username = localStorage.getItem('username');

    let gameRef = firebase.database().ref().child(`lobbies/${joinLobbyId}`);

    gameRef.once("value")
        .then(function(snapshot) {
          if(snapshot.exists()) {
            gameRef.child('players').child(userId).set({name: username});

            localStorage.setItem("inLobby", true);
            localStorage.setItem("inGame", false);
            localStorage.setItem("gameId", joinLobbyId);
            setRedirect('/lobby');
          }
          else {
            setInvalidLobbyMessage("Lobby does not exist. Try again.");
          }
        });   
  }

    return( 
      <div>
        {
          redirect?

          <Redirect to={redirect}/>
          :
          <>
          <h1>Welcome to the Game</h1>
          <form onSubmit={(e) => {e.preventDefault()}}>
            <div>
              {
              returningUser ?
              <span>Welcome back {username}</span>
              :
              <>
                <span>Enter a name to play: </span>
                <input  onChange={(e) => {setUsername(e.target.value.trim())}} type="text" required/>
              </>
              }
            </div> 
            <hr/>
            <div>
              <span>Join a friend, enter their lobby code: </span>
              <div>
                <input onChange={(e) => { setJoinLobbyId(e.target.value.trim())}} type="text"/>
                <button onClick={username !== "" ? joinLobby : null}>Join Friend</button>
              </div>
            </div>
            <div>
              <span>Join a random game: <button id="random-game-button">Join Random</button></span>
            </div>
            <div>
              <span>Create a new lobby and invite friends: 
                {
                username === "" ? 
                <>
                  <button onClick={() => {setInvalidNameMessage("Invalid Username Detected!")}}>Create Lobby</button> 
                  <div><span style={{color: "red"}}>{invalidNameMessage}</span></div>
                </> :
                  <Link to="/lobby">
                    {
                      !returningUser ?
                        localStorage.setItem("username", username):
                        null 
                    }
                    <button onClick={createLobby}>Create Lobby</button>
                  </Link>
                }
                <div style={
                  invalidLobbyMessage === "" ?
                  {display: "none"}:
                  {display: "block"}
                }>
                  <span style={{color: "red"}}>{invalidLobbyMessage}</span>
                </div>
              </span>
            </div>
          </form>
          </>
          }
      </div>
      
    )
}