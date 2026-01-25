import React from "react";
import "./styles/Step5.css";
import plastic from "./images/plastic.png";
import wooden from "./images/wooden.png";
import "bootstrap/dist/css/bootstrap.min.css";

const Step5 = ({ goToStep, setIsPlastic, isManualInput }) => {
  const nextStep = isManualInput ? 6 : 5; // manual -> TransitionDataPage; file -> UploadFilePage
  return (
    <>
      <div className="card4">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2 className="ubuntu-heading">
                  Choose the best pallet to get your goods shipped safely!
                </h2>
                <p className="ubuntu-light">
                  Lightweight and reusable, or classic and sturdy - your choice!
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="option" onClick={() => { goToStep(nextStep); setIsPlastic(true); }}>
                <div className="text">
                  <h3 className="ubuntu-regular">I choose Plastic one</h3>
                  <p className="ubuntu-regular">
                    Lightweight and durable, perfect for reuse.
                  </p>
                </div>
                <div className="img">
                  <img src={plastic} alt="Plastic pallet"></img>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="option" onClick={() => { goToStep(nextStep); }}>
                <div className="text">
                  <h3 className="ubuntu-regular">I choose Wooden one</h3>
                  <p className="ubuntu-regular">
                    Classic and sturdy, great for heavier loads.
                  </p>
                </div>
                <div className="img">
                  <img src={wooden} alt="Wooden pallet"></img>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step5;
