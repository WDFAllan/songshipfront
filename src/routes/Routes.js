import React from 'react';

import MainPage from '../components/MainPage';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CallbackDeezer from '../components/Deezer/CallbackDeezer';
import CallbackSpotify from '../components/Spotify/CallbackSpotify';



export default function DefineRoutes() {
    return (
      <Router>
        <Routes>
            <Route path="/" element={<MainPage/>}></Route>
            <Route path="/callbackDeezer" element={<CallbackDeezer />} />
            <Route path="/callbackSpotify" element={<CallbackSpotify/>} />
        </Routes>
      </Router>
    );
  }