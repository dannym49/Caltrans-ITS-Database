import React from "react";

import "./ITSwhAdd.css";
import { useState } from 'react'
import { TextField } from '@mui/material';

export const ITSwhAdd = ({ closeITSwhAdd, onSubmit, defaultValue }) => {
    const [formState, setFormState] = useState(defaultValue || {
        ITSElement: "",
        manufacturer: "",
        model: "",
        location: "",
        quantity: "",
    });

    const [errors, setErrors] = useState("");
    const [other, setOtherText] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [editedData, setEditedData] = useState([]);

    const [manufacturerByDeviceType, setManufacturerByDeviceType] = useState({});
    const [modelsByDeviceType, setModelsByDeviceType] = useState({});
    const [pendingCustomManufacturer, setPendingCustomManufacturer] = useState({});
    const [pendingCustomModels, setPendingCustomModels] = useState({});

  const validateForm = () => {
    if (formState.ITSElement && formState.manufacturer && formState.model && formState.location && formState.quantity) {
      setErrors("");
      return true;
    } else {
      let errorFields = [];
      for (const [key, value] of Object.entries(formState)) {
        if (!value) {
          errorFields.push(key);
        }
      }
      setErrors(errorFields.join(", "));
      return false;
    }
  };

    const handleChange = (e) => {
        setFormState({
            ...formState, 
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Data submitted!', formState);

        if (!validateForm()) return;

        onSubmit(formState);

        closeITSwhAdd();

        
    
    };

    

    return (
        <div className="ITSwhAdd-container" 
            onClick={(e) => {
                if (e.target.className === "ITSwhAdd-container")closeITSwhAdd();
            }}
            >

            <div className="ITSwhAdd">
                <form>
                    <div className="form-group">
                        {/*We want to include drop down here as well not just an input*/}
                        <label htmlFor="ITSElement"> ITS Element</label>
                        <input name="ITSElement" value={formState.ITSElement} onChange={handleChange}/>
                    </div>
                    {/*Add drop down menu here as well and not just textarea*/}
                    <div className="form-group">
                        <label htmlFor="manufacturer"> Manufacturer</label>
                        <input name="manufacturer" value={formState.manufacturer} onChange={handleChange}/>
                    </div>
                    {/*This is a drop down, but we want to be able to add a new option too*/}
                    <div className="form-group">
                        <label htmlFor="model"> Model</label>
                        <select name="model" value={formState.model} onChange={handleChange}>
                            <option value=""></option>
                            <option value="add">SolarMax</option>
                           
                        </select>
                        
                    </div>
                    {/*This is a drop down, but we want to be able to add a new option too*/}
                    <div className="form-group">
                        <label htmlFor="location"> Location</label>
                        <select name="location" value={formState.location} onChange={handleChange}>
                            <option></option>     
                            <option value="2nd Floor of District Office">2nd Floor of District Office</option>
                            <option value="Basement of District Office">Basement of District Office</option>
                            <option value="ITS Seatrain">ITS Seatrain</option>
                            <option value="Other">Other</option>
                           
                        </select>
                    </div>
                    {/*This is enter value for Other in the Location tab WORKING ON THIS, We want to see a custom field if we press 'other' reference Project Details*/}
                     {formState.location === 'Other' && (
                    <TextField
                        label="Enter Location"
                        value={other}
                        onChange={(e) => {
                            setOtherText(e.target.value)
                            
                            
                        }}
                        placeholder="Please specify"
                        fullWidth
                        size="small"
                        margin="dense"
                        
                    />
                    )}
                             
                    {/*This is a drop down, but we want to be able to add a new option too*/}
                    <div className="form-group">
                        <label htmlFor="quantity"> Quantity</label>
                        <input name="quantity"  value={formState.quantity} onChange={handleChange}/>
                    </div>
                    {/*Submit button*/}
                    {errors && <div className="error">{`Please include: ${errors}`}</div>}
                    <button type="submit" className="btn" onClick={handleSubmit}>SUBMIT</button>
                </form>
            </div>
        </div>
    );
}
export default ITSwhAdd;