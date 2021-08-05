
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
const e = require("express");
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

//make templateto pass content to urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  //console.log(req.cookies)
  res.render("urls_index", templateVars);
});

//urls_new template in the browser
app.get("/urls/new", (req, res) => {

   const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };

  res.render("urls_new", templateVars);
});

// make random shortURL, replace and send to urls/:shorURL 
app.post("/urls", (req, res) => {
  console.log(req.body);// Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);  
 
});

//using data from shortUrl, send template(content) to urls_show
app.get("/urls/:shortURL", (req, res) => {

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};

  res.render("urls_show", templateVars);
});

//'/u/:shortURL shorter version of ulrs/:shortURL !!generate a link that will redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//using delete operator to remove /urls/:shortURL?delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//editing 
app.post("/urls/:shortURL", (req, res) => {
   //console.log("here:") 
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// app.get("/urls/:shortURL", (req, res) =>{
//   const templateVars = {
//     user: users[req.cookies["user_id"]], // ... any other vars

//   }; 
//   res.render("urls_show", templateVars);
// });




function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

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
//users["userRandomID"]

//get /register from urls_registration
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
//defined username
  };
  console.log(req.cookies["user_id"])
  res.render("urls_registration.ejs",templateVars);
});

//reuseing the function
const getUserByemail = function(email){
  for (let user in users) {
    // console.log(users[user]["email"], email)
    if (users[user]["email"] === email) {
      return users[user];
    }
  }
};
//registraion 
app.post("/register", (req,res) =>{
  // console.log("register req.body:",req.body);
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
 //to check if there is empty userEmail or userpassord
 if (!email || !password){
  res.status(400).send("invaild email or password");  
} else {
  const user = getUserByemail(email);
  if (user){
    return res.status(400).send("your email is not available");
  }
  const newUser = {
    id: id,
    email: email,
    password: password
  };
  
  users[id] = newUser; 
  //console.log(users);
  
  res.cookie("user_id",id);  //user_id 

  res.redirect("/urls");
}
  });
//new login page 
  app.get("/login", (req, res) => {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_login.ejs",templateVars);
  });
 
  app.post("/login", (req,res) =>{
    // console.log("login req.body:",req.body);
    let email = req.body.email;
    let id = getUserByemail(email);
    let password = req.body.password;
   
    for (user in users) {
      if (users[user]['email'] === email) {
        if (users[user]['password'] === password) {
          id= users[user]['id'];
          res.cookie('user_id', id);
          res.redirect('/urls');
          return;
        }
      }
    }

    res.status(403).send("invaild email or password");
    // const newUser = {
    //   id: id,
    //   email: email,
    //   password: password
    // };
    
   
    // console.log(id);
    // res.cookie("user_id",id);  //user_id 
  
    //  res.redirect("/urls");
  
  });

  app.post('/logout', (req,res) =>{
    console.log("here")
    console.log(res.clearCookie)
    res.clearCookie("user_id")
    
    res.redirect('/urls');
    });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});