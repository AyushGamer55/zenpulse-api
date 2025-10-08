import axios from "axios";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNzU5NDkwMTc2LCJleHAiOjE3NjAwOTQ5NzZ9.L0okwOyUEakiAa6Li_APcF1a_oAUvD3aGthEcIII6dJ0";

async function fetchEntries() {
  try {
    const response = await axios.get("http://localhost:5000/api/entries", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Entries fetched:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Fetch entries failed:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

fetchEntries();
