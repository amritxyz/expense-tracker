import Navbar from "./Navbar";
// import screenshot from "../assets/screenshot.png" // INFO: Choose photo accordingly

function Hero() {
  return (
    <>
      <Navbar />
      <section className="h-screen flex items-center justify-center">
        <div id="home_main" className="px-1 py-2 w-[75%] flex items-center justify-between">
          <div id="left" className="h-screen w-[50%] bg-black text-white flex items-center justify-between">
            {/* <img src={screenshot} className="w-[45%]" /> */}
            <p className="w-[100%] flex text-center items-center justify-center">
              This is left
            </p>
          </div>
          <div id="right" className="h-screen w-[50%] bg-red-500 flex justify-between">
            <p className="w-[100%] flex text-center items-center justify-center">
              This is right
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
