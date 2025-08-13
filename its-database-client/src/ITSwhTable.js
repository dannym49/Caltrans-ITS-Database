import React from "react";

import "./ITSwhTable.css";

export const ITSwhTable = ({ rows, deleteRow, editRow }) => {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th display="flex" >  ITS Element</th>
            <th display="flex" >Manufacturer</th>
            <th display="flex" >Model</th>
            <th display="flex" >Location</th>
            <th display="flex" >Quantity</th>
          </tr>
        </thead>
        <tbody>
          

          {rows.map((row, idx) => {

            return (
              <tr key={idx}>
                <td className= "expand">{row.ITSElement}</td>
                <td className= "expand">{row.manufacturer}</td>
                <td className= "expand">{row.model}</td>
                <td className= "expand">{row.location}</td>
                <td className= "expand">{row.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export default ITSwhTable;