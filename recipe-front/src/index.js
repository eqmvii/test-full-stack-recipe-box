import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// debug console log messages toggle
// var dbm = true;

// Base data to use on first load to show the idea of the app
var recipeData = [
  {
    name: "Rice and Beans",
    ingr: ["Rice", "Beans"],
    edit: false
  },
  {
    name: "Mediocre Spaghetti",
    ingr: ["Spaghetti", "Sauce from a jar", "Frozen meatballs"],
    edit: false
  },
  {
    name: "Salad",
    ingr: ["Lettuce", "Tomatoes", "Salad dressing"],
    edit: false
  }
];

// clear local storage to start fresh testing:
// localStorage.removeItem("recipeData");
 // comment out above line to persist data always; otherwise use memory clearing button component

// Prep cookie-based recipe storage:
if (typeof(Storage) !== "undefined") {
  if(localStorage.recipeData != null){
    // dbm ? console.log("Local storage object already exists!") : null;
    // localStorage.removeItem("recipeData");
  }
  else {
    // dbm? console.log("Creating local storage...") : null;
    // stringify and store the object
    localStorage.recipeData = JSON.stringify(recipeData);
  }
  // dbm ? console.log("rendering app from local storage...") : null;


  // Render based on local storage after parsing it
  ReactDOM.render(<App data={JSON.parse(localStorage.recipeData)} />, document.getElementById("root"));
} else {
  // Sorry! No Web Storage support..
  // dbm ? console.log("No browser support, loading dumy data!") : null;
  // render with dummy data
  ReactDOM.render(<App data={recipeData} />, document.getElementById("root"));
}


