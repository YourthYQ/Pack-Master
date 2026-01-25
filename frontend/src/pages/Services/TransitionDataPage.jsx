import React, { useState, useEffect } from "react";
import "./styles/TransitionDataPage.css";
import GradientButton from "./components/GradientButton";
import ResultsDisplay from "./components/ResultsDisplay";
import BoxImage4 from "./images/BoxImage4";
import axios from "axios";
import { Flex, Spin } from "antd";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const TransitionDataPage = ({
  isManualInput,
  isAir,
  isPlastic,
  uploadedData,
  solution,
  setSolution,
  palletDims,
  setPalletDims,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAir) {
      const newDims = isPlastic
        ? { length: 48, width: 40, height: 57 }
        : { length: 48, width: 40, height: 57 };
      setPalletDims(newDims);
    } else {
      const newDims = isPlastic
        ? { length: 48, width: 40, height: 67 }
        : { length: 48, width: 40, height: 67 };
      setPalletDims(newDims);
    }
  }, [isAir, isPlastic]);

  const handlePalletization = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isManualInput) {
        if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) {
          setError("No box data. Please go back and add at least one box.");
          return;
        }
        const palletArr = [
          Number(palletDims.length) || 48,
          Number(palletDims.width) || 40,
          Number(palletDims.height) || 57,
        ];
        const response = await axios.post(
          `${API_BASE}/palletize`,
          { boxes: uploadedData, pallet_dims: palletArr },
          { headers: { "Content-Type": "application/json" } }
        );
        setSolution(response.data.best_solutions);
        setPalletDims(response.data.pallet_dims);
      } else {
        if (!uploadedData) {
          setError("No file uploaded. Please go back and upload an Excel file.");
          return;
        }
        const form = new FormData();
        form.append("file", uploadedData);
        form.append("pallet_dims", JSON.stringify(palletDims));
        const response = await axios.post(`${API_BASE}/palletize`, form);
        setSolution(response.data.best_solutions);
        setPalletDims(response.data.pallet_dims);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Request failed. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="card9">
          <Flex align="center" gap="middle">
            <Spin size="large" />
          </Flex>
        </div>
      ) : solution ? (
        <ResultsDisplay solution={solution} palletDims={palletDims} />
      ) : (
        <div className="card7">
          <div className="left">
            <BoxImage4 />
          </div>
          <div className="right">
            <div className="upper">
              <div className="title">
                <h2 className="ubuntu-heading">
                  Discover how we will pack your boxes
                </h2>
                <p className="ubuntu-light">
                  Your cargos will be shipped via{" "}
                  <strong>{isAir ? "Air" : "Sea"}{" "}Transportation</strong>,
                  <br></br>
                  coupled with{" "}
                  <strong>{isPlastic ? "Plastic" : "Wooden"} Pallets</strong>.
                </p>
              </div>
            </div>
            <div className="lower">
              {error && <p className="transition-error">{error}</p>}
              <GradientButton onClick={handlePalletization} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransitionDataPage;
