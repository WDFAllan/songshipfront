import React from 'react';

import IndexDeezer from '../components/indexPage/IndexDeezer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


export default function DefineRoutes() {
    return (
      <Router>
        <Routes>
            <Route path="/" element={<IndexDeezer/>}></Route>
            <Route path="/deezer" element={<IndexDeezer/>}></Route>
        </Routes>
      </Router>
    );
  }