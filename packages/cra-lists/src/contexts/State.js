import React from "react";
import * as R from "ramda";
import createPouchDB from "../models/pouch-db";
import * as G from "../models/grain";

const StateContext = React.createContext({
  list: [],
  load: () => {}
});

export const StateConsumer = StateContext.Consumer;

export function withState(Base) {
  return function WithState({ children, ...rest }) {
    return (
      <StateConsumer>
        {stateProps => {
          return (
            <Base {...rest} {...stateProps}>
              {children}
            </Base>
          );
        }}
      </StateConsumer>
    );
  };
}

export class StateProvider extends React.Component {
  constructor(props) {
    super(props);

    const listPDB = createPouchDB("tmp");

    this.load = async () => {
      const docs = await listPDB.fetchDocsDescending();

      this.setState(state => ({
        list: docs
      }));
    };

    const addNew = async () => {
      const doc = await listPDB.insert(G.createNew({ text: "Get Milk !!" }));

      this.setState(state => ({
        list: R.prepend(doc, state.list)
      }));
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      list: [],
      load: this.load,
      addNew
    };
  }

  componentDidMount() {
    this.state.load();
  }

  render() {
    return (
      <StateContext.Provider value={this.state}>
        {this.props.children}
      </StateContext.Provider>
    );
  }
}
