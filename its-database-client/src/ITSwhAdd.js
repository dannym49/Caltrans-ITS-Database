import React, { useEffect, useState, useMemo } from "react";

import "./ITSwhAdd.css";
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from "axios";

export const ITSwhAdd = ({ closeITSwhAdd, onSubmit, defaultValue }) => {
    const [formState, setFormState] = useState(defaultValue || {
        ITSElement: "",
        manufacturer: "",
        model: "",
        location: "",
        quantity: "",
        _id: undefined,
    });

      const [errors, setErrors] = useState("");
      const [saving, setSaving] = useState(false);
      const [loadingOpts, setLoadingOpts] = useState(true);
      const [items, setItems] = useState([]);

      useEffect(() => {
        let cancelled = false;
        (async () => {
          try {
            const { data } = await axios.get(`http://10.44.2.198:5000/api/itswh`);
            if (!cancelled) setItems(Array.isArray(data) ? data : []);
          } catch (e) {
            console.error("Failed to load ITSwh items for options:", e);
          } finally {
            if (!cancelled) setLoadingOpts(false);
          }
        })();
        return () => { cancelled = true; };
      }, []);

      useEffect(() => {
        if (defaultValue) {
          setFormState({
            ITSElement: defaultValue.ITSElement ?? "",
            manufacturer: defaultValue.manufacturer ?? "",
            model: defaultValue.model ?? "",
            location: defaultValue.location ?? "",
            quantity: defaultValue.quantity ?? "",
            _id: defaultValue._id,       
          });
        } else {
          setFormState({
            ITSElement: "",
            manufacturer: "",
            model: "",
            location: "",
            quantity: "",
            _id: undefined,
          });
        }
      }, [defaultValue]);

     
      const options = useMemo(() => {
        const uniq = (arr) =>
          Array.from(new Set(arr.filter(Boolean).map(s => String(s).trim())))
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

        return {
          itsElements:  uniq(items.map(r => r.ITSElement)),
          manufacturers: uniq(items.map(r => r.manufacturer)),
          models:        uniq(items.map(r => r.model)),
          locations:     uniq(items.map(r => r.location)),
        };
      }, [items]);

      const validateForm = () => {
        const missing = [];
        if (!formState.ITSElement?.trim())   missing.push("ITS Element");
        if (!formState.manufacturer?.trim()) missing.push("Manufacturer");
        if (!formState.model?.trim())        missing.push("Model");
        if (!formState.location?.trim())     missing.push("Location");

        const qty = Number(formState.quantity);
        if (Number.isNaN(qty) || qty < 0) missing.push("Quantity (must be ≥ 0)");

        setErrors(missing.join(", "));
        return missing.length === 0;
      };

      const setField = (name, value) =>
        setFormState(prev => ({ ...prev, [name]: value }));

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
          ITSElement: formState.ITSElement.trim(),
          manufacturer: formState.manufacturer.trim(),
          model: formState.model.trim(),
          location: formState.location.trim(),
          quantity: Number(formState.quantity),
        };

        try {
          setSaving(true);
          const isEditing = !!formState._id;
          const url = isEditing
            ? `http://10.44.2.198:5000/api/itswh/${formState._id}`
            : `http://10.44.2.198:5000/api/itswh`;

          const { data: saved } = isEditing
            ? await axios.put(url, payload)   
            : await axios.post(url, payload); 

          onSubmit?.(saved);                  
          closeITSwhAdd();
        } catch (err) {
          console.error("Save failed:", err);
          setErrors(err?.response?.data?.error || "Failed to save entry.");
        } finally {
          setSaving(false);
        }
      };

    return (
      <div
        className="ITSwhAdd-container"
        onClick={(e) => {
          if (e.target.className === "ITSwhAdd-container") closeITSwhAdd();
        }}
      >
        <div className="ITSwhAdd">
          <form onSubmit={handleSubmit}>
            {/* ITS Element */}
            <div className="form-group">
              <label htmlFor="ITSElement">ITS Element</label>
              <Autocomplete
                freeSolo
                loading={loadingOpts}
                options={options.itsElements}
                value={formState.ITSElement}
                onChange={(_, v) => setField("ITSElement", v || "")}
                onInputChange={(_, v) => setField("ITSElement", v || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                  />
                )}
              />
            </div>

            {/* Manufacturer */}
            <div className="form-group">
              <label htmlFor="manufacturer">Manufacturer</label>
              <Autocomplete
                freeSolo
                loading={loadingOpts}
                options={options.manufacturers}
                value={formState.manufacturer}
                onChange={(_, v) => setField("manufacturer", v || "")}
                onInputChange={(_, v) => setField("manufacturer", v || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                  />
                )}
              />
            </div>

            {/* Model */}
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <Autocomplete
                freeSolo
                loading={loadingOpts}
                options={options.models}
                value={formState.model}
                onChange={(_, v) => setField("model", v || "")}
                onInputChange={(_, v) => setField("model", v || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                  />
                )}
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <Autocomplete
                freeSolo
                loading={loadingOpts}
                options={options.locations}
                value={formState.location}
                onChange={(_, v) => setField("location", v || "")}
                onInputChange={(_, v) => setField("location", v || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                  />
                )}
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <TextField
                name="quantity"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={formState.quantity}
                onChange={(e) => setField("quantity", e.target.value)}
                size="small"
              />
            </div>

            {errors && <div className="error">{`Please fix: ${errors}`}</div>}
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : "SUBMIT"}
            </button>
          </form>
        </div>
      </div>
       
    );
}
export default ITSwhAdd;