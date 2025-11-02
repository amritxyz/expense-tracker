import { useState } from "react";
import VerticalNavbar from "./VerticalNavbar";

export default function Income() {
  /* INFO: useStates */
  const [inc_name, setInc_name] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    /* Make sure form is filled */
    if (!inc_name || !amount || !date) {
      alert("Please Fill in all fields")
      return;
    }

    const incomeData = {
      inc_name,
      amount: parseFloat(amount),
      date
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/income", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(incomeData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Income added successfully.");
        setInc_name();
        setAmount();
        setDate();
      } else {
        alert(data.message, "Failed to add income.");
      }

    } catch (err) {
      console.log("Error adding income.", err);
      alert("An error occurred while adding the income.");
    }
  };
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed md:w-64 hidden md:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className="md:ml-64 h-screen bg-blue-50">
          <h2>Add Income</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inc_name" className="block">name</label>
              <input
                type="text"
                id="inc_name"
                value={inc_name}
                onChange={(e) => setInc_name(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block">Amount</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="date" className="block">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Add Income</button>
          </form>
        </div>
      </div>
    </>
  );
}
