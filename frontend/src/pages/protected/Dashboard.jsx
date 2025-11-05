import VerticalNavbar from "./VerticalNavbar";
import Recent from "./Recent";

export default function Dashboard() {
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed w-28 2xl:w-64 hidden lg:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className={`2xl:ml-64 lg:ml-28 bg-blue-50 ${`h-screen` ? `h-screen` : `h-full`}`}>
          <Recent />
        </div>
      </div>
    </>
  );
}
