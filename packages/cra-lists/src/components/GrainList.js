import React, {Component} from "react";
import * as G from "../models/grain";
import PT from "prop-types";

const R = require("ramda");
const RA = require("ramda-adjunct");

class GrainItem extends Component {
  render() {
    return <div>{G.getId(this.props.grain)}</div>;
  }
}

GrainItem.propTypes = {
  grain: PT.object.isRequired
};

class GrainList extends Component {
  render() {
    return R.map(grain => <GrainItem key={G.getId(grain)} grain={grain} />)(
      R.map(_id => ({ _id }))([1, 2, 3])
    );
  }
}

export default GrainList;
