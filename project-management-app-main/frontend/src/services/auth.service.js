import http from "../http-common";

const API_URL = "/api/auth/";

class AuthService {
  login(username, password) {
    return http
      .post(API_URL + "signin", {
        username,
        password
      })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password, fullName) {
    return http.post(API_URL + "signup", {
      username,
      email,
      password,
      fullName
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  getToken() {
    const user = this.getCurrentUser();
    return user?.token || user?.accessToken;
  }
}

const authService = new AuthService();
export default authService;
