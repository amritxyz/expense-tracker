import Navbar_auth from "./Navbar_auth";
import Navbar from "./Navbar";

export default function Dashboard() {
  return (
    <>
      {/*
        * INFO: Navbar is useless using just using in development phase
        *       It's so pretty just like me..😉
        * TODO: A vertical Navbar...
        */}
      <Navbar_auth />
      <Navbar />
    </>
  );
}
