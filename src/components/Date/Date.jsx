import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import "./Date.css";

const Date = ({ setDateRange }) => {
  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState(dayjs().endOf("day"));
  const [activeTab, setActiveTab] = useState("today");

  const computeShortcutForRange = (s, e) => {
    const today = dayjs();
    if (s.isSame(today.startOf("day")) && e.isSame(today.endOf("day"))) return "today";
    if (
      s.isSame(today.subtract(6, "day").startOf("day")) &&
      e.isSame(today.endOf("day"))
    )
      return "week";
    if (
      s.isSame(today.subtract(29, "day").startOf("day")) &&
      e.isSame(today.endOf("day"))
    )
      return "month";
    return null;
  };

  const handleShortcutClick = (type) => {
    setActiveTab(type);
    const today = dayjs();
    if (type === "today") {
      setStartDate(today.startOf("day"));
      setEndDate(today.endOf("day"));
    } else if (type === "week") {
      setStartDate(today.subtract(6, "day").startOf("day"));
      setEndDate(today.endOf("day"));
    } else if (type === "month") {
      setStartDate(today.subtract(29, "day").startOf("day"));
      setEndDate(today.endOf("day"));
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      const shortcut = computeShortcutForRange(startDate, endDate);
      // set activeTab to matching shortcut or null for custom ranges
      setActiveTab(shortcut);
      const range = {
        startDate: startDate.format("YYYY-MM-DD HH:mm:ss"),
        endDate: endDate.format("YYYY-MM-DD HH:mm:ss"),
        shortcut, // "today" | "week" | "month" | null
        compact: shortcut === "week",
      };
      setDateRange(range);
    }
  }, [startDate, endDate, setDateRange]);

  return (
    <div className="date-selector-container1">
      {/* Shortcut Tabs Card */}
      <div className="custom-card shortcut-tabs-card">
        <div className="shortcut-tabs">
          <button
            className={`shortcut-tab${activeTab === "today" ? " active" : ""}`}
            onClick={() => handleShortcutClick("today")}
            type="button"
          >
            Today
          </button>
          <button
            className={`shortcut-tab${activeTab === "week" ? " active" : ""}`}
            onClick={() => handleShortcutClick("week")}
            type="button"
          >
            7 Days
          </button>
          <button
            className={`shortcut-tab${activeTab === "month" ? " active" : ""}`}
            onClick={() => handleShortcutClick("month")}
            type="button"
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Date Pickers Card */}
      <div className="custom-card date-pickers-card">
        <div className="date-row">
          <div className="date-column">
            <label className="date-label">Start Date</label>
            <DatePicker
              className="range-picker"
              value={startDate}
              onChange={(date) => {
                if (!date) return;
                setStartDate(date.startOf("day"));
              }}
              allowClear={false}
            />
          </div>
          <div className="date-column">
            <label className="date-label">End Date</label>
            <DatePicker
              className="range-picker"
              value={endDate}
              onChange={(date) => {
                if (!date) return;
                setEndDate(date.endOf("day"));
              }}
              allowClear={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Date;