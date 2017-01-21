var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.use(function(req, res, next){
  // res.locals.user_id = req.cookies.user_id;
  res.locals.user = users[req.cookies.user_id]
  next();
});

app.set("view engine", "ejs")


function generateRandomString() {
  var result = Math.random().toString(36).substr(2, 6)
  return result
}

app.use('/urls/:id/:action?', (req, res, next) => {
  const url = urlDatabase[req.params.id];
  if (url && req.cookies.user_id !== url.user_id) {
    res.status(403).send('You do not have permission to edit this');
    return;
  }
  next();
});

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

function emailIsTaken(email) {
  let taken = false ;
  for (let id in users) {
    if (users[id].email === email) {
      taken = true;
    }
  }
  return taken;
};

// {errorFeedback: 'failed to find a user'} you can put this in the login.

var urlDatabase = {
};

var users = {

  }



const whitelist = ['/urls/login', '/401', '/register'];

// could also add /urls*? to it so user lands on logn first
app.use((req, res, next) => {
  console.log(req.method, req.url);
  if (req.cookies['user_id'] || whitelist.includes(req.url)) {
    next();
  } else {
    res.status(401).render("urls_401");
  }
});

app.get("/", (req, res) => {
  let username = {username: req.cookies["user_id"]};
  console.log(req.params.username);
  console.log(username);
  res.render("urls_root", username);
});

app.get("/401", (req, res) => {
  let username = {username: req.cookies["user_id"]}
  res.status(401).render("urls_401");
});

app.get("/register", (req, res) => {
  let username = {username: req.cookies["user_id"]}
  res.render("urls_register", username);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.status(400);
    res.send("no email");
    return;
  }
  if (emailIsTaken(email)) {
    res.status(400);
    res.send("email is taken");
    return;
  }
  const id = generateRandomString();
    users[id] = {
      id,
      email,
      password
    }
    res.cookie("user_id", id)
    res.redirect(302,"/urls/");
  })


// app.post("/register", (req, res) => {


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

// followed along with DV lecture to refactor this.
app.get("/urls/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (url) {
    let templateVars = {
      shortURL: req.params.id, longURL: url, username: req.cookies["user_id"]
    };
    res.render("urls_show", templateVars);
  } else { // then send you are not owner then do another ELSE with the below statement
    res.status(404).send('short URL does not exist')
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["user_id"], urls: urlDatabase, shortURL: req.params.id  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL; // ADD: if longURL = null - go to 401
  console.log(urlDatabase); // ADD: needs to check for http and if not add it
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect(302,"http://localhost:8080/urls/");
}); // deleted + redirect

app.post("/urls/:id/edit", (req, res) => {
  let newLongURL = req.body.newLongURL
  urlDatabase[req.params.id].longURL = newLongURL
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
  urlDatabase[shortURL]= {
    longURL,
    user_id: res.locals.user.id,
  }
  console.log(urlDatabase);
  res.redirect(302,`http://localhost:8080/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
