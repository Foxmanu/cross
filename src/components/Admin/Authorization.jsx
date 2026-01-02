import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import Date from "../Date/Date";
import { getApiEndpoint } from "../../utils/apiConfig";
import { unAiuthorize } from "../../utils/adminapi";
import "./Admin.css";

const Authorization = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const [dateRange, setDateRange] = useState({ startDate: today, endDate: today });
  const [data, setData] = useState([]); // [{ unauth_number, first_seen, last_seen, total_time }]
  const [loading, setLoading] = useState(false);

;

  const extractUnauthorized = (respData) => {
    const out = [];
    if (!Array.isArray(respData)) return out;
    respData.forEach((day) => {
      const people = day.people || {};
      Object.values(people).forEach((p) => {
        if (p && p.unauth_number) {
          out.push({
            unauth_number: p.unauth_number,
            first_seen: p.first_seen || p.recent_first_seen || "—",
            last_seen: p.last_seen || "—",
            total_time: p.total_time || "—",
          });
        }
      });
    });
    return out;
  };

  const fetchPeople = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    // try {
    //   setLoading(true);
    //   const resp = await axios.get(getApiEndpoint("/api/people"), {
    //     params: { startDate: dateRange.startDate, endDate: dateRange.endDate },
    //   });
    //   setData(extractUnauthorized(resp.data));
    // } catch (err) {
    //   console.error("fetch people error", err);
    //   setData([]);
    // } finally {
    //   setLoading(false);
    // }
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;
    unAiuthorize(setError, setData, setLoading, startDate, endDate);
   

  };

  useEffect(() => {
    fetchPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  return (
    <div className="auth-page">
      {/* Date Picker Section */}
      <div className="date-wrapper">
        <Date setDateRange={setDateRange} />
      </div>

      {/* Unauthorized Summary Section */}
      <div className="auth-section">
        <h2 className="auth-heading">Unauthorized Person</h2>
        
        {/* Loading Indicator */}
        {loading && (
          <div className="loading-box" role="status" aria-live="polite">
            <svg className="loading-spinner" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="spinner-bg" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="spinner-fg" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
            </svg>
            <span>Fetching records...</span>
          </div>
        )}

        {/* No Data Message */}
        {!loading && data.length === 0 && (
          <div className="empty-box">
            <p className="empty-title">No Records Found</p>
            <p className="empty-text">There are no unauthorized access records for the selected date range.</p>
          </div>
        )}

        {/* Data List */}
        <div className="auth-list" aria-live="polite">
          {!loading && data.map((it, idx) => (
            <article
              key={idx}
              className="auth-card"
              tabIndex={0}
              aria-label={it.unauth_number}
            >
              <div className="indicator-bar" aria-hidden="true" />
              <div className="card-content">
                <div className="title-row">
                  <div className="card-title">
                    <svg className="alert-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 9v2m0 4h.01M4 16a1 1 0 001 1h14a1 1 0 001-1L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4 16z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="title-text">{it.unauth_number}</span>
                  </div>
                  <div className="total-badge">{it.total_time}</div>
                </div>

                <div className="times-grid">
                  <div className="time-item">
                    <div className="time-label">First Seen:</div>
                    <div className="time-value">{it.first_seen}</div>
                  </div>
                  <div className="time-item">
                    <div className="time-label">Last Seen:</div>
                    <div className="time-value">{it.last_seen}</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Authorization;