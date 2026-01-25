import React, { useState } from "react";
import "./styles/ServicesPage.css";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step4 from "./Step4";
import Step5 from "./Step5";
import ManualInputPage from "./ManualInputPage";
import UploadFilePage from "./UploadFilePage";
import TransitionDataPage from "./TransitionDataPage";

const steps = [
  Step1,
  Step2,
  ManualInputPage,
  Step4,
  Step5,
  UploadFilePage,
  TransitionDataPage,
];

const ServicesPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isManualInput, setIsManualInput] = useState(false);
  const [isAir, setIsAir] = useState(false);
  const [isPlastic, setIsPlastic] = useState(false);
  const [uploadedData, setUploadedData] = useState(null); // State to hold uploaded file

  const [solution, setSolution] = useState(null);
  const [palletDims, setPalletDims] = useState([0, 0, 0]);

  // Function to handle going to a specific step
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex <= steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Render the current step component based on the step index
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1 goToStep={goToStep} />;
      case 1:
        return (
          <Step2 goToStep={goToStep} setIsManualInput={setIsManualInput} />
        );
      case 2:
        return (
          <ManualInputPage
            goToStep={goToStep}
            setUploadedData={setUploadedData}
          />
        );
      case 3:
        return <Step4 goToStep={goToStep} setIsAir={setIsAir} />;
      case 4:
        return (
          <Step5
            goToStep={goToStep}
            setIsPlastic={setIsPlastic}
            isManualInput={isManualInput}
          />
        );
      case 5:
        return (
          <UploadFilePage
            goToStep={goToStep}
            uploadedData={uploadedData}
            setUploadedData={setUploadedData}
          />
        );
      case 6:
        // Pass all the collected data to MainPage
        return (
          <TransitionDataPage
            isManualInput={isManualInput}
            isAir={isAir}
            isPlastic={isPlastic}
            uploadedData={uploadedData}
            solution={solution}
            setSolution={setSolution}
            palletDims={palletDims}
            setPalletDims={setPalletDims}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="main-content">
        <h1>Optimize Your Packing Process</h1>
        <p>
          3DBP packing optimization software helps you choose the right box for
          every shipment
        </p>
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default ServicesPage;
