//import React from "react";
import React, { useEffect, useState, useMemo } from "react";


import "./ITSwhTable.css";

const QtyButtons = ({ value, onAdjust }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setInputValue(e.target.value);

    if (!isNaN(newValue)) {
      const delta = newValue - value;
      onAdjust(delta);
    }
  };
  
  return(
    <>
      <style>
        {`
          input[type=number]::-webkit-outer-spin-button,
          input[type=number]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>

    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
      <button type="button" className="btn btn-small" onClick={() => onAdjust(-10)}>-10</button>
      <button type="button" className="btn btn-small" onClick={() => onAdjust(-5)}>-5</button>
      <button type="button" className="btn btn-small" onClick={() => onAdjust(-1)}>-1</button>

      <input type="number" value={inputValue} onChange={handleInputChange} style={{ width: 50, textAlign: "center", fontWeight: 600}}/>

      <button type="button" className="btn btn-small" onClick={() => onAdjust(+1)}>+1</button>
      <button type="button" className="btn btn-small" onClick={() => onAdjust(+5)}>+5</button>
      <button type="button" className="btn btn-small" onClick={() => onAdjust(+10)}>+10</button>
    </div>
    </>
  );
};

export const ITSwhTable = ({ rows, isEditing, deleteRow, editRow, onAdjustQuantity }) => {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>ITS Element</th>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Location</th>
            <th>Quantity</th>
            {isEditing && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {
            rows.map((row, idx) => {
              const canAdjust = !!row._id && typeof row.quantity === "number";

              return (
                  <tr key={row._id || idx}>
                  <td className="expand">{row.ITSElement}</td>
                  <td className="expand">{row.manufacturer}</td>
                  <td className="expand">{row.model}</td>
                  <td className="expand">{row.location}</td>

                  <td className="expand">
                    {!isEditing || !canAdjust ? (
                      row.quantity
                    ) : (
  
                      <QtyButtons
                        value={row.quantity}
                        onAdjust={(delta) => onAdjustQuantity(row, delta)}
                      />
                    )}
                  </td>

                  {isEditing && (
                    <td className="actions">
                      <button
                        type="button"
                        onClick={() => deleteRow(row._id)}
                        className="btn btn-small delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
        }
        </tbody>
      </table>
    </div> 
  );
}
export default ITSwhTable;