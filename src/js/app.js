import React from "react";
import Example from "./example.js"

var App = React.createClass({
    render() {
        return (
            <div>
                <h1>Really cool react class</h1>
            </div>
        );
    }
});

function render() {
    React.render(
        <App />,
        document.getElementById('content'));
}

render();
