import React from "react";

const StateContext = React.createContext({
  list: [],
  load: () => {}
});

export const StateConsumer = StateContext.Consumer;

export function withState(Base) {
  return function WithState(props) {
    return (
      <StateConsumer>
        {stateProps => {
          return <Base {...props} {...stateProps} />;
        }}
      </StateConsumer>
    );
  };
}

export class StateProvider extends React.Component {
  constructor(props) {
    super(props);

    this.load = () => {
      this.setState(state => ({
        list: [{ _id: 1 }]
      }));
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      list: [],
      load: this.load
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
