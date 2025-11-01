import { useState } from "react";
import VerticalNavbar from "./VerticalNavbar";


export default function Expense() {
  /* INFO: useStates */
  const [categories, setCategories] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    /* Make sure form is filled */
    if (!categories || !amount || !date) {
      alert("Please Fill in all fields")
      return;
    }

    const expenseData = {
      categories,
      amount: parseFloat(amount),
      date
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/expense", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Expense added successfully.");
        setCategories();
        setAmount();
        setDate();
      } else {
        alert(data.message, "Failed to add expenses.");
      }

    } catch (err) {
      console.log("Error adding expenses.", err);
      alert("An error occurred while adding the expenses.");
    }
  };

  // function AddCard() {
  //   return (
  //     <div className="border-[2px] rounded-xl border-current/20  h-[12rem] w-[16rem] bg-current/10">
  //       <div className="text-[4rem] text-current/50 text-center flex items-center justify-center h-full w-full">
  //         <span>+</span>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed md:w-64 hidden md:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className="md:ml-64 h-screen bg-blue-50">
          <h2>Add an Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="categories" className="block">Category</label>
              <input
                type="text"
                id="categories"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
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

            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Add Expense</button>
          </form>
        </div>
      </div>
    </>
  );
}
