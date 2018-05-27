import React, {Component} from "react";
import GrainList from "./components/GrainList";
import {StateProvider} from "./contexts/State";

class App extends Component {
  render() {
    return (
      <StateProvider>
        <div className="flex-grow-1 flex flex-column sans-serif bg-black-05">
          <header className="tc bg-black white pa3">
            <div className="f1">CRA List Prototype</div>
          </header>
          <main className="flex-grow-1 bg-white center w-100 mw7 pa3">
            <GrainList />
          </main>
        </div>
      </StateProvider>
    );
  }
}

export default App;
