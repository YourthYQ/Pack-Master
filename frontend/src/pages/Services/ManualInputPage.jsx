import React, { useState } from "react";
import "./styles/ManualInputPage.css";
import "bootstrap/dist/css/bootstrap.min.css";

const ManualInputPage = ({ goToStep, setUploadedData }) => {
  const [boxes, setBoxes] = useState([]);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const handleAdd = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (isNaN(l) || isNaN(w) || isNaN(h) || l <= 0 || w <= 0 || h <= 0) {
      alert("Please enter valid positive numbers for length, width, and height.");
      return;
    }
    setBoxes((prev) => [...prev, { length: l, width: w, height: h }]);
    setLength("");
    setWidth("");
    setHeight("");
  };

  const handleRemove = (index) => {
    setBoxes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (boxes.length === 0) {
      alert("Please add at least one box.");
      return;
    }
    setUploadedData(boxes);
    goToStep(3); // Step4: transport
  };

  return (
    <div className="card-manual">
      <div className="container">
        <div className="title">
          <h2 className="ubuntu-heading">Enter your box dimensions</h2>
          <p className="ubuntu-light">Add one or more boxes. Each needs length, width, and height (same units, e.g. inches).</p>
        </div>

        <div className="add-box">
          <input
            type="number"
            placeholder="Length"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            min="0.1"
            step="0.1"
          />
          <input
            type="number"
            placeholder="Width"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            min="0.1"
            step="0.1"
          />
          <input
            type="number"
            placeholder="Height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            min="0.1"
            step="0.1"
          />
          <button type="button" className="btn-add" onClick={handleAdd}>
            Add box
          </button>
        </div>

        {boxes.length > 0 && (
          <div className="box-list">
            <h3 className="ubuntu-regular">Boxes ({boxes.length})</h3>
            <ul>
              {boxes.map((b, i) => (
                <li key={i}>
                  <span>{b.length} × {b.width} × {b.height}</span>
                  <button type="button" className="btn-remove" onClick={() => handleRemove(i)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn-back" onClick={() => goToStep(1)}>Back</button>
          <button type="button" className="btn-next" onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ManualInputPage;
