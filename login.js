// login.js – handle sign up, sign in, and session management
const auth = {
  async signUp(username, password) {
    const user = new Parse.User();
    user.set("username", username);
    user.set("password", password);
    return user.signUp();
  },

  async logIn(username, password) {
    return Parse.User.logIn(username, password);
  },

  async logOut() {
    await Parse.User.logOut();
  },

  getCurrentUser() {
    return Parse.User.current();
  }
};
