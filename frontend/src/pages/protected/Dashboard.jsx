import VerticalNavbar from "./VerticalNavbar";
import Recent from "./Recent";

export default function Dashboard() {
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed md:w-64 hidden md:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className={`md:ml-64 bg-blue-50 ${`h-screen` ? `h-screen` : `h-full`}`}>
          <Recent />
        </div>
      </div>
    </>
  );
}
