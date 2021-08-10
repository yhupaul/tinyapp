
const express = require("express");
const morgan = require("morgan");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers.js");

app.set("view engine", "ejs");
app.use(morgan('dev'));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//if user is login => /urls else =>login page
app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//make templateto pass content to urls_index
app.get("/urls", (req, res) => {
  const errorMessage = { error: "Please login first!" };
  if (!users[req.session.user_id]) {
    res.render("urls_error.ejs", errorMessage);
  } else {
    const userid = req.session.user_id;
    const urls = urlsForUser(userid, urlDatabase);
    const templateVars = { urls: urls, user: users[req.session.user_id]};
    res.render("urls_index", templateVars);
  }
});

//urls_new template in the browser
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

// make random shortURL, replace and send to urls/:shorURL
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    const errorMessage = { error: "Please, login first"}; //error message wi
    res.render("urls_error.ejs", errorMessage);
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID,
  };
  res.redirect(`/urls/${shortURL}`);
});

//using data from shortUrl, send template(content) to urls_show
app.get("/urls/:shortURL", (req, res) => {
  const errorMessage = { error: "You do not have access to this shortURL" }; //error message with newHTML
  if (!urlDatabase[req.params.shortURL]) {
    res.render("urls_error.ejs", errorMessage);
    return;
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.render("urls_error.ejs", errorMessage);
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//'/u/:shortURL shorter version of ulrs/:shortURL !!generate a link that will redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//using delete operator to remove /urls/:shortURL?delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let userid = req.session.user_id;
  if (!userid) {
    const errorMessage = { error: "this is not yours" };
    res.render("urls_error.ejs", errorMessage);
  }
  let urls = urlsForUser(userid, urlDatabase);
  for (let url in urls) {
    if (url === req.params.shortURL) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
  }
});

//editing
app.post("/urls/:shortURL", (req, res) => {
  let userid = req.session.user_id;
  if (!userid) {
    const errorMessage = { error: "this is not yours" };
    res.render("urls_error.ejs", errorMessage);
  }
  if (req.body.longURL === "") {
    const errorMessage = { error: "LongURL can not be empty" };
    res.render("urls_error.ejs", errorMessage);
  }
  let urls = urlsForUser(userid, urlDatabase);
  for (let url in urls) {
    if (url === req.params.shortURL) {
      let shortURL = req.params.shortURL;
      let longURL = req.body.longURL;
      urlDatabase[shortURL]["longURL"] = longURL;
    }
  }
  res.redirect("/urls");
});

//global object user for stroing and accessing
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//new login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("urls_login.ejs",templateVars);
});

//get /register from urls_registration
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]
    //defined username
  };
  res.render("urls_registration",templateVars);
});

app.post("/login", (req,res) =>{
  let email = req.body.email;
  let id = getUserByEmail(email, users);
  let password = req.body.password;
  
  for (const user in users) {
    if (users[user]['email'] === email) {
      if (bcrypt.compareSync(password, users[user]["password"])) {
        id = users[user]['id'];
        req.session.user_id = id;
        res.redirect('/urls');
        return;
      }
    }users[user]['password'];
  }
  const errorMessage = { error: "invaild email or password" };
  res.render("urls_error.ejs", errorMessage);
});
  
//registraion
app.post("/register", (req,res) =>{
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  //to check if there is empty userEmail or userpassord
  if (!email || !password) {
    const errorMessage = { error: "The email and password fields are blank. Please fill them in" };
    res.render("urls_error.ejs", errorMessage);
  } else {
    const user = getUserByEmail(email, users);
    if (user) {
      const errorMessage = { error: "This email is not available!" };
      res.render("urls_error.ejs", errorMessage);
    }
    const newUser = {
      id: id,
      email: email,
      password: hashedPassword
    };
    users[id] = newUser;
    req.session.user_id = id;  //user_id
    res.redirect("/urls");
  }
});

app.post('/logout', (req,res) =>{
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});