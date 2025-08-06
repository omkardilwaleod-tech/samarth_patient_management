"use client";
import { useState, useEffect } from 'react';
import React from 'react'; // Added for React.Fragment

export default function Doctor() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('1day'); // 'all', '1day', '2days', '7days', '15days', '1month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingPatientId, setEditingPatientId] = useState(null); // State to track which patient is being edited
  const [editingTreatmentId, setEditingTreatmentId] = useState(null); // State to track which treatment is being edited
  const [editFormData, setEditFormData] = useState({}); // State to hold form data for the edited treatment
  const [showAddTreatmentForm, setShowAddTreatmentForm] = useState(null); // Patient ID for which to show add treatment form
  const [todayAmountCollected, setTodayAmountCollected] = useState(0);
  const [monthAmountCollected, setMonthAmountCollected] = useState(0);
  const [todayCashCollected, setTodayCashCollected] = useState(0);
  const [todayOnlineCollected, setTodayOnlineCollected] = useState(0);
  const [monthCashCollected, setMonthCashCollected] = useState(0);
  const [monthOnlineCollected, setMonthOnlineCollected] = useState(0);
  const [activeTab, setActiveTab] = useState('pendingOpds'); // New state for active tab: 'pendingOpds', 'completedOpds'

  // Predefined lists for dropdowns
  const treatmentOptions = [
    '', // Empty option for placeholder
    'Root Canal',
    'Crown Placement',
    'Filling',
    'Extraction',
    'Cleaning',
    'Orthodontics',
    'Whitening',
  ];

  const doctorNameOptions = [
    '', // Empty option for placeholder
    'Dr. Smith',
    'Dr. Jones',
    'Dr. Williams',
    'Dr. Brown',
  ];

  // Helper function to format a Date object to YYYY-MM-DD string in IST
  const formatDateToISTInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Use Intl.DateTimeFormat to get components in 'Asia/Kolkata' timezone
    const year = d.toLocaleString('en-US', { year: 'numeric', timeZone: 'Asia/Kolkata' });
    const month = d.toLocaleString('en-US', { month: '2-digit', timeZone: 'Asia/Kolkata' });
    const day = d.toLocaleString('en-US', { day: '2-digit', timeZone: 'Asia/Kolkata' });
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse a YYYY-MM-DD string into a Date object representing 00:00:00 IST
  const parseInputDateToIST = (dateString) => {
    if (!dateString) return null;
    // Append T00:00:00 with IST offset (+05:30) to ensure it's parsed as IST start of day
    return new Date(`${dateString}T00:00:00+05:30`);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients'); // Assuming this endpoint returns all patients
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setPatients(data.data);
        } else {
          setError(data.error || 'Failed to fetch patients.');
        }
      } catch (e) {
        setError(`Error fetching patients: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      let todayTotal = 0;
      let monthTotal = 0;
      let todayCash = 0;
      let todayOnline = 0;
      let monthCash = 0;
      let monthOnline = 0;

      patients.forEach(patient => {
        if (patient.treatments) {
          patient.treatments.forEach(treatment => {
            const treatmentDate = new Date(treatment.updatedAt);
            const amount = treatment.amountToCollect || 0;
            const paymentMode = treatment.paymentMode;

            // Use IST-aware dates for comparison
            const istToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            istToday.setHours(0, 0, 0, 0);

            const istStartOfMonth = new Date(startOfMonth.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            istStartOfMonth.setHours(0, 0, 0, 0);

            const istTreatmentDate = new Date(treatmentDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            istTreatmentDate.setHours(0, 0, 0, 0);

            if (istTreatmentDate.getTime() >= istToday.getTime()) {
              todayTotal += amount;
              if (paymentMode === 'Cash') {
                todayCash += amount;
              } else if (paymentMode === 'Online') {
                todayOnline += amount;
              }
            }

            if (istTreatmentDate.getTime() >= istStartOfMonth.getTime()) {
              monthTotal += amount;
              if (paymentMode === 'Cash') {
                monthCash += amount;
              } else if (paymentMode === 'Online') {
                monthOnline += amount;
              }
            }
          });
        }
      });

      setTodayAmountCollected(todayTotal);
      setMonthAmountCollected(monthTotal);
      setTodayCashCollected(todayCash);
      setTodayOnlineCollected(todayOnline);
      setMonthCashCollected(monthCash);
      setMonthOnlineCollected(monthOnline);
    }
  }, [patients]);

  if (loading) {
    return <div className="container mt-5">Loading patients...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">Error: {error}</div>;
  }

  const filterPatientsByDate = (patientList) => {
    const now = new Date();
    let filterStartDate = null;
    let filterEndDate = null;

    if (dateFilter === 'custom' && startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999); // Set end date to end of day
    } else {
      switch (dateFilter) {
        case '1day':
          filterStartDate = new Date();
          filterStartDate.setDate(filterStartDate.getDate() - 1);
          filterStartDate.setHours(0, 0, 0, 0); // Start of day
          break;
        case '2days':
          filterStartDate = new Date();
          filterStartDate.setDate(filterStartDate.getDate() - 2);
          filterStartDate.setHours(0, 0, 0, 0); // Start of day
          break;
        case '7days':
          filterStartDate = new Date();
          filterStartDate.setDate(filterStartDate.getDate() - 7);
          filterStartDate.setHours(0, 0, 0, 0);
          break;
        case '15days':
          filterStartDate = new Date();
          filterStartDate.setDate(filterStartDate.getDate() - 15);
          filterStartDate.setHours(0, 0, 0, 0);
          break;
        case '1month':
          filterStartDate = new Date();
          filterStartDate.setMonth(filterStartDate.getMonth() - 1);
          filterStartDate.setHours(0, 0, 0, 0);
          break;
        case 'all':
        default:
          return patientList; // No filter applied
      }
      filterEndDate = new Date(); // End date is always now for predefined filters
    }

    return patientList.filter(patient => {
      // For a patient to be included by the date filter, their *updatedAt* must be within the range
      // OR they must have at least one treatment whose *updatedAt* is within the range.
      const patientUpdatedAt = new Date(patient.updatedAt);
      const isPatientUpdatedInRange = patientUpdatedAt >= filterStartDate && patientUpdatedAt <= filterEndDate;

      const hasTreatmentUpdateInRange = (patient.treatments || []).some(treatment => {
        const treatmentUpdatedAt = new Date(treatment.updatedAt);
        return treatmentUpdatedAt >= filterStartDate && treatmentUpdatedAt <= filterEndDate;
      });

      return isPatientUpdatedInRange || hasTreatmentUpdateInRange;
    });
  };

  const filterPatientsByTab = (patientList) => {
    // If 'all' is selected in the date filter, and no specific tab, return all patients
    if (activeTab === 'all') {
        return patientList;
    }

    if (activeTab === 'pendingOpds') {
      return patientList.filter(patient => {
        // Patient is pending if their lead is 'open'
        return patient.lead === 'open';
      });
    } else if (activeTab === 'completedOpds') {
      return patientList.filter(patient => {
        // Patient is completed if their lead is 'closed'
        return patient.lead === 'closed';
      });
    }
    return patientList; // Should not be reached if activeTab is handled by the above conditions
  };

  const displayedPatients = filterPatientsByDate(patients);
  let finalDisplayedPatients = filterPatientsByTab(displayedPatients);

  // Sort by patient.updatedAt in descending order
  finalDisplayedPatients = finalDisplayedPatients.sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleEditChange = (e, patientId, treatmentId) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [patientId]: {
        ...(prev[patientId] || {}),
        [treatmentId]: {
          ...(prev[patientId]?.[treatmentId] || {}),
          [name]: type === 'number' ? parseFloat(value) : value,
        },
      }
    }));
  };

  const handleStatusChange = (e, patientId, treatmentId) => {
    const { value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [patientId]: {
        ...(prev[patientId] || {}),
        [treatmentId]: {
          ...(prev[patientId]?.[treatmentId] || {}),
          treatmentStatus: value,
          nextVisitDate: value === 'Next Visit Required' ? (prev[patientId]?.[treatmentId]?.nextVisitDate || '') : null,
        },
      }
    }));
  };

  const handleNextVisitDateChange = (e, patientId, treatmentId) => {
    const { value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [patientId]: {
        ...(prev[patientId] || {}),
        [treatmentId]: {
          ...(prev[patientId]?.[treatmentId] || {}),
          nextVisitDate: value,
        },
      }
    }));
  };

  const handleAddTreatmentClick = (patientId) => {
    setShowAddTreatmentForm(patientId);
    setEditingPatientId(patientId); // Keep the patient row expanded
    setEditingTreatmentId('new'); // Indicate new treatment
    setEditFormData(prev => ({
      ...prev,
      [patientId]: {
        ...(prev[patientId] || {}),
        'new': { // Initialize with default values for new treatment
          treatment: '',
          amountToCollect: 0,
          doctorName: '',
          treatmentStatus: 'Pending',
          nextVisitDate: null,
          paymentMode: '',
        }
      }
    }));
  };

  const handleUpdateTreatment = async (patientId, treatment) => {
    setEditingPatientId(patientId);
    setEditingTreatmentId(treatment._id); // Set the ID of the treatment being edited
    // Initialize edit form data with current treatment data
    setEditFormData(prev => ({
      ...prev,
      [patientId]: {
        ...(prev[patientId] || {}),
        [treatment._id]: {
          treatment: treatment.treatment || '',
          amountToCollect: treatment.amountToCollect || 0,
          doctorName: treatment.doctorName || '',
          treatmentStatus: treatment.treatmentStatus || 'Pending',
          nextVisitDate: treatment.nextVisitDate ? formatDateToISTInput(treatment.nextVisitDate) : '',
          paymentMode: treatment.paymentMode || '',
        }
      }
    }));
  };

  const handleSubmitTreatment = async (patientId) => {
    const treatmentId = editingTreatmentId;
    const treatmentData = { ...editFormData[patientId]?.[treatmentId] }; // Create a copy to modify

    // Convert nextVisitDate string from input to IST-aware Date object for saving
    if (treatmentData.nextVisitDate) {
      treatmentData.nextVisitDate = parseInputDateToIST(treatmentData.nextVisitDate);
    }

    const currentPatient = patients.find(p => p._id === patientId);
    const currentTreatment = (currentPatient.treatments || []).find(t => t._id === treatmentId);

    // Removed visits increment logic

    let url;
    let method;

    if (treatmentId === 'new') {
      // Adding a new treatment
      url = `/api/patients/${currentPatient.patientIdentifier}`;
      method = 'PUT';
      treatmentData.isNewTreatment = true; // Flag for new treatment
    } else {
      // Updating an existing treatment
      url = `/api/patients/${currentPatient.patientIdentifier}`;
      method = 'PUT';
      treatmentData._id = treatmentId;
      treatmentData.isTreatmentUpdate = true; // Flag for treatment update
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treatmentData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Treatment updated successfully!');
        // Re-fetch all patients to get the most up-to-date data including new treatments
        const updatedPatientsResponse = await fetch('/api/patients');
        const updatedPatientsData = await updatedPatientsResponse.json();
        if (updatedPatientsData.success) {
          setPatients(updatedPatientsData.data);
        }

        setEditingPatientId(null); // Exit editing mode
        setEditingTreatmentId(null);
        setShowAddTreatmentForm(null);
        setEditFormData({});

      } else {
        alert(`Error updating treatment: ${data.error || 'Something went wrong.'}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingPatientId(null);
    setEditingTreatmentId(null);
    setShowAddTreatmentForm(null);
    setEditFormData({});
  };

  const handleCloseLead = async (patientIdentifier) => {
    const patientToClose = patients.find(p => p.patientIdentifier === patientIdentifier);

    // New validation: check if at least one new treatment has been added since the lead was opened
    if (patientToClose && (patientToClose.treatments || []).length <= patientToClose.treatmentCountAtLeadOpen) {
      alert('Cannot close lead: At least one new treatment must be added since the lead was opened.');
      return;
    }

    if (window.confirm('Are you sure you want to close this lead?')) {
      try {
        const response = await fetch(`/api/patients/${patientIdentifier}/close-lead`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          alert('Lead closed successfully!');
          // Re-fetch all patients to get the most up-to-date data including lead status
          const updatedPatientsResponse = await fetch('/api/patients');
          const updatedPatientsData = await updatedPatientsResponse.json();
          if (updatedPatientsData.success) {
            setPatients(updatedPatientsData.data);
          }
        } else {
          alert(`Error closing lead: ${data.error || 'Something went wrong.'}`);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-3">Doctor's Dashboard</h1>

      <div className="mb-3">
        <label htmlFor="dateFilter" className="form-label">Filter by Date:</label>
        <select
          className="form-select mb-2"
          id="dateFilter"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            // Clear custom date range if a predefined filter is selected
            if (e.target.value !== 'custom') {
              setStartDate('');
              setEndDate('');
            }
          }}
        >
          <option value="all">All Patients (by registration/treatment date)</option>
          <option value="1day">Last 1 Day</option>
          <option value="2days">Last 2 Days</option>
          <option value="7days">Last 7 Days</option>
          <option value="15days">Last 15 Days</option>
          <option value="1month">Last 1 Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilter === 'custom' && (
          <div className="row">
            <div className="col-md-6 mb-2">
              <label htmlFor="startDate" className="form-label">Start Date:</label>
              <input
                type="date"
                className="form-control"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilter('custom'); // Ensure custom is selected when dates are manually entered
                }}
              />
            </div>
            <div className="col-md-6 mb-2">
              <label htmlFor="endDate" className="form-label">End Date:</label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilter('custom'); // Ensure custom is selected when dates are manually entered
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-around mb-3 amount-cards-container"> {/* Flex container for amounts */}
        <div className="card flex-fill mx-1 p-1 today-amount-card"> {/* flex-fill and reduced padding/margin */}
          <div className="card-body text-center p-2"> {/* Reduced padding */}
            <h6 className="m-0 text-white">Today's Collected: ₹{todayAmountCollected.toLocaleString()}</h6>
            <div className="d-flex justify-content-center gap-2 mt-2">
              <span className="amount-detail">Cash: ₹{todayCashCollected.toLocaleString()}</span>
              <span className="amount-detail">Online: ₹{todayOnlineCollected.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card flex-fill mx-1 p-1 month-amount-card"> {/* flex-fill and reduced padding/margin */}
          <div className="card-body text-center p-2"> {/* Reduced padding */}
            <h6 className="m-0 text-white">This Month's Collected: ₹{monthAmountCollected.toLocaleString()}</h6>
            <div className="d-flex justify-content-center gap-2 mt-2">
              <span className="amount-detail">Cash: ₹{monthCashCollected.toLocaleString()}</span>
              <span className="amount-detail">Online: ₹{monthOnlineCollected.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-3">All Patients</h2>
      <div className="d-flex mb-3">
        <button
          className={`btn btn-outline-primary me-2 ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Patients
        </button>
        <button
          className={`btn btn-outline-warning me-2 ${activeTab === 'pendingOpds' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendingOpds')}
        >
          Pending OPDs
        </button>
        <button
          className={`btn btn-outline-success ${activeTab === 'completedOpds' ? 'active' : ''}`}
          onClick={() => setActiveTab('completedOpds')}
        >
          Completed OPDs
        </button>
      </div>

      {finalDisplayedPatients.length === 0 ? (
        <p>No patients to display for the selected filter.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-sm doctor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Number</th>
                <th>Enquiry Type</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Address</th>
                <th>Registration Date</th>
                <th className="last-treated-column">Last Treated</th>
                <th>Total Treatments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {finalDisplayedPatients.map((patient) => (
                <React.Fragment key={patient._id}>
                  <tr>
                    <td>{patient.name}</td>
                    <td>{patient.contactNumber}</td>
                    <td>{patient.isNewEnquiry ? 'New Enquiry' : 'Old Enquiry'}</td>
                    <td>{new Date(patient.dateOfBirth).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.address}</td>
                    <td>{new Date(patient.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })}</td>
                    <td className="last-treated-column">
                      {patient.treatments && patient.treatments.length > 0
                        ? new Date(Math.max(...patient.treatments.map(t => new Date(t.updatedAt))))
                            .toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })
                        : 'N/A'}
                    </td>
                    <td>{patient.treatmentCountAtLeadOpen}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-1 align-items-center">
                        <button className="btn btn-info btn-sm" onClick={() => setEditingPatientId(editingPatientId === patient._id ? null : patient._id)}>
                        {editingPatientId === patient._id ? 'Hide Treatments' : 'Show Treatments'}
                      </button>
                      {activeTab !== 'completedOpds' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleAddTreatmentClick(patient._id)}>Add Treatment</button>
                      )}
                      {patient.lead === 'open' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCloseLead(patient.patientIdentifier)}>
                              Close Lead
                          </button>
                      )}
                      </div>
                    </td>
                  </tr>
                  {editingPatientId === patient._id && ( // Show treatments if patient row is expanded
                    <>
                      {(patient.treatments || []).length > 0 ? ( // Display existing treatments
                        (patient.treatments || []).map((treatment) => (
                          <tr key={treatment._id || `new-${patient._id}`}>
                            <td colSpan="9" className="treatment-cell-fix"> {/* Adjusted colSpan */}
                              <div className="treatment-section-wrapper">
                                <table className="table table-sm table-borderless w-100">
                                  <thead>
                                    <tr>
                                      <th>Treatment</th>
                                      <th>Amount</th>
                                      <th>Doctor</th>
                                      <th>Status</th>
                                      <th>Next Visit</th>
                                      <th>Payment</th>
                                      <th>Treatment Date</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      {editingTreatmentId === treatment._id ? (
                                        <>
                                          <td>
                                            <div className="form-control-container">
                                            <select
                                              className="form-select"
                                              name="treatment"
                                              value={editFormData[patient._id]?.[treatment._id]?.treatment || ''}
                                              onChange={(e) => handleEditChange(e, patient._id, treatment._id)}
                                            >
                                              {treatmentOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                              ))}
                                            </select>
                                            </div>
                                          </td>
                                          <td>
                                            <div className="form-control-container">
                                            <input
                                              type="text"
                                              className="form-control"
                                              name="amountToCollect"
                                              value={editFormData[patient._id]?.[treatment._id]?.amountToCollect || '0'}
                                              onChange={(e) => handleEditChange(e, patient._id, treatment._id)}
                                            />
                                            </div>
                                          </td>
                                          <td>
                                            <div className="form-control-container">
                                            <select
                                              className="form-select"
                                              name="doctorName"
                                              value={editFormData[patient._id]?.[treatment._id]?.doctorName || ''}
                                              onChange={(e) => handleEditChange(e, patient._id, treatment._id)}
                                            >
                                              {doctorNameOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                              ))}
                                            </select>
                                            </div>
                                          </td>
                                          <td>
                                            <div className="form-control-container">
                                            <select
                                              className="form-select"
                                              name="treatmentStatus"
                                              value={editFormData[patient._id]?.[treatment._id]?.treatmentStatus || 'Pending'}
                                              onChange={(e) => handleStatusChange(e, patient._id, treatment._id)}
                                            >
                                              <option value="Pending">Pending</option>
                                              <option value="Complete">Complete</option>
                                              <option value="Next Visit Required">Next Visit Required</option>
                                            </select>
                                            </div>
                                          </td>
                                          <td>
                                            <div className="form-control-container">
                                            {editFormData[patient._id]?.[treatment._id]?.treatmentStatus === 'Next Visit Required' ? (
                                              <input
                                                type="date"
                                                className="form-control"
                                                name="nextVisitDate"
                                                value={editFormData[patient._id]?.[treatment._id]?.nextVisitDate || ''}
                                                onChange={(e) => handleNextVisitDateChange(e, patient._id, treatment._id)}
                                              />
                                            ) : (
                                              'N/A'
                                            )}
                                            </div>
                                          </td>
                                          <td>
                                            <div className="form-control-container">
                                            <select
                                              className="form-select"
                                              name="paymentMode"
                                              value={editFormData[patient._id]?.[treatment._id]?.paymentMode || ''}
                                              onChange={(e) => handleEditChange(e, patient._id, treatment._id)}
                                            >
                                              <option value="">Select Payment Mode</option>
                                              <option value="Cash">Cash</option>
                                              <option value="Online">Online</option>
                                            </select>
                                            </div>
                                          </td>
                                          <td>
                                            {/* Treatment Date Display for edit mode, not input */}
                                            {treatment.updatedAt ? new Date(treatment.updatedAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }) : 'N/A'}
                                          </td>
                                          <td>
                                            {activeTab !== 'completedOpds' && (
                                              <div className="form-control-container d-flex justify-content-center gap-0">
                                                <button className="btn btn-success btn-sm" onClick={() => handleSubmitTreatment(patient._id, treatment._id)}>Save</button>
                                                <button className="btn btn-secondary btn-sm me-1" onClick={handleCancelEdit}>Cancel</button>
                                              </div>
                                            )}
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td>{treatment.treatment || 'N/A'}</td>
                                          <td>{treatment.amountToCollect || '0'}</td>
                                          <td>{treatment.doctorName || 'N/A'}</td>
                                          <td>{treatment.treatmentStatus || 'N/A'}</td>
                                          <td>{treatment.nextVisitDate ? new Date(treatment.nextVisitDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }) : 'N/A'}</td>
                                          <td>{treatment.paymentMode || 'N/A'}</td>
                                          <td>{treatment.updatedAt ? new Date(treatment.updatedAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }) : 'N/A'}</td>
                                          <td>
                                            {activeTab !== 'completedOpds' && (
                                              <button className="btn btn-primary btn-sm" onClick={() => handleUpdateTreatment(patient._id, treatment)}>Update</button>
                                            )}
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="treatment-cell-fix"> {/* Adjusted colSpan */}
                            <div className="treatment-section-wrapper text-center">
                              <p className="m-0 p-0">No treatments found for this patient.</p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {showAddTreatmentForm === patient._id && editingTreatmentId === 'new' && (
                        <tr>
                          <td colSpan="9" className="treatment-cell-fix"> {/* Adjusted colSpan */}
                            <div className="treatment-section-wrapper">
                              <h6 className="m-0">Add New Treatment:</h6> {/* Reduced margin-bottom */}
                              <table className="table table-sm table-borderless w-100">
                                <thead>
                                  <tr>
                                    <th>Treatment</th>
                                    <th>Amount</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                    <th>Next Visit</th>
                                    <th>Payment</th>
                                    <th>Treatment Date</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                      <div className="form-control-container">
                                      <select
                                        className="form-select"
                                        name="treatment"
                                        value={editFormData[patient._id]?.new?.treatment || ''}
                                        onChange={(e) => handleEditChange(e, patient._id, 'new')}
                                      >
                                        {treatmentOptions.map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="form-control-container">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="amountToCollect"
                                        value={editFormData[patient._id]?.new?.amountToCollect || '0'}
                                        onChange={(e) => handleEditChange(e, patient._id, 'new')}
                                      />
                                      </div>
                                    </td>
                                    <td>
                                      <div className="form-control-container">
                                      <select
                                        className="form-select"
                                        name="doctorName"
                                        value={editFormData[patient._id]?.new?.doctorName || ''}
                                        onChange={(e) => handleEditChange(e, patient._id, 'new')}
                                      >
                                        {doctorNameOptions.map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="form-control-container">
                                      <select
                                        className="form-select"
                                        name="treatmentStatus"
                                        value={editFormData[patient._id]?.new?.treatmentStatus || 'Pending'}
                                        onChange={(e) => handleStatusChange(e, patient._id, 'new')}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Complete">Complete</option>
                                        <option value="Next Visit Required">Next Visit Required</option>
                                      </select>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="form-control-container">
                                      {editFormData[patient._id]?.new?.treatmentStatus === 'Next Visit Required' ? (
                                        <input
                                          type="date"
                                          className="form-control"
                                          name="nextVisitDate"
                                          value={editFormData[patient._id]?.new?.nextVisitDate || ''}
                                          onChange={(e) => handleNextVisitDateChange(e, patient._id, 'new')}
                                        />
                                      ) : (
                                        'N/A'
                                      )}
                                      </div>
                                    </td>
                                    <td>
                                      <div className="form-control-container">
                                      <select
                                        className="form-select"
                                        name="paymentMode"
                                        value={editFormData[patient._id]?.new?.paymentMode || ''}
                                        onChange={(e) => handleEditChange(e, patient._id, 'new')}
                                      >
                                        <option value="">Select Payment Mode</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Online">Online</option>
                                      </select>
                                      </div>
                                    </td>
                                    <td>
                                      {/* Treatment Date Display for new treatment, not input */}
                                      {new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })} {/* For new treatment, show current date */}
                                    </td>
                                    <td>
                                      {activeTab !== 'completedOpds' && (
                                        <div className="form-control-container d-flex justify-content-center gap-0">
                                          <button className="btn btn-success btn-sm" onClick={() => handleSubmitTreatment(patient._id, 'new')}>Add</button>
                                        <button className="btn btn-secondary btn-sm me-1" onClick={handleCancelEdit}>Cancel</button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style jsx>{`
        /* Custom styles for Collection Boxes */
        .amount-cards-container {
          display: flex;
          justify-content: space-around;
          margin-bottom: 1.5rem;
          gap: 1rem; /* Space between cards */
        }

        .card.today-amount-card {
          background: linear-gradient(135deg, #339966 0%, #4CAF50 100%);
          color: white;
        }

        .card.month-amount-card {
          background: linear-gradient(135deg, #007bb6 0%, #2196F3 100%);
          color: white;
        }

        .card {
          border: 1px solid #e9ecef;
          border-radius: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease-in-out;
          overflow: hidden;
          padding: 0.8rem;
          flex: 1;
          min-width: 0;
          text-align: center;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .card-body {
          padding: 0.5rem !important; /* Reduced for compactness */
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .card-body h6 {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 0.4rem;
        }

        .amount-detail {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 0.4rem;
          padding: 0.1rem 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .amount-detail.cash-highlight {
          font-size: 0.95rem;
          font-weight: 700;
          background-color: rgba(255, 255, 255, 0.3);
        }

        /* Responsive adjustments for amount cards */
        @media (max-width: 768px) {
          .amount-cards-container {
            flex-direction: column;
            gap: 0.5rem;
          }
          .card {
            padding: 0.5rem;
          }
          .card-body {
            padding: 0.3rem !important;
          }
          .card-body h6 {
            font-size: 0.9rem;
            margin-bottom: 0.3rem;
          }
          .amount-detail {
            font-size: 0.65rem;
            padding: 0.05rem 0.3rem;
          }
          .amount-detail.cash-highlight {
              font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
  
} 