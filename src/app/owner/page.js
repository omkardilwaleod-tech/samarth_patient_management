"use client";
import { useState, useEffect } from 'react';
import React from 'react';

export default function Owner() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('1day'); // 'all', '1day', '2days', '7days', '15days', '1month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [todayAmountCollected, setTodayAmountCollected] = useState(0);
  const [monthAmountCollected, setMonthAmountCollected] = useState(0);
  const [todayCashCollected, setTodayCashCollected] = useState(0);
  const [todayOnlineCollected, setTodayOnlineCollected] = useState(0);
  const [monthCashCollected, setMonthCashCollected] = useState(0);
  const [monthOnlineCollected, setMonthOnlineCollected] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // Owner page will default to all patients

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert today to IST-aware date for comparison
    const istToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    istToday.setHours(0, 0, 0, 0);

    switch (activeTab) {
      case 'all':
        return patientList;
      case 'todayAppointments':
        return patientList.filter(patient => 
          (patient.treatments || []).some(treatment => {
            if (treatment.treatmentStatus === 'Next Visit Required' && treatment.nextVisitDate) {
              const nextVisitDate = new Date(treatment.nextVisitDate);
              const istNextVisitDate = new Date(nextVisitDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
              istNextVisitDate.setHours(0, 0, 0, 0);
              return istNextVisitDate.getTime() === istToday.getTime();
            }
            return false;
          })
        );
      case 'futureAppointments':
        return patientList.filter(patient => 
          (patient.treatments || []).some(treatment => {
            if (treatment.treatmentStatus === 'Next Visit Required' && treatment.nextVisitDate) {
              const nextVisitDate = new Date(treatment.nextVisitDate);
              const istNextVisitDate = new Date(nextVisitDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
              istNextVisitDate.setHours(0, 0, 0, 0);
              return istNextVisitDate.getTime() > istToday.getTime();
            }
            return false;
          })
        );
      default:
        return patientList;
    }
  };

  const displayedPatients = filterPatientsByDate(patients);
  let finalDisplayedPatients = filterPatientsByTab(displayedPatients);

  // Sort by patient.updatedAt in descending order
  finalDisplayedPatients = finalDisplayedPatients.sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  });

  useEffect(() => {
    if (finalDisplayedPatients.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      let todayTotal = 0;
      let monthTotal = 0;
      let todayCash = 0;
      let todayOnline = 0;
      let monthCash = 0;
      let monthOnline = 0;

      finalDisplayedPatients.forEach(patient => {
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
  }, [finalDisplayedPatients]);

  if (loading) {
    return <div className="container mt-5">Loading owner data...</div>;
  }

  if (error) {
    return <div className="container mt-5 alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-3">Owner&apos;s Dashboard</h1>

      <div className="mb-3">
        <label htmlFor="dateFilter" className="form-label">Filter by Date:</label>
        <select
          className="form-select mb-2"
          id="dateFilter"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
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
                  setDateFilter('custom');
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
                  setDateFilter('custom');
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-around mb-3 amount-cards-container"> {/* Flex container for amounts */}
        <div className="card flex-fill mx-1 p-1 today-amount-card"> {/* flex-fill and reduced padding/margin */}
          <div className="card-body text-center p-2"> {/* Reduced padding */}
            <h6 className="m-0 text-white">Today&apos;s Collected: ₹{todayAmountCollected.toLocaleString()}</h6>
            <div className="d-flex justify-content-center gap-2 mt-2">
              <span className="amount-detail">Cash: ₹{todayCashCollected.toLocaleString()}</span>
              <span className="amount-detail">Online: ₹{todayOnlineCollected.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card flex-fill mx-1 p-1 month-amount-card"> {/* flex-fill and reduced padding/margin */}
          <div className="card-body text-center p-2"> {/* Reduced padding */}
            <h6 className="m-0 text-white">This Month&apos;s Collected: ₹{monthAmountCollected.toLocaleString()}</h6>
            <div className="d-flex justify-content-center gap-2 mt-2">
              <span className="amount-detail">Cash: ₹{monthCashCollected.toLocaleString()}</span>
              <span className="amount-detail">Online: ₹{monthOnlineCollected.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('all')}
        >
          All Patients
        </button>
        <button
          className={`btn ${activeTab === 'todayAppointments' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('todayAppointments')}
        >
          Today&apos;s Appointments
        </button>
        <button
          className={`btn ${activeTab === 'futureAppointments' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('futureAppointments')}
        >
          Future Appointments
        </button>
      </div>

      <h2 className="mb-3">Patient List</h2>

      {finalDisplayedPatients.length === 0 ? (
        <p>No patients to display for the selected filter.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-sm">
            <thead>
              <tr><th>Name</th><th>Contact Number</th><th>Enquiry Type</th><th>Date of Birth</th><th>Gender</th><th>Address</th><th>Registration Date</th><th>Last Treated</th><th>Total Treatments Done</th><th>Treatments Done</th><th>Amount Collected</th><th>Next Visit Date</th><th>Doctor Name(s)</th>{/* New Column */}</tr>
            </thead>
            <tbody>
              {finalDisplayedPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.name}</td>
                  <td>{patient.contactNumber}</td>
                  <td>{patient.isNewEnquiry ? 'New Enquiry' : 'Old Enquiry'}</td>
                  <td>{new Date(patient.dateOfBirth).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.address}</td>
                  <td>{new Date(patient.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })}</td>
                  <td>
                    {patient.treatments && patient.treatments.length > 0
                      ? new Date(Math.max(...patient.treatments.map(t => new Date(t.updatedAt))))
                          .toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' })
                      : 'N/A'}
                  </td>
                  <td>{patient.treatmentCountAtLeadOpen}</td>
                  <td>
                    {(patient.treatments || []).filter(t => t.treatmentStatus === 'Complete').length}
                  </td>
                  <td>
                    ₹{(patient.treatments || []).reduce((sum, t) => sum + (t.amountToCollect || 0), 0).toLocaleString()}
                  </td>
                  <td>
                    {(patient.treatments || [])
                      .filter(t => t.treatmentStatus === 'Next Visit Required' && t.nextVisitDate)
                      .map(t => new Date(t.nextVisitDate).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }))
                      .join(', ')}
                  </td>
                  <td>
                    {/* Display doctor names */}
                    {Array.from(new Set((patient.treatments || []).map(t => t.doctorName)))
                      .filter(Boolean)
                      .join(', ')}
                  </td>
                </tr>
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
