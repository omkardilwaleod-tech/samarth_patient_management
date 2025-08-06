"use client";
import { useState } from 'react';

export default function Reception() {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'old'
  const [formData, setFormData] = useState({
    patientIdentifier: null, // Change _id to patientIdentifier
    name: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    address: '',
    isNewEnquiry: true,
  });
  const [searchMobileNumber, setSearchMobileNumber] = useState('');
  const [message, setMessage] = useState('');
  const [foundPatients, setFoundPatients] = useState([]); // New state to store search results
  const [loading, setLoading] = useState(false); // New loading state

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSearchMobileNumberChange = (e) => {
    setSearchMobileNumber(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage(''); // Clear messages when switching tabs
    setSearchMobileNumber(''); // Clear search field
    setFoundPatients([]); // Clear previous search results
    setLoading(false); // Reset loading state on tab change
    // Reset form data for new enquiry if switching to new tab
    setFormData({
      patientIdentifier: null, // Reset patientIdentifier
      name: '',
      dateOfBirth: '',
      gender: '',
      contactNumber: '',
      address: '',
      isNewEnquiry: tab === 'new', // Set based on active tab
    });
  };

  const handleSelectPatient = (patient) => {
    setFormData({
      patientIdentifier: patient.patientIdentifier,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.substring(0, 10) : '',
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      address: patient.address,
      isNewEnquiry: false,
    });
    setActiveTab('new'); // Switch to new tab to show populated form
    setFoundPatients([]); // Clear search results after selection
    setMessage('Patient selected for editing.');
  };

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    setMessage('');
    setFoundPatients([]); // Clear previous results

    if (!searchMobileNumber) {
      setMessage('Please enter a mobile number to search.');
      return;
    }

    setLoading(true); // Set loading to true
    try {
      const response = await fetch(`/api/patients/search?contactNumber=${searchMobileNumber}`);
      const data = await response.json();

      if (response.ok && data.success) {
        if (Array.isArray(data.data) && data.data.length > 1) {
          setFoundPatients(data.data);
          setMessage(`${data.data.length} patients found. Please select one.`);
        } else if (Array.isArray(data.data) && data.data.length === 1) {
          // Only one patient found, directly populate the form
          handleSelectPatient(data.data[0]);
        } else if (data.data) { // Handle case where a single object is returned directly (not an array)
          handleSelectPatient(data.data);
        } else {
          setMessage(`Patient not found: No patient found with this mobile number.`);
        }
      } else {
        setMessage(`Patient not found: ${data.error || 'No patient found with this mobile number.'}`);
      }
    } catch (error) {
      setMessage(`Error searching patient: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    const method = formData.patientIdentifier ? 'PUT' : 'POST';
    const url = formData.patientIdentifier ? `/api/patients/${formData.patientIdentifier}` : '/api/patients';

    setLoading(true); // Set loading to true
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, lead: "open" }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Patient ${formData.patientIdentifier ? 'updated' : 'registered'} successfully!`);
        setFormData({ // Clear form fields and reset for new entry
          patientIdentifier: null,
          name: '',
          dateOfBirth: '',
          gender: '',
          contactNumber: '',
          address: '',
          isNewEnquiry: true,
        });
        setActiveTab('new'); // Ensure we are on the new tab after successful submission
      } else {
        setMessage(`Error: ${data.error || 'Something went wrong.'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-3">Reception Page</h1>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => handleTabChange('new')}
          >
            New Enquiry
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'old' ? 'active' : ''}`}
            onClick={() => handleTabChange('old')}
          >
            Old Enquiry
          </button>
        </li>
      </ul>

      {message && (
        <div className={`alert ${message.includes('Error') || message.includes('not found') ? 'alert-danger' : 'alert-success'}`} role="alert">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p>Processing...</p></div>
      ) : (
        <>
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit}>
              <p className="mb-4">{formData.patientIdentifier ? 'Edit patient details' : 'Register new patients here.'}</p>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  className="form-select"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Enquiry Type</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="isNewEnquiry"
                      id="newEnquiry"
                      value="true"
                      checked={formData.isNewEnquiry === true}
                      onChange={() => setFormData({ ...formData, isNewEnquiry: true })}
                    />
                    <label className="form-check-label" htmlFor="newEnquiry">New Enquiry</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="isNewEnquiry"
                      id="oldEnquiry"
                      value="false"
                      checked={formData.isNewEnquiry === false}
                      onChange={() => setFormData({ ...formData, isNewEnquiry: false })}
                    />
                    <label className="form-check-label" htmlFor="oldEnquiry">Old Enquiry</label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">{formData.patientIdentifier ? 'Update Patient' : 'Register Patient'}</button>
            </form>
          )}

          {activeTab === 'old' && (
            <div>
              <p className="mb-4">Search for an existing patient by mobile number.</p>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter mobile number"
                  value={searchMobileNumber}
                  onChange={handleSearchMobileNumberChange}
                />
                <button className="btn btn-outline-primary" type="button" onClick={handleSearchPatient}>Search</button>
              </div>

              {foundPatients.length > 0 && (
                <div className="mt-4">
                  <h5>Matching Patients:</h5>
                  <ul className="list-group">
                    {foundPatients.map(patient => (
                      <li key={patient.patientIdentifier} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{patient.name}</strong> ({patient.gender}, {new Date(patient.dateOfBirth).toLocaleDateString()})
                          <br />
                          <small>{patient.address}</small>
                        </div>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          Select
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 