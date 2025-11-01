import VerticalNavbar from "./VerticalNavbar"

export default function Profile() {
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed md:w-64 hidden md:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className="md:ml-64 h-screen bg-blue-50">
          This is profile section.
        </div>
      </div>
    </>
  )
}
