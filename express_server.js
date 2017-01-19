var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs")


function generateRandomString() {
var result = Math.random().toString(36).substr(2, 6)
return result
}

var urlDatabase = {
};

const whitelist = ['/urls/login', '/urls/404'];


app.use((req, res, next) => {
  console.log(req.url);
  if (req.cookies.username || whitelist.includes(req.url)) {
    next();
  } else {
    res.render("urls_401")
  }
});

app.get("/", (req, res) => {
  let username = {username: req.cookies["username"]};
  console.log(req.params.username);
  console.log(username);
  res.render("urls_root", username);
});

app.get("/urls/401", (req, res) => {
  let username = {username: req.cookies["username"]}
  res.render("urls_401", username);
});

app.post("/urls/login", (req, res) => {
  let username = req.body["username"];
  res.cookie("username", username)
  res.redirect(302,"http://localhost:8080/urls/");
});

app.get("/urls/login", (req, res) => {
let username = {username: req.cookies["username"]};
  res.render("urls_root",username); //copy templatevars idea to get username there.
});

app.get("/urls/new", (req, res) => {
  let username= {username: req.cookies["username"]}
  res.render("urls_new",username); //copy templatevars idea to get username there.
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id],  username: req.cookies["username"] };
  res.render("urls_show", templateVars);

});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
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

app.post("/urls/:id/edit", (req, res) => {
  let newLongURL = req.body.newLongURL
  urlDatabase[req.params.id] = newLongURL
  res.redirect(302,`http://localhost:8080/urls/${req.params.id}`);
  });

  app.post("/logout", (req, res) => {
  username= req.cookies["username"]
  res.clearCookie("username", username);
  res.redirect(302,"http://localhost:8080/");
});




app.post("/urls/create", (req, res) => {
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
  // console.log(longURL);
  // console.log(shortURL);
  urlDatabase[shortURL] = longURL
 // console.log(urlDatabase);
  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
