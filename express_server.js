
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");
app.use(morgan('dev'));
const bodyParser = require("body-parser");
const { response } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieparser = require("cookie-parser");
app.use(cookieparser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);    //uername set and defied in tamplate
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);  // Log the POST request body to the console
  // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];// const longURL = ...
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//editing 
app.get("/urls/:shortURL/edit", (req, res) =>{
  const templateVars = {
    username: req.cookies["username"], // ... any other vars
  }; 
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
   //console.log("here:") 
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const inputUsername = req.body.username;
  res.cookie('username', inputUsername);
  res.redirect('/urls');
});

app.post('/login', (req,res) =>{
const templateVars = {
  username: req.cookies["username"], // ... any other vars
}; 
                                   //username is set and defined
res.render("urls_index", templateVars);
});

app.post('/logout', (req,res) =>{
res.clearCookie("username") //clearsthe username logout point
res.redirect('/urls');      //return to /urls
});

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});