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
    return <h1 className="text-center"><strong><span className="glyphicon glyphicon-cutlery" aria-hidden="true"></span> {this.props.title} <span className="glyphicon glyphicon-cutlery" aria-hidden="true"></span></strong></h1>;
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
      // For key values, use index + ingredient
      if (!recipes[a].edit) {
        builtRow = (
          <tr key={recipes[a].name + a}>

            <td className="text-center">
              {recipes[a].name}
            </td>

            <td>
              <ul>                
                {recipes[a].ingr.map((ingredient, index) => <li key={ingredient + index}>{ingredient}</li>)}
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
              maxLength="30"
            />
          </td>
          <td><p className="text-center">Edit ingredients (separate with commas):</p>
            <input
              type="text"
              className="form-control"
              id={"z" + a}
              onChange={this.props.handleChange}
              value={listToString(recipes[a].ingr)}
              maxLength="50"
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
        <br />
        <br />
        <h3>Add a recipe to the box</h3>
        <br />
        <form onSubmit={this.props.handleSubmit}>

          <label htmlFor="rname" className="control-label">Recipe Name:</label>
          <div >
            <input
              type="text"
              className="form-control"
              id="rname"
              onChange={this.props.handleChange}
              value={this.props.rname}
              maxLength="30"
            />
            <br />
          </div>


          <div className="form-group">
            <label htmlFor="ingr" className="control-label">Ingredients (separate multiple ingredients with a comma)</label>
            <div >
              <input
                type="text"
                className="form-control"
                id="ingr"
                onChange={this.props.handleChange}
                value={this.props.ingr}
                maxLength="50"
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
    this.state = { data: [], rname: "", ingr: "", persist: false, editmode: false, refreshInterval: 1000 };

    // get recipe data from the server asynchronously, state will refresh when it lands
    fetch('/recipesSQL')
      .then(res => res.json())
      .then(res => { this.setState({ data: res }) })
    //.then(() => console.log(this.state));

  }

  componentDidMount() {
    // set an automatic update fetcher
    this.timerID = setInterval(() => this.tick(), this.state.refreshInterval);
  }

  tick() {
    // console.log("Tick...");
    // get recipe data from the server asynchronously, state will refresh when it lands
    fetch('/recipesSQL')
      .then(res => res.json())
      .then(res => { this.setState({ data: res }) })
  }

  toggleInterval() {
    if (this.timerID) {
      window.clearInterval(this.timerID);
      this.timerID = null;
    }
    else {
      this.timerID = setInterval(() => this.tick(), this.state.refreshInterval);
    }
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
    this.setState({ data: oldList, rname: "", ingr: "" });
    // alert("submit button pressed");
    // prepare the data to send to the server
    var new_recipe = {};
    new_recipe.name = this.state.rname;
    new_recipe.ingr = listo;
    // Send data to the server:
    fetch('/addrecipe', { method: "POST", body: JSON.stringify(new_recipe) })
      .then(res => { res.json(); });
  }

  // Decide what to do based on the id of what was clicked.
  handleChange(event) {
    var targetIndex, oldList;

    // If the event is typing into the new recipe input fields
    if (event.target.id === "rname") {
      this.setState({ rname: event.target.value });
    }
    if (event.target.id === "ingr") {
      this.setState({ ingr: event.target.value });
    }

    // If the event is typing edits to a recipe name:
    if (event.target.id[0] === "q") {
      targetIndex = parseInt(event.target.id[1], 10);
      oldList = this.state.data.slice();
      oldList[targetIndex].name = event.target.value;
      this.setState({ data: oldList });
    }

    // If the event is typing edits to a recipe ingredient list:
    if (event.target.id[0] === "z") {
      targetIndex = parseInt(event.target.id[1], 10);
      oldList = this.state.data.slice();
      oldList[targetIndex].ingr = listify(event.target.value);
      this.setState({ data: oldList });
    }

    // if the change was a delete request
    if (event.target.id[0] === "d") {
      targetIndex = parseInt(event.target.id[1], 10);
      oldList = this.state.data.slice();
      oldList.splice(targetIndex, 1);
      this.setState({ data: oldList, persist: true });
    }
    // if the change was an edit request (submit OR start)
    if (event.target.id[0] === "e") {
      // turn off auto-updates, if not already off
      if (this.timerID) {
        window.clearInterval(this.timerID);
        this.timerID = null;
      }

      // Which row's button was clicked?    
      targetIndex = parseInt(event.target.id[1], 10);
      // Is it already editable?
      var am_editing = this.state.data[targetIndex].edit;
      // console.log("Editing status: " + am_editing);

      // If I am editing, and I pressed submit, submit all open edits at once to avoid bugs
      if (am_editing) {
        this.toggleInterval();
        // copy old state
        oldList = this.state.data.slice();
        // Make all rows not editing
        for (let i = 0; i < oldList.length; i++) {
          oldList[i].edit = false;
        }
        // save new state
        this.setState({ data: oldList, persist: true });
      }

      // If I wasn't yet editing:
      else {
        // copy old state
        oldList = this.state.data.slice();
        // toggle this row's editable flag
        oldList[targetIndex].edit = !oldList[targetIndex].edit;
        // save new state
        this.setState({ data: oldList, persist: true });
      }

    }
  }

  render() {
    return (
      <div id="fullapp">
        <br />
        <TitleBox title="Recipe Box" />
        <h4 className="text-center">A React app</h4>
        <br />
        <p className="text-center">Add, edit, or delete recipes. Recipes persist in a ~cloud database~ on Heroku.</p><p className="text-center">New recipes added by other users will appear automatically.</p>

        <div className="alert alert-warning text-center">
  <strong>Warning!</strong> Simultaneous users, particularly using the edit feature, can lead to unexpected results.
</div>
<br />
        <RecipeTable data={this.state.data} handleChange={this.handleChange} />
        <div className="text-center"><AddNewRecipeBox
          rname={this.state.rname}
          ingr={this.state.ingr}
          handleSubmit={this.handleSubmit}
          handleChange={this.handleChange}
        /></div>
        <br />
      </div>
    );
  }

  // After any updates, persist data (browser, backend, whatever)
  componentDidUpdate() {
    if (this.state.persist) {
      // This is ugly: it deletes the old table, then persists the entire current state
      // of the react app as the new table      
      fetch('/recipesSQL', { method: "POST", body: JSON.stringify(this.state.data) })
        .then(res => { res.json(); });
      this.setState({ persist: false });
    }



  }
  componentWillUnmount() {
    // turn off the interval
    clearInterval(this.timerID);
  }

}

// make the app component available to the main app
export default App;
