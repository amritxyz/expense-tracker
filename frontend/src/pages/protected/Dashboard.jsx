import VerticalNavbar from "./VerticalNavbar";
import HorizontalNavbar from "./HorizontalNavbar";
import Recent from "./Recent";

export default function Dashboard() {
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed w-28 2xl:w-64 hidden lg:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className="block lg:hidden">
          <HorizontalNavbar />
        </div>

        <div className="2xl:ml-64 lg:ml-28 min-h-screen h-full">
          <Recent />
        </div>
      </div>
    </>
  );
}
