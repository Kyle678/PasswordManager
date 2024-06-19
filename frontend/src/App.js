import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

  const getCookie = (name) => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
  }

  useEffect(() => {
    async function attemptAutoLogin() {
      const t = getCookie("token");
      if(!t){return;}
      console.log("token: ", t);
      setToken(t);
      setStatus("Automatically logged in.");
    }
    attemptAutoLogin();
  }, []);

  const register = async() => {
    try{
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
      if(response.ok){
        const data = await response.json();
        setToken(data.token);
        setCookie("token", data.token, 7);
        setError('');
      }else{
        setError('Invalid credentials');
      }
    }catch(err){
      setError('An error occurred');
      console.error('Login faled', err);
    }
  }

  const login = async() => {
    try{
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
      if(response.ok){
        const data = await response.json();
        setToken(data.token);
        setCookie("token", data.token, 7);
        setError('');
      }else{
        setError('Invalid credentials');
      }
    }catch(err){
      setError('An error occurred');
      console.error('Login faled', err);
    }
  }

  const protectedPath = async() => {
    console.log("using token",token);
    try{
      const response = await fetch('http://localhost:5000/protectedPath', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      });
      if(response.ok){
        const data = await response.json();
        console.log(data);
      }else{
        console.error('Access denied');
      }
    }catch(err){
      console.error('An error occurred', err);
    }
  }

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={register}>Register</button>
        <button onClick={login}>Login</button>
        <button onClick={protectedPath}>protected</button>
        {error && <p>{error}</p>}
        {!error && <p>{status}</p>}
      </div>
    </div>
  );
}

export default App;
