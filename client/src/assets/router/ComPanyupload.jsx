
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/ComPanyupload.css";

const CompanyUpload = () => {
  const [companyData, setCompanyData] = useState({
    name: "",
    location: "",
    currentLocation: "",
    description: "",
    ownerName: "",
    contactNumber: "",
    documents: [],
  });
  const [products, setProducts] = useState([
    { name: "", price: "", description: "", image: null },
  ]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle company form changes
  const handleCompanyChange = (e) => {
    const { name, value, files } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: files ? Array.from(files) : value,
    }));
  };

  // Handle product form changes
  const handleProductChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: files ? files[0] : value,
    };
    setProducts(updatedProducts);
  };

  // Add new product input
  const addProduct = () => {
    setProducts([
      ...products,
      { name: "", price: "", description: "", image: null },
    ]);
  };

  // Remove product input
  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Fetch live location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude},${longitude}`;
        setCompanyData((prev) => ({
          ...prev,
          currentLocation: locationString,
        }));
        console.log(`Location fetched: ${locationString}`);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Please allow location access."
            : "Failed to fetch location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!companyData.currentLocation) {
      setError("Please fetch your current location before submitting.");
      return;
    }

    const data = new FormData();
    // Append company details
    data.append("name", companyData.name);
    data.append("location", companyData.location);
    data.append("currentLocation", companyData.currentLocation);
    data.append("description", companyData.description);
    data.append("ownerName", companyData.ownerName);
    data.append("contactNumber", companyData.contactNumber);

    // Append documents
    companyData.documents.forEach((file) => {
      data.append("documents", file);
    });

    // Append products as JSON string
    data.append(
      "products",
      JSON.stringify(
        products.map(({ name, price, description }) => ({
          name,
          price,
          description,
        }))
      )
    );

    // Append product images
    products.forEach((product) => {
      if (product.image) {
        data.append("productImages", product.image);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:3030/companyUpload",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      alert(response.data.message || "Company uploaded successfully!");
      navigate("/productSection");
    } catch (err) {
      console.error("Company upload error:", err);
      setError(err.response?.data?.message || "Failed to upload company");
    }
  };

  return (
    <div className="company-upload-container">
      <h2 className="company-upload-title">Upload Company Details</h2>
      <div className="company-upload-card">
        <form
          className="company-upload-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          {/* Company Details */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Company Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter company name"
              className="form-input"
              required
              onChange={handleCompanyChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              id="location"
              type="text"
              name="location"
              placeholder="Enter company location"
              className="form-input"
              required
              onChange={handleCompanyChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="documents" className="form-label">
              Document Papers (PDF/Image)
            </label>
            <input
              id="documents"
              type="file"
              name="documents"
              accept="image/*,application/pdf"
              multiple
              className="form-input file-input"
              onChange={handleCompanyChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Current Operating Location</label>
            <button
              type="button"
              className="btn btn-get-location"
              onClick={handleGetLocation}
            >
              Get Current Location
            </button>
            {companyData.currentLocation && (
              <p className="location-display">
                Location: {companyData.currentLocation}
              </p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter company description"
              className="form-input textarea"
              required
              onChange={handleCompanyChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ownerName" className="form-label">
              Owner's Name
            </label>
            <input
              id="ownerName"
              type="text"
              name="ownerName"
              placeholder="Enter owner's name"
              className="form-input"
              required
              onChange={handleCompanyChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber" className="form-label">
              Contact Number
            </label>
            <input
              id="contactNumber"
              type="text"
              name="contactNumber"
              placeholder="Enter contact number"
              className="form-input"
              required
              onChange={handleCompanyChange}
            />
          </div>

          {/* Product Details */}
          <div className="product-section">
            <h3 className="product-section-title">Add Products</h3>
            {products.map((product, index) => (
              <div key={index} className="product-card">
                <div className="form-group">
                  <label
                    htmlFor={`product-name-${index}`}
                    className="form-label"
                  >
                    Product Name
                  </label>
                  <input
                    id={`product-name-${index}`}
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    className="form-input"
                    required
                    onChange={(e) => handleProductChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor={`product-image-${index}`}
                    className="form-label"
                  >
                    Product Image
                  </label>
                  <input
                    id={`product-image-${index}`}
                    type="file"
                    name="image"
                    accept="image/*"
                    className="form-input file-input"
                    onChange={(e) => handleProductChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor={`product-price-${index}`}
                    className="form-label"
                  >
                    Price
                  </label>
                  <input
                    id={`product-price-${index}`}
                    type="number"
                    name="price"
                    placeholder="Enter product price"
                    className="form-input"
                    required
                    onChange={(e) => handleProductChange(index, e)}
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor={`product-description-${index}`}
                    className="form-label"
                  >
                    Description
                  </label>
                  <textarea
                    id={`product-description-${index}`}
                    name="description"
                    placeholder="Enter product description"
                    className="form-input textarea"
                    onChange={(e) => handleProductChange(index, e)}
                  />
                </div>
                {products.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-remove-product"
                    onClick={() => removeProduct(index)}
                  >
                    Remove Product
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-add-product"
              onClick={addProduct}
            >
              Add Another Product
            </button>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-submit">
            Upload Company
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default CompanyUpload;