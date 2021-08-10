

//reuseing the function
const getUserByEmail = function(email, database) {
  for (let user in database) {
    // console.log(users[user]["email"], email)
    if (database[user]["email"] === email) {
      return user;
    }
  }
};
  
const generateRandomString = function() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
  
  
  
  
//users["userRandomID"]
const urlsForUser = function(id, urlDatabase) {
  let userURL = {};
  for (let url in urlDatabase) {
    
    let dbEntry = urlDatabase[url];
    if (dbEntry.userID === id) {
      userURL[url] = dbEntry;
    }
  }
  return userURL;
};



module.exports = { getUserByEmail, generateRandomString, urlsForUser };