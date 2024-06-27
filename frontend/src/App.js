import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

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
        setStatus(data.message);
        setToken(data.token);
        setCookie("token", data.token, 7);
      }else{
        const data = await response.json();
        setStatus(data.message);
      }
    }catch(err){
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
          password: password,
          stayLoggedIn: stayLoggedIn
        })
      });
      if(response.ok){
        const data = await response.json();
        setStatus(data.message);
        setToken(data.token);
        setCookie("token", data.token, 7);
      }else{
        const data = await response.json();
        setStatus(data.message);
      }
    }catch(err){
      console.error('Login faled', err);
    }
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  const logout = async() => {
    try{
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(response.ok){
        const data = await response.json();
        setStatus(data.message);
        deleteCookie("token");
        setToken('');
      }
    }catch(err){
      console.error('Logout failed');
    }
  }

  const handleCheckboxChange = async() => {
    setStayLoggedIn(!stayLoggedIn);
  }

  const protectedPath = async() => {
    try{
      const response = await fetch('http://localhost:5000/protectedPath', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      });
      if(response.ok){
        const data = await response.json();
        setStatus(data.message);
      }else{
        const data = await response.json();
        setStatus(data.message);
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
        <button onClick={logout}>Logout</button>
        <button onClick={protectedPath}>Protected</button>
        <input 
          type="checkbox"
          checked={stayLoggedIn}
          onChange={handleCheckboxChange}
        />
        <label >Stay Logged In</label>
        <br />
        {status}
      </div>
    </div>
  );
}

export default App;
