import VerticalNavbar from "./VerticalNavbar";

export default function Dashboard() {
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed md:w-64 hidden md:block p-5 border shadow-sm bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className="md:ml-64 h-screen bg-blue-50">
          main screen
        </div>
      </div>
    </>
  );
}
