import React, {Component} from "react";
import * as G from "../models/grain";
import PT from "prop-types";
import {withState} from "../contexts/State";

const R = require("ramda");

class GrainItem extends Component {
  render() {
    return <div>{G.getId(this.props.grain)}</div>;
  }
}

GrainItem.propTypes = {
  grain: PT.object.isRequired
};

function createGrainItem(grain) {
  return <GrainItem key={G.getId(grain)} grain={grain} />;
}

class GrainList extends Component {
  render() {
    return R.map(createGrainItem)(this.props.list);
  }
}

export default withState(GrainList);
