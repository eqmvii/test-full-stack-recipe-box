// *** Boilerplate to include for the server
const express = require('express')
const app = express()

// grab heroku port, or deploy normally, depending 
const port = process.env.PORT || 3001;

// database stuff
const { Client } = require('pg')
//var pg = require('pg');

if (!process.env.PORT) {
    var client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'password',
        port: 5432,
    });
    client.connect();
    // console.log("########## loaded local pg client ########## ");
}

else {
    // console.log("########## loaded -REMOTE HEROKU- pg client ########## ");
    var client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    client.connect();

    // test the connection 
    client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            // console.log(JSON.stringify(row));
        }
        //client.end();
    });

    // test read of the database
    client.query('SELECT * FROM recipes;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            // console.log(JSON.stringify(row));
        }
        //client.end();
    });



}



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




// end database stuff

// express looks up files relative to the static directory, so it doesn't become part of the url
// this is a middleware function
app.use(express.static('public'))

// middleware function to log for the sake of logging
var myLogger = function (req, res, next) {
    // console.log('LOGGED')
    next()
}

// preps myLogger to be used as middleware  
// Location of this is extremely important! Loaded first, executed first, and must compe before relevant routes
app.use(myLogger)

// middleware that adds the current time to the request object
// That request object, with its new property, will be passed to all other middlewear/routes 
var requestTime = function (req, res, next) {
    req.requestTime = new Date(Date.now())
    next()
}


app.use(requestTime)

app.get('/', function (req, res) {
    // Show the key/value pairs for all of the queries in the URL string to the user
    var the_queries = "<br /><p>Here are the queries in your URL:</p><p><ul>";
    for (var query in req.query) {
        the_queries += "<li>"
        the_queries += query;
        the_queries += ": ";
        the_queries += req.query[query];
        the_queries += "</li>";
    }
    the_queries += "</ul></p>"
    var try_queries = "<p>Try using queries! For example, http://localhost:3000/?height=tall&name=robert&age=30</p>"
    res.send('<h2>Hello World!</h2><p>Request came at ' + req.requestTime.toLocaleTimeString() + " (local time).</p><p>You came from IP " + req.ip + " via a " + req.method + " method over " + req.protocol + ".</p>" + try_queries + "<br />" + the_queries)
})

// api route to test integration with frontend
app.get('/api', function (req, res) {
    // And insert something like this instead:
    res.json([{
        id: 1,
        username: "SampleUserName1"
    }, {
        id: 2,
        username: "SecondSampleUserVonName"
    }]);
})

// route for recipe data
// api route to test integration with frontend
app.get('/recipes', function (req, res) {
    // And insert something like this instead:
    res.json(
        [
            {
                name: "API Success and Beans",
                ingr: ["Rice", "Beans", "This loaded from your express server"],
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
        ]
    );
})

// route for recipe data from the DB
// api route to test integration with frontend
app.get('/recipesSQL', function (req, res) {
    // And insert something like this instead:
    // just removed public.recipes to test
    client.query('SELECT * FROM recipes;', (err, data) => {
        var recipe_list = [];
        for (let i = 0; i < data.rows.length; i++) {
            let new_recipe = {};
            new_recipe.name = data.rows[i].name;
            new_recipe.ingr = listify(data.rows[i].ingr);
            new_recipe.edit = false;
            recipe_list.push(new_recipe);
            //console.log(new_recipe);
        }
        //client.end();
        // console.log("Sending back the recipe list!");
        // console.log(recipe_list);
        res.json(recipe_list);
    })

})

// route for recipe data from the DB
// api route to test integration with frontend
// This is hacky and... suboptimal
app.post('/recipesSQL', function (req, res) {
    // console.log("POST API endpoint hit!");
    //console.log(req);

    // node.js boiilterplate for handling a body stream from the PUT request
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        // at this point, `body` has the entire request body stored in it as a string
        // console.log("Body is: " + body);

        // clear the old table      
        client.query('DELETE FROM recipes', (err, data) => {
            //console.log("I just deleted the recipes table, sorry.");
        });

        // access the resulting body JSON
        var payload = JSON.parse(body);
        //console.log("Payload parsed. First recipe: " + payload[0].name);


        // loop through that JSON and persist the data freshly to a new table
        for (let i = 0; i < payload.length; i++) {
            let query_string = "INSERT INTO recipes (name, ingr) VALUES ($1, $2)";
            let query_values = [payload[i].name, listToString(payload[i].ingr)];
            /*query_string += payload[i].name;
            query_string += "', '";
            query_string += listToString(payload[i].ingr);
            query_string += "')";*/


            // INSERT INTO recipes (name, ingr) VALUES ('Good morning', 'Have a great day, I love you, drive safe, see you tonight, made you a sandwich');

            // console.log(query_string);

            client.query(query_string, query_values, (err, data) => {
                //console.log(err);
            });
        }

        res.json("ok all is good thank you");
    });

});

// Add recipe endpoint, for when a new recipe is submitted (CREATE)
app.post('/addrecipe', function (req, res) {
    // console.log("Add recipe API endpoint hit!");
    // node.js boiilterplate for handling a body stream from the PUT request
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        // at this point, `body` has the entire request body stored in it as a string
        // console.log("Body is: " + body);

        // access the resulting body JSON
        var payload = JSON.parse(body);
        // console.log("Payload is: ");
        // console.log(payload); 

        let query_string = "INSERT INTO recipes (name, ingr) VALUES ($1, $2)";
        let query_values = [payload.name, listToString(payload.ingr)];

        /*let query_string = "INSERT INTO recipes (name, ingr) VALUES ('";
        query_string += payload.name;
        query_string += "', '";
        query_string += listToString(payload.ingr);
        query_string += "')";*/

        // console.log(query_string);
        client.query(query_string, query_values, (err, data) => {
            //console.log(err);
            //console.log("Data:");
            // console.log(data);
        });       

        res.json("ok all is good thank you");
    });
});

app.get('/ab*cd', function (req, res) {
    res.send('Hello World! Also you followed the ab*cd pattern. Cool!')
})

// Example of route parameters
app.get('/users/:userId/books/:bookId', function (req, res) {
    res.send(req.params)
    /*
    Route path: /users/:userId/books/:bookId
    Request URL: http://localhost:3000/users/34/books/8989
    req.params: { "userId": "34", "bookId": "8989" }
    */
})



// Using next and multiple callback functions
app.get('/example/b', function (req, res, next) {
    // console.log('the response will be sent by the next function ...')
    next()
}, function (req, res) {
    res.send('Hello from B!')
})


app.get('/chicken', function (req, res) {
    res.send('Hello chicken!')
})

/*
Response methods:
download, end, json, jsonp, redirect, render, send, sendFile, sendStatus
*/

// app.route() can be used to handle multiple methods on the same route 
app.route('/book')
    .get(function (req, res) {
        res.send('Get a random book')
    })
    .post(function (req, res) {
        res.send('Add a book')
    })
    .put(function (req, res) {
        res.send('Update the book')
    })

// *** Start up the server:
app.listen(port, function () {
    console.log('App up and listening on port ' + port + '!')
})