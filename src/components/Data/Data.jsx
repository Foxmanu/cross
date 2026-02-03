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
    
    let totalSeconds = 0;

    day.records?.forEach((record) => {
      if (record.entry && record.exit) {
        const entry = dayjs(`2025-01-01T${record.entry}`);
        const exit = dayjs(`2025-01-01T${record.exit}`);
        const diff = exit.diff(entry, "second");
        if (!isNaN(diff) && diff >= 0) {
          totalSeconds += diff;
        }
      }
    });

    return {
      date: dayjs(day.date).format("DD MMM"),
      duration: totalSeconds,
    };
  });

  let totalLogins = 0;
  let totalSeconds = 0;

  data.forEach((day) => {
    day.records?.forEach((record) => {
      if (record.entry) {
        totalLogins += 1; // Count login if entry exists

        if (record.exit) {
          const entry = dayjs(`2025-01-01T${record.entry}`);
          const exit = dayjs(`2025-01-01T${record.exit}`);
          const diff = exit.diff(entry, "second");

          if (!isNaN(diff) && diff >= 0) {
            totalSeconds += diff;
          }
        }
      }
    });
  });

  const totalHours = Math.floor(totalSeconds / 3600) || 0;
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60) || 0;
  const remainingSeconds = totalSeconds % 60 || 0;


  const totalDurationStr = `${totalHours}h ${remainingMinutes}m ${remainingSeconds}s`;

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
                                  let daySeconds = 0;
                                  day.records.forEach((record) => {
                                    if (record.entry && record.exit) {
                                      const entry = dayjs(
                                        `2025-01-01T${record.entry}`
                                      );
                                      const exit = dayjs(
                                        `2025-01-01T${record.exit}`
                                      );
                                      const diff = exit.diff(entry, "second");
                                      if (!isNaN(diff) && diff >= 0) {
                                        daySeconds += diff;
                                      }
                                    }
                                  });

                                  const dayHours = Math.floor(daySeconds / 3600);
                                  const dayRemainingMinutes = Math.floor((daySeconds % 3600) / 60);
                                  const dayRemainingSeconds = daySeconds % 60;
                                  
                                  return `${dayHours}h ${dayRemainingMinutes}m ${dayRemainingSeconds}s`;
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
                                const recordDiffSeconds = exitTime.diff(
                                  entryTime,
                                  "second"
                                );

                                if (
                                  !isNaN(recordDiffSeconds) &&
                                  recordDiffSeconds >= 0
                                ) {
                                  const recordHours = Math.floor(
                                    recordDiffSeconds / 3600
                                  );
                                  const recordMinutes = Math.floor((recordDiffSeconds % 3600) / 60);
                                  const recordSeconds = recordDiffSeconds % 60;
                                  recordDurationStr = `${recordHours}h ${recordMinutes}m ${recordSeconds}s`;
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