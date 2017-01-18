var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")


function generateRandomString() {
var result = Math.random().toString(36).substr(2, 6)
return result
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);

});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
let longURL = urlDatabase[req.params.shortURL]; // ADD: if longURL = null - go to 401
console.log(urlDatabase); // ADD: needs to check for http and if not add it
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
delete urlDatabase[req.params.id]
res.redirect(302,"http://localhost:8080/urls/");
}); // deleted + redirect

app.post("/urls/create", (req, res) => {
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
  console.log(longURL);
  console.log(shortURL);
  urlDatabase[shortURL] = longURL
 console.log(urlDatabase);

  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
