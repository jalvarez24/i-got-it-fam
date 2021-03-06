import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import {Redirect} from 'react-router-dom';
import Chat from './Chat'
import Settings from './Settings'
import './style/lobby.css';


export default function Lobby() {

  const [scoreTarget, setScoreTarget] = useState(0);
  const [roundTime, setRoundTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(0);

  const [redirect, setRedirect] = useState(() => {

    let game = localStorage.getItem('inGame');
    let lobby = localStorage.getItem('inLobby');

    if(lobby && lobby !== 'false') {
      return null;
    }
    else if (game && game === 'true') return '/game'
    return '/'
  });

  function GetPlayerList() {
    const [playerList, setPlayerList] = useState({});
    const [hostId, setHostId] = useState('');
  
    useEffect(() => {
      let gameRef =  firebase.database().ref().child(`lobbies/${localStorage.getItem('gameId')}`);
      gameRef.on('value', (snapshot) => {
        if(!snapshot.exists()) {
          localStorage.removeItem('gameId');
          localStorage.removeItem('inLobby');
          localStorage.removeItem('inGame');
          setRedirect('/');
        }
        else{
          setHostId(snapshot.child('hostId').val());
          let newList = {};
          snapshot.child('players').forEach((player)=> {
            newList[player.key] = {
              name: player.child('name').val(),
              vote: player.child('vote').val(),
              score: player.child('score').val(),
              readyUp: player.child('readyUp').val()
            }
          })

          setScoreTarget(snapshot.child('scoreTarget').val());

          setRoundTime(snapshot.child('roundTime').val());

          setCountdownTime(snapshot.child('countdownTime').val());

          setPlayerList(newList);
          if(snapshot.child('gameStarted').val() === true) {
            localStorage.setItem('inLobby', false);
            localStorage.setItem('inGame', true);
            setRedirect('/game');
          }
        }
      })

      //disconnect on unmount
      return () => {
        gameRef.off();
      }

    }, []);
  
    return {playerList, hostId};
  }

  const {playerList, hostId} = GetPlayerList();

  const [gameId] = useState(localStorage.getItem('gameId'));

  function exitLobby() {
    let gameRef = firebase.database().ref().child(`lobbies/${gameId}`);

    //if host, end game (database.on() handles removing all players if entire game deleted)
    if(hostId === localStorage.getItem('userId')) {
      gameRef.remove();   
    }
    //else remove from playerList and send them back home
    else {
      let playerListRef = gameRef.child('players');
      playerListRef.child(localStorage.getItem('userId')).remove();   
      //update localStorage
      localStorage.removeItem('inLobby');
      localStorage.removeItem('inGame');
      localStorage.removeItem('gameId');
            
      //redirect back '/' (home)
      setRedirect('/');
    }
  }

  function copyLobbyId() {
    var input = document.createElement('textarea');
    input.innerHTML = gameId;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
  }

  function startGame() {
    let rootRef = firebase.database().ref();
    let lobbiesRef = rootRef.child('lobbies');
    lobbiesRef.child(gameId).child('gameStarted').set(true);
    lobbiesRef.child(gameId).child('roundStartTime').set(0);
  }

  return (
    redirect?
    <Redirect to={redirect}/>
    :
    <div className='lobby-container'>
      <div className='lobby'>
        <div className='invite'>
            <h3>Invite your friends! They can join lobby with code: </h3>
            <h2 style={{marginBottom: '1vh', fontFamily: 'Arial'}} id='lobbyIdElement'>{gameId}</h2>
            <button onClick={copyLobbyId}>Copy Code</button>
        </div>
        <div className='playerlist'>
          <h3 style={{marginTop: 0, marginBottom: '4px'}}>Players in Lobby</h3>
          <ul>
              {     
              Object.entries(playerList).map(([key, value]) => {   
                return <li key={key}>
                  <span style={{fontWeight: 'bold'}}>{value.name}</span>
                  <span style={{color: 'red', fontWeight: 'bold'}}> 
                  {key === hostId ? ' Host': ''}
                  </span>
                  <span>
                    {key === localStorage.getItem('userId') ? ' (You)' : ''}
                  </span>
                </li>              
              })
              }   
          </ul>
          <div style={{marginTop: '5px'}}>
            <span>[{Object.keys(playerList).length}/6 Players]</span> 
          </div>  
          {
            
          hostId === localStorage.getItem('userId') ?

          <div className='lobby-options'>
            <button onClick={exitLobby}>End Lobby </button> 
            <button className={Object.keys(playerList).length < 2 ? 'button-disabled':null} 
            title={Object.keys(playerList).length < 2 ? 'At least two players required.':''} 
            disabled={Object.keys(playerList).length < 2} onClick={startGame}>
                Start Game
            </button>
          </div>

          :

          <div className='lobby-options'>
            <button onClick={exitLobby}>Exit Lobby </button> 
            <button title='Host must start game.' className='button-disabled' disabled>
                Start Game
            </button>
          </div>
          
        }     
        </div>
        <div>
      </div>
      </div>

      <div className='chat'>
        <Chat gameId={gameId} playerList={playerList}/>
      </div>

      <Settings hostId={hostId} scoreTarget={scoreTarget} roundTime={roundTime} countdownTime={countdownTime} setRedirect={setRedirect}/>
      
    </div>
  )
}