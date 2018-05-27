import React, {Component} from "react";

const R = require('ramda')
const RA = require('ramda-adjunct')

class GrainItem extends Component{
  render() {
    return (
      <div>{this.props.id}</div>
    );
  }
}

class GrainList extends Component {
  render() {
    return (
      R.map(
        grain => <GrainItem key={grain.id} id={grain.id}/>
      )(R.map(id=>({id}))([1,2,3]))
    );
  }
}

export default GrainList;
