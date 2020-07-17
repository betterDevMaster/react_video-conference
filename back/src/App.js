import React from 'react'
import {
	BrowserRouter as Router,
	Switch,
	Route
} from 'react-router-dom'
import './App.css'
import Home from './views/home'
import Conference from './views/conference'
import Room from './views/room'

function App() {
	return (
		<div className="App">
			<Router>
				<Switch>
					<Route path="/login" component={Home}></Route>
					<Route path="/room" component={Room}></Route>
					<Route path="/conference" component={Conference}></Route>
					<Route path="/" component={Home}></Route>
				</Switch>
			</Router>
		</div>
	);
}

export default App;
