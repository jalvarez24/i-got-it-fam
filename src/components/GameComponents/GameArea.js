import React, {useState, useEffect, useRef} from 'react';
import '../style/game.css';
import './style/game-area.css';

export default function GameArea({category, letter, roundStartTime, roundEndTime, answer, setGameVoteOn, gameVoteOn}) {

    const [roundTimerOn, setRoundTimerOn] = useState(false);
    const [roundEndTimerOn, setRoundEndTimerOn] = useState(false);

    const roundEndReq = useRef(null);

    useEffect(() => {
        if(answer !== ""){
            setRoundEndTimerOn(false);
        }    

        return () => {
            window.cancelAnimationFrame(roundEndReq.current);
        }

    }, [answer]);

    function Timer(duration, element) {
        var self = this;
        this.duration = duration;
        this.element = element;
        this.running = false;
        
        this.els = {
            ticker: document.getElementById('ticker'),
            seconds: document.getElementById('seconds'),
        };
    }
    
    Timer.prototype.start = function() {
        var self = this;
        var start = null;
        this.running = true;
        var remainingSeconds = this.els.seconds.textContent = this.duration / 1000;
        
        function draw(now) { 
            if (!start) {
                start = now;
                //protects if animation called while browser was in background
                self.duration = roundStartTime - Date.now();
            }
            var diff = now - start;
            var newSeconds = Math.ceil((self.duration - diff)/1000);
            if (diff <= self.duration) {
                self.els.ticker.style.height = 100 - (diff/self.duration*100) + '%';
                
                if (newSeconds !== remainingSeconds) {
                    self.els.seconds.textContent = newSeconds;
                    remainingSeconds = newSeconds;
                }
                
                self.frameReq = window.requestAnimationFrame(draw);
                
            } else {
                self.running = false;
                self.els.ticker.style.height = '0%';
                setRoundTimerOn(false);
                
            }
        };
        
        self.frameReq = window.requestAnimationFrame(draw);
    }

    function RoundTimer(duration) {
        var self = this;
        this.duration = duration;
        this.running = false;
        this.ticker = document.querySelector('.countdown-game');
    }
    
    RoundTimer.prototype.start = function() {
        var self = this;
        var start = null;
        this.running = true;
        
        function draw(now) {  
            if (!start) {
                start = now;
                //protects if animation called while browser was in background
                self.duration = roundEndTime - Date.now();
            }

            var diff = now - start;

            if(self.ticker === null) {
                self.ticker = document.querySelector('.countdown-game');
            }

            if (diff <= self.duration) {
                if(self.ticker !== null)
                    self.ticker.style.height = 100 - (diff/self.duration*100) + '%';          
                    // self.frameReq = window.requestAnimationFrame(draw);
                    roundEndReq.current = window.requestAnimationFrame(draw);
            } 
            else {
                self.running = false;
                if(self.ticker !== null)
                    self.ticker.style.height = '0%';
                setRoundEndTimerOn(false);
                setGameVoteOn(true);
            }
        };
        
        roundEndReq.current = window.requestAnimationFrame(draw);
    }


    useEffect(() => {
        if(typeof(roundStartTime) === "number"){
            if(roundStartTime > Date.now()){
                //before startingTime make sure timer element is on!
                setRoundTimerOn(true);
            }
            else{
                setRoundTimerOn(false);
            }
        }
    }, [roundStartTime])

    useEffect(() => {
        if(roundTimerOn === true){
            startTime();
        }
    }, [roundTimerOn])

    
    useEffect(() => {
        if(typeof(roundEndTime) === "number"){
            if(roundEndTime > Date.now() && roundStartTime <= Date.now()){
                setRoundEndTimerOn(true);
            }
            else{
                setRoundEndTimerOn(false);
            }
        }
    }, [roundEndTime])

    useEffect(() => {
        if(roundEndTimerOn === true){
            startRoundTime();
        }
    }, [roundEndTimerOn])

    function startTime() {
        document.querySelector('.countdown-pregame').style.height = "100%"; 
        let timer = new Timer((roundStartTime - Date.now()), document.getElementById('countdown'));
        timer.start();
    }

    function startRoundTime() {
        let roundTimer = new RoundTimer((roundEndTime - Date.now()));
        roundTimer.start();
    }
    
    return (
        <div className="game-component">
            <div className="game-area-div">
                {
                    
                roundTimerOn ?

                <div className="countdown-container">
                    <div className="countdown-pregame" >
                        <div className="countdown-fill" id="ticker"/>
                        <div className="countdown-digit" id="seconds"/>
                    </div>
                </div>

                :

                <div className="categories-container">
                    {
                        roundEndTimerOn ?
                        <div className="countdown-game"/>
                        :
                        null
                    }
                    {
                    category === "" || letter === "" ?
                    <div className="loading-category">
                        <span className="game-category-loading-text">
                            Loading Round
                            <span className="loader-category__dot">.</span><span className="loader-category__dot">.</span><span className="loader-category__dot">.</span>
                        </span>
                    </div>
                    :
                    <>                     
                        <div className="category">
                            <span style={{textDecoration: "underline"}}>Category:</span>
                            <span id="categoryText" className="category-text">
                                {category}
                            </span>
                        </div>
                        <div className="letter">
                            <span style={{textDecoration: "underline"}}>Letter:</span>
                            <span id="letterText" className="letter-text">
                                {letter}
                            </span>
                        </div>
                    </>
                    }
                </div>

                }             
            </div>
        </div>
    )
}