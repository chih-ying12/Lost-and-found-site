// login.js – authentication functions
const auth = {
  signUp: async (username, password) => {
    const user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    return user.signUp();
  },
  logIn: async (username, password) => Parse.User.logIn(username, password),
  logOut: async () => Parse.User.logOut(),
  getCurrentUser: () => Parse.User.current()
};
