import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Bike from './components/Bike'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Bike/>
      </div>
    );
  }
}

export default App;
