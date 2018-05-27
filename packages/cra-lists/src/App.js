import React, {Component} from "react";
import GrainList from "./components/GrainList";

class App extends Component {
  render() {
    return (
      <div className="flex-grow-1 flex flex-column sans-serif bg-black-05">
        <header className="tc bg-black white pa3">
          <div className="f1">CRA List Prototype</div>
        </header>
        <main className="flex-grow-1 bg-white center w-100 mw7 pa3">
          <GrainList />
        </main>
      </div>
    );
  }
}

export default App;
