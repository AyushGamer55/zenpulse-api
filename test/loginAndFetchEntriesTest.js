import axios from "axios";

async function loginAndFetchEntries() {
  try {
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "testuser@example.com",
      password: "testpassword"
    });
    console.log("Login successful:", loginRes.data);

    const token = loginRes.data.token;

    const entriesRes = await axios.get("http://localhost:5000/api/entries", {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    console.log("Entries fetched:", entriesRes.data);
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

loginAndFetchEntries();
