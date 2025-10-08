import axios from "axios";

const testEntries = [
  {
    entry_date: "2023-06-01",
    mood: 3,
    tasks_completed: 5,
    journal: "Had a productive day, feeling good."
  },
  {
    entry_date: "2023-06-02",
    mood: 2,
    tasks_completed: 3,
    journal: "A bit tired, but managed to finish some tasks."
  },
  {
    entry_date: "2023-06-03",
    mood: 1,
    tasks_completed: 1,
    journal: "Feeling stressed and overwhelmed."
  },
  {
    entry_date: "2023-06-04",
    mood: 4,
    tasks_completed: 6,
    journal: "Better day, accomplished a lot."
  },
  {
    entry_date: "2023-06-05",
    mood: 5,
    tasks_completed: 7,
    journal: "Feeling great and motivated!"
  }
];

async function addEntries() {
  try {
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "testuser@example.com",
      password: "testpassword"
    });
    const token = loginRes.data.token;

    for (const entry of testEntries) {
      try {
        const res = await axios.post("http://localhost:5000/api/entries", entry, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Added entry:", res.data);
      } catch (error) {
        if (error.response) {
          console.error("Failed to add entry:", error.response.data);
        } else {
          console.error("Error:", error.message);
        }
      }
    }
  } catch (error) {
    if (error.response) {
      console.error("Login failed:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

addEntries();
