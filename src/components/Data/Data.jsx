import React, { useState } from "react"; // Import useState hook
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { Card, Button, DatePicker, Select, Spin } from "antd"; // <-- Add Spin
import { ReloadOutlined } from "@ant-design/icons";
import  Chat from "./chat.jsx";
import ErrorBoundary from "../ErrorBoundary.jsx";
import "./Data.css";

const { Option } = Select;
dayjs.extend(duration);

const Data = ({ data, loading, onRefresh, onOptionChange }) => { // <-- Add loading prop
  const [activeTab, setActiveTab] = useState("events");
  // const [pageIndex, setPageIndex] = useState(0);

  // const itemsPerPage = 5;

  if (loading) {
    return (
      <div className="data-loading-spinner" style={{ textAlign: "center", padding: "2em" }}>
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  if (!Array.isArray(data)) {
    return (
      <div className="no-data-message">
        <p>No data available</p>
      </div>
    );
  }
  const chartData = data.map((day) => {
    
    let totalMinutes = 0;

    day.records?.forEach((record) => {
      if (record.entry && record.exit) {
        const entry = dayjs(`2025-01-01T${record.entry}`);
        const exit = dayjs(`2025-01-01T${record.exit}`);
        const diff = exit.diff(entry, "minute");
        if (!isNaN(diff) && diff >= 0) {
          totalMinutes += diff;
        }
      }
    });

    return {
      date: dayjs(day.date).format("DD MMM"),
      duration: totalMinutes,
    };
  });

  let totalLogins = 0;
  let totalMinutes = 0;

  data.forEach((day) => {
    day.records?.forEach((record) => {
      if (record.entry) {
        totalLogins += 1; // Count login if entry exists

        if (record.exit) {
          const entry = dayjs(`2025-01-01T${record.entry}`);
          const exit = dayjs(`2025-01-01T${record.exit}`);
          const diff = exit.diff(entry, "minute");

          if (!isNaN(diff) && diff >= 0) {
            totalMinutes += diff;
          }
        }
      }
    });
  });

  const totalHours = Math.floor(totalMinutes / 60) || 0;

  const remainingMinutes = totalMinutes % 60 || 0;

  const totalDurationStr = `${totalHours}h ${remainingMinutes}m`;

  return (
    <div className="container1">
      <div className="card-summary-container">
        <div className="card login-card">
          <p className="card-label">Total Logins</p>
          <h1 className="card-value blue-text">{totalLogins}</h1>
        </div>

        <div className="card duration-card">
          <p className="card-label">Total Duration</p>
          <h1 className="card-value green-text">{totalDurationStr}</h1>
        </div>
      </div>

      <div className="tab-container">
        <div className="tab-buttons-wrapper">
          <button
            className={`tab-button ${activeTab === "events" ? "active-tab" : ""
              }`}
            onClick={() => setActiveTab("events")}
          >
            Events
          </button>
          <button
            className={`tab-button ${activeTab === "insights" ? "active-tab" : ""
              }`}
            onClick={() => setActiveTab("insights")}
          >
            Insights
          </button>
          {/* Refresh icon */}
          <button
            className="tab-refresh-btn"
            onClick={onRefresh}
            style={{
              background: "transparent",
              border: "none",
              marginLeft: "8px",
              cursor: "pointer",
              fontSize: "22px",
              display: "flex",
              alignItems: "center",
              color: "#4f6ef7",
            }}
            title="Refresh"
          >
            <ReloadOutlined />
          </button>
        </div>

        {activeTab === "events" && (
          <div className="tab-content">
            {data.length === 0 ? (
              <p className="no-records-message">No records to display.</p>
            ) : (
              <ul className="daily-record-list">
                {data
                  .sort((a, b) => dayjs(b.date) - dayjs(a.date))
                  .map((day) => (
                    <li key={day.date} className="daily-record-item">
                      <div className="daily-record-header">
                        <strong className="record-date">{day.date}:</strong>

                        {Array.isArray(day.records) &&
                          day.records.length > 0 &&
                          (console.log(
                            "day records (reverse)",
                            day.records.slice().reverse()
                          ),
                            (
                              <span className="daily-total-duration">
                                Total:{" "}
                                {(() => {
                                  let dayMinutes = 0;
                                  day.records.forEach((record) => {
                                    if (record.entry && record.exit) {
                                      const entry = dayjs(
                                        `2025-01-01T${record.entry}`
                                      );
                                      const exit = dayjs(
                                        `2025-01-01T${record.exit}`
                                      );
                                      const diff = exit.diff(entry, "minute");
                                      if (!isNaN(diff) && diff >= 0) {
                                        dayMinutes += diff;
                                      }
                                    }
                                  });

                                  const dayHours = Math.floor(dayMinutes / 60);
                                  const dayRemainingMinutes = dayMinutes % 60;
                                  return `${dayHours}h ${dayRemainingMinutes}m`;
                                })()}
                              </span>
                            ))}
                      </div>
                      {Array.isArray(day.records) && day.records.length > 0 ? (
                        <ul className="individual-record-list">
                          {day.records
                            .slice()
                            .reverse()
                            .map((record, index) => {
                              const hasValidEntry = !!record.entry;
                              const hasValidExit = !!record.exit;

                              let recordDurationStr = "-";

                              if (hasValidEntry && hasValidExit) {
                                const entryTime = dayjs(
                                  `2025-01-01T${record.entry}`
                                );
                                const exitTime = dayjs(
                                  `2025-01-01T${record.exit}`
                                );
                                const recordDiffMinutes = exitTime.diff(
                                  entryTime,
                                  "minute"
                                );

                                if (
                                  !isNaN(recordDiffMinutes) &&
                                  recordDiffMinutes >= 0
                                ) {
                                  const recordHours = Math.floor(
                                    recordDiffMinutes / 60
                                  );
                                  const recordMinutes = recordDiffMinutes % 60;
                                  recordDurationStr = `${recordHours}h ${recordMinutes}m`;
                                } else {
                                  recordDurationStr = "-";
                                }
                              }

                              return (
                                <li
                                  key={index}
                                  className="individual-record-card"
                                >
                                  <div className="record-row">
                                    <div className="record-cell entry-cell">
                                      <div className="detail-label">Entry</div>
                                      <div className="detail-value">
                                        {record.entry || "-"}
                                      </div>
                                    </div>
                                    <div className="record-cell exit-cell">
                                      <div className="detail-label">Exit</div>
                                      <div className="detail-value">
                                        {record.exit || "-"}
                                      </div>
                                    </div>
                                    <div className="record-cell duration-cell">
                                      <div className="detail-label">
                                        Duration
                                      </div>
                                      <div className="detail-value">
                                        {recordDurationStr}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      ) : (
                        <span className="no-records-day">
                          No records for this day.
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div className="tab-content">
            {/* <div className="tab-content"> */}

            {chartData.length === 0 ? (
              <p  className="no-records-message">No data for insights.</p>
            ) : (
              <>
              <ErrorBoundary><Chat chartData={chartData} /></ErrorBoundary>
             
              </>
            )}
          </div>
          // </div>
        )}
      </div>
    </div>
  );
};

export default Data;