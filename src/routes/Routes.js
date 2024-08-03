import React from 'react';

import IndexDeezer from '../components/Deezer/IndexDeezer';
import Callback from '../components/Deezer/Callback';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginButton from '../components/Deezer/LoginButton';


export default function DefineRoutes() {
    return (
      <Router>
        <Routes>
            <Route path="/" element={<IndexDeezer/>}></Route>
            <Route path="/callback" element={<Callback />} />
        </Routes>
      </Router>
    );
  }