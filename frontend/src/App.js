import React, { useState, useEffect } from 'react';
import './App.css';

const baseURL = 'http://localhost:5000/';
const loginURL = baseURL + 'login';
const logoutURL = baseURL + 'logout';
const registerURL = baseURL + 'register';
const protectedURL = baseURL + 'protectedPath';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  async function sendGET(url){
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });
    return response;
  }

  async function sendPOST(url, body){
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    });
    return response
  }

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
      setToken(t);
      setStatus("Automatically logged in.");
    }
    attemptAutoLogin();
  }, []);

  async function register() {
    try{
      const response = await sendPOST(
        registerURL,
        JSON.stringify({
          username: username,
          password: password
        })
      );
      const data = response.json();
      setStatus(data.message);
      if(response.ok){
        setToken(data.token);
        setCookie("token", data.token, 7);
      }
    }catch(err){
      console.error('Login faled', err);
    }
  }

  async function login() {
    try{
      const response = await sendPOST(
        loginURL,
        JSON.stringify({
          username: username,
          password: password,
          stayLoggedIn: stayLoggedIn
        })
      );
      const data = await response.json();
      setStatus(data.message);
      if(response.ok){
        setToken(data.token);
        setCookie("token", data.token, 7);
      }
    }catch(err){
      console.error('Login faled', err);
    }
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  async function logout() {
    try{
      const response = await sendPOST(logoutURL, {});
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

  async function protectedPath() {
    try{
      const response = await sendGET(protectedURL);
      const data = await response.json();
      setStatus(data.message);
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
