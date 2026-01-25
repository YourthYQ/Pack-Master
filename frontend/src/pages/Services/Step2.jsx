import React, { useState } from "react";
import "./styles/Step2.css";
import BoxImage2 from "./images/BoxImage2";
import BoxImage3 from "./images/BoxImage3";
import "bootstrap/dist/css/bootstrap.min.css";

const Step2 = ({ goToStep, setIsManualInput }) => {

  return (
    <>
      <div className="card2">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2 className="ubuntu-heading">
                  I'll find the best way in a minute
                </h2>
                <p className="ubuntu-light">
                  Give us the insight into your case - let's start!
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="option" onClick={() => { setIsManualInput(true); goToStep(2); }}>
                <div className="text">
                  <h3 className="ubuntu-regular">I know the dimensions</h3>
                  <p className="ubuntu-regular">
                    I will manually input all the box sizes.
                  </p>
                </div>
                <BoxImage2 />
              </div>
            </div>
            <div className="col-md-6">
              <div className="option" onClick={() => { setIsManualInput(false); goToStep(3); }}>
                <div className="text">
                  <h3 className="ubuntu-regular">I have a database</h3>
                  <p className="ubuntu-regular">
                    I will import a file containing the sizes.
                  </p>
                </div>
                <BoxImage3 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step2;
