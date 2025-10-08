import axios from "axios";

async function login() {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email: "testuser@example.com",
      password: "testpassword"
    });
    console.log("Login successful:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Login failed:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

login();
