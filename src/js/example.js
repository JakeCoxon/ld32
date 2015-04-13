import React from "react";

import "../css/example.less"

const circle = require('../images/circle.svg');

const Example = React.createClass({
    render() {
        return (
            <img src={circle} />
        );
    }
});


export default Example;