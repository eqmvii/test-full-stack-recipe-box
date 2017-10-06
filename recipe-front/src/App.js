import React from 'react';

// debug mode console logging
// var dbm = true;

// Turns a string of ingredients into an array of ingredients
function listify(stringData) {
  var arrayed = stringData.split(", ");
  // dbm ? console.log("Arrayed: ") : null;
  // console.log(arrayed);
  return (arrayed);
  //var res = str.split(" ");
  //return ["test"];
}

// Turns an array of ingredients into a list of ingredients
function listToString(arrayData) {
  return arrayData.join(', ');
}


// App's title
class TitleBox extends React.Component {
  render() {
    return <h2 className="text-center"><strong>{this.props.title}</strong></h2>;
  }
}


// Dynamic data fetching button proof of principle
class HTTPTestButton extends React.Component {
  constructor(props) {
    super(props);
    // bind handle functions
    this.handleChange = this.handleChange.bind(this);
    this.state = { users: [] }
  }

  handleChange(event) {
    fetch('/api')
      .then(res => res.json())
      .then(users => this.setState({ users }))
      .then(() => console.log(this.state));
  }

  render() {
    // if no users yet
    if (this.state.users.length === 0) {
      return <button className="btn btn-primary" onClick={this.handleChange}>Server Request Test!</button>
    }
    // if not
    return <button className="btn btn-primary" onClick={this.handleChange}>{this.state.users[1].username}</button>

  }
}



// Button to clear local browser history/cookies
class MemoryClearingButton extends React.Component {
  handleChange(event) {
    // console.log("Memory clearing button was clicked!");
    localStorage.removeItem("recipeData");
    location.reload();
  }

  render() {
    return (
      <button className="btn btn-danger" onClick={this.handleChange}>Clear Recipe Memory & Reload</button>
    );
  }
}

// Table of recipes, ingredients, and edit/delete buttons
class RecipeTable extends React.Component {
  render() {
    var rows = [];
    var builtRow = "";
    var recipes = this.props.data;
    // build the rows from the data
    for (let a = 0; a < recipes.length; a++) {
      // console.log("Woah!");
      // See if row is editable
      if (!recipes[a].edit) {
        builtRow = (
          <tr key={a}>

            <td className="text-center">
              {recipes[a].name}
            </td>

            <td>
              <ul>
                {recipes[a].ingr.map(ingredient => <li key={ingredient}>{ingredient}</li>)}
              </ul>
            </td>

            <td className="text-center">
              <button
                type="button"
                className="btn btn-danger"
                onClick={this.props.handleChange}
                id={"d" + a}
              >
                Delete
            </button>
              &nbsp;
            <button
                type="button"
                className="btn btn-primary"
                onClick={this.props.handleChange}
                id={"e" + a}
              >
                Edit
            </button>
            </td>

          </tr>
        );
      }
      // If the row has the editable flag, replace display with text boxes to edit data    
      else {
        builtRow = (<tr key={a}>
          <td>
            <p className="text-center">Edit name:</p>
            <input
              type="text"
              className="form-control"
              id={"q" + a}
              onChange={this.props.handleChange}
              value={recipes[a].name}
            />
          </td>
          <td><p className="text-center">Edit ingredients (use commas):</p>
            <input
              type="text"
              className="form-control"
              id={"z" + a}
              onChange={this.props.handleChange}
              value={listToString(recipes[a].ingr)}
            /></td>
          <td className="text-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.props.handleChange}
              id={"e" + a}
            >
              Submit edit
            </button>
          </td>
        </tr>);

      }

      // either way, push builtRow for later display
      rows.push(builtRow);
    }
    return (
      <table className="table table-bordered table-hover">
        <tbody>
          <tr className="text-center">
            <td><strong>Recipe</strong></td>
            <td><strong>Ingredients</strong></td>
            <td><strong>Modify</strong></td>
          </tr>
          {rows}
        </tbody>
      </table>
    );
  }
}

// For later: figure out bootstrap form CSS, because of course it doesn't work exactly right
class AddNewRecipeBox extends React.Component {
  render() {
    return (
      <div>
        <h3>Add a recipe to the box</h3>
        <br />
        <form onSubmit={this.props.handleSubmit}>
          <div className="form-group">
            <label htmlFor="rname" className="col-sm-8 control-label">Recipe Name:</label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                id="rname"
                onChange={this.props.handleChange}
                value={this.props.rname}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="ingr" className="col-sm-8 control-label">Ingredients (separate multiple ingredients with a comma)</label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                id="ingr"
                onChange={this.props.handleChange}
                value={this.props.ingr}
              />
            </div>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
        <br />

      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    // bind handle functions
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    // initial state is seeded from hard coded data if all else fails
    this.state = { data: [], rname: "", ingr: "", persist: false };

    // get recipe data from the server asynchronously, state will refresh when it lands
    fetch('/recipesSQL')
      .then(res => res.json())
      .then(res => { console.log(res); this.setState({ data: res }) })
    //.then(() => console.log(this.state));


  }

  handleSubmit(event) {
    event.preventDefault();
    // console.log("Submit pressed!");

    var oldList = this.state.data;
    //console.log("OldList: " + oldList[0]);
    // transform the ingredients list into an array
    var listo = listify(this.state.ingr);
    //console.log(listo);
    oldList.push({ name: this.state.rname, ingr: listo, edit: false });
    //console.log("OldList: " + oldList[3].name);
    this.setState({ data: oldList, rname: "", ingr: "", persist: true });
    // alert("submit button pressed");
  }

  handleChange(event) {
    var targetIndex, oldList;
    // Decide what to do based on the id of what was clicked.
    // event.preventDefault();
    // console.log("Handle Change was called!");
    // console.log("rname is: " + event.target.value + ". ID is: " + event.target.id);
    // console.log(event.target.id + " was the event's id");
    // If the event is entering a new recipe
    if (event.target.id === "rname") {
      this.setState({ rname: event.target.value });
    }
    if (event.target.id === "ingr") {
      this.setState({ ingr: event.target.value });
    }


    // If the event is typing edits to a recipe name:
    if (event.target.id[0] === "q") {
      targetIndex = parseInt(event.target.id[1], 10);
      // console.log("Recipe #" + (targetIndex +1) + " is being edited!");
      oldList = this.state.data.slice();
      oldList[targetIndex].name = event.target.value;
      this.setState({ data: oldList });
    }

    // If the event is typing edits to a recipe ingredient list:
    if (event.target.id[0] === "z") {
      targetIndex = parseInt(event.target.id[1], 10);
      // console.log("Recipe #" + (targetIndex +1) + " is being edited!");
      oldList = this.state.data.slice();
      oldList[targetIndex].ingr = listify(event.target.value);
      this.setState({ data: oldList });
    }

    // if the change was a delete request
    if (event.target.id[0] === "d") {
      targetIndex = parseInt(event.target.id[1], 10);
      oldList = this.state.data.slice();
      // console.log("Current list: ");
      // console.log(this.state.data);
      oldList.splice(targetIndex, 1);
      // console.log("New list: ");
      // console.log(oldList);
      this.setState({ data: oldList, persist: true });
      //this.setState({data: {}})
    }
    // if the change was an edit request (submit or start)
    if (event.target.id[0] === "e") {
      targetIndex = parseInt(event.target.id[1], 10);
      // copy old state
      oldList = this.state.data.slice();
      // toggle editable flag
      oldList[targetIndex].edit = !oldList[targetIndex].edit;
      // save new state
      this.setState({ data: oldList, persist: true });

    }
  }

  render() {
    return (
      <div>
        <br />
        <TitleBox title="Recipe Box" />
        <h5 className="text-center">A React app</h5>
        <br />
        <p className="text-center">Add, edit, or delete recipes. Recipes should persist in browser local storage (cookies).</p>
        <br />
        <RecipeTable data={this.state.data} handleChange={this.handleChange} />
        <AddNewRecipeBox
          rname={this.state.rname}
          ingr={this.state.ingr}
          handleSubmit={this.handleSubmit}
          handleChange={this.handleChange}
        />
        <br />
        <div className="text-center">
          <MemoryClearingButton className="text-center" />
          <br />
          <br />
          <HTTPTestButton />
        </div>
      </div>
    );
  }

  // After any updates, persist data (browser, backend, whatever)
  componentDidUpdate() {
    //console.log("Hello! My state change, and so I updated!");
    // Check for localStorage object availibility, persist data if it exists
    if (typeof (Storage) !== "undefined") {
      localStorage.recipeData = JSON.stringify(this.state.data);
    }

    if (this.state.persist) {
      // persist to the database 
      fetch('/recipesSQL', { method: "POST", body: JSON.stringify(this.state.data) })
        .then(res => { res.json(); console.log(res); });
        this.setState({persist: false});
    }



  }
}

// make the app component available to the main app
export default App;
