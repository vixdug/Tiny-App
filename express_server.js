var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.use(function(req, res, next){
  res.locals.user_id = req.cookies.user_id;
  res.locals.user = users[req.cookies.user_id]
  next();
});

app.set("view engine", "ejs")


function generateRandomString() {
var result = Math.random().toString(36).substr(2, 6)
return result
}
 
function authenticate(email, password) {
  for (let user_id in users) {
    let user = users[user_id];

    if (email === user.email) {
      if (password === user.password) {
        return user_id;
      } else {
        // found email but password didn't match
        return null;
      }
    }
  }
  // didn't find user for that email
  return null;
}


// {errorFeedback: 'failed to find a user'} you can put this in the login.

var urlDatabase = {
};

var users = {

  }



const whitelist = ['/urls/login', '/urls/401', '/register'];


app.use((req, res, next) => {
  console.log(req.url);
  if (req.cookies['user_id'] || whitelist.includes(req.url)) {
    next();
  } else {
    res.render("urls_401")
  }
});

app.get("/", (req, res) => {
  let username = {username: req.cookies["user_id"]};
  console.log(req.params.username);
  console.log(username);
  res.render("urls_root", username);
});

app.get("/urls/401", (req, res) => {
  let username = {username: req.cookies["user_id"]}
  res.render("urls_401", username);
});

app.get("/register", (req, res) => {
  let username = {username: req.cookies["user_id"]}
  res.render("urls_register", username);
});

app.post("/register", (req, res) => {
  let email = req.body["email"];
  let password = req.body["password"];
  let id = generateRandomString();
  for(let i in users) {
    if (users[i]["email"] === email && users[i]["password"] === password)
      res.redirect("400", {errorFeedback: 'User already found.'});
      return users
    }
    if (email === "" && password === "") {
      res.redirect("400");
    } else {

  users[id] = {
    id,
    email,
    password
  }
  res.cookie("user_id", id)
  res.redirect(302,"/urls/");
  }
});

app.post("/urls/login", (req, res) => {
  let email = req.body['email'];
  let password = req.body['password'];

  let user_id = authenticate(email,password)

  if (user_id) {
      res.cookie("user_id", user_id);
      res.redirect("/urls");
    }
    else {
      res.send(403, "<html><body>Wrong email or password</body></html>\n");
      // res.status(status).send(body)
      res.end();
    }
  });


app.get("/urls/login", (req, res) => {
let username = {username: req.cookies["user_id"]};
  res.render("urls_root",username); //copy templatevars idea to get username there.
});

app.get("/urls/new", (req, res) => {
  let username= {username: req.cookies["user_id"]}
  res.render("urls_new",username); //copy templatevars idea to get username there.
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id],  username: req.cookies["user_id"] };
  res.render("urls_show", templateVars);

});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["user_id"], urls: urlDatabase };
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
  username= req.cookies["user_id"]
  res.clearCookie("user_id", username);
  res.redirect(302,"http://localhost:8080/");
});

app.post("/urls/create", (req, res) => {
  let longURL = req.body["longURL"];
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
