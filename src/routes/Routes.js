import React from 'react';

import MainPage from '../components/MainPage';
import Callback from '../components/Deezer/Callback';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginButton from '../components/Deezer/LoginButton';


export default function DefineRoutes() {
    return (
      <Router>
        <Routes>
            <Route path="/" element={<MainPage/>}></Route>
            <Route path="/callback" element={<Callback />} />
        </Routes>
      </Router>
    );
  }