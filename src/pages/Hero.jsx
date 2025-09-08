import Navbar from "./Navbar";
// import screenshot from "../assets/screenshot.png" // INFO: Choose photo accordingly

function Hero() {
  return (
    <>
      <Navbar />
      <section className="h-screen bg-[#000000] text-[#ffffff] flex items-center justify-center">
        <div id="home_main" className="w-[95%] flex items-center justify-between">
          <div id="left">
            {/* <img src={screenshot} className="w-[45%]" /> */}
            <p>
              This is left
            </p>
          </div>
          <div id="right" className="w-[45%]">
            <p>
              Hello, There
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
