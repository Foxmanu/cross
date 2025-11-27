import React, { useEffect, useState } from "react";
import axios from "axios";
import { getApiEndpoint } from "../../utils/apiConfig";
import "./Admin.css";

function Flag() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFlagged = async () => {
    setError("");
    setLoading(true);
    try {
      // POST as in your curl example
      const resp = await axios.post(getApiEndpoint("/flagged_persons"), {});
      if (resp.data && resp.data.success) {
        console.log("fetch flagged persons", resp.data);
        setItems(resp.data.flagged_persons || []);
      } else {
        setItems([]);
        setError("No data returned");
      }
    } catch (err) {
      console.error("fetch flagged persons", err);
      setError("Failed to load flagged persons");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  return (
    <>
      {/* Inline component styles */}
      <style>{`
        .flag-header { display:flex; align-items:center; justify-content:space-between; max-width:920px; margin:0 auto 12px; gap:12px; padding:20px; }
        .flag-title { margin:0; font-size:18px; font-weight:700; color:#0f172a; }
        .flag-refresh { background:#eef2ff; border:1px solid #e0e7ff; color:#3730a3; padding:8px 12px; border-radius:10px; cursor:pointer; font-weight:600; }
        .flag-refresh:active { transform:translateY(1px); }

        .flag-loading, .flag-empty, .flag-error { max-width:920px; margin:8px auto; padding:12px; border-radius:10px; background:#fff; box-shadow:0 8px 20px rgba(15,23,42,0.04); color:#374151; text-align:center; }
        .flag-error { border-left:4px solid #ef4444; }

        .flag-list { display:grid; grid-template-columns:1fr; gap:12px; max-width:920px; margin:8px auto 40px; padding:0 14px; }
        @media (min-width:800px) { .flag-list { grid-template-columns:repeat(2,1fr); } }

        .flag-card { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px; border-radius:14px; background:#ffffff; border:1px solid #e6eef6; box-shadow:0 10px 30px rgba(15,23,42,0.04); transition:transform 160ms ease, box-shadow 160ms ease; }
        .flag-card:active { transform:translateY(1px); }
        .flag-card-left { min-width:0; }
        .flag-name { font-weight:700; color:#0f172a; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .flag-id { font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; font-size:12px; color:#475569; margin-top:6px; }

        .flag-card-right { display:flex; gap:8px; align-items:center; }
        .flag-badge { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:700; font-size:13px; color:#0f172a; background:#eef2f2; }
        .flag-badge.flagged-true { background:linear-gradient(90deg,#fff1f2,#fee2e2); color:#b91c1c; box-shadow:0 8px 20px rgba(249,115,22,0.06); }

        @media (max-width:560px) { .flag-card { padding:12px; border-radius:12px; } .flag-title { font-size:16px; } }
      `}</style>

      <div className="flag-header">
        <h3 className="flag-title">Flagged Persons</h3>
        <button className="flag-refresh" onClick={fetchFlagged} type="button" aria-label="Refresh flagged persons">
          Refresh
        </button>
      </div>

      {loading && <div className="flag-loading">Loading flagged persons…</div>}

      {!loading && error && <div className="flag-error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="flag-empty">No flagged persons found.</div>
      )}

      <div className="flag-list" aria-live="polite">
        {!loading &&
          items.map((p, idx) => (
            <div key={`${p.name}-${idx}`} className="flag-card" role="article" tabIndex={0}>
              <div className="flag-card-left">
                <div className="flag-name">{p.name}</div>
                {/* system id removed */}
              </div>
              <div className="flag-card-right">
                <span className={`flag-badge ${p.flagged ? "flagged-true" : ""}`}>
                  {p.flagged ? "Flagged" : "OK"}
                </span>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default Flag;