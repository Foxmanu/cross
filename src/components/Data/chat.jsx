import duration from "dayjs/plugin/duration";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, Button, DatePicker, Select, Spin } from "antd"; // <-- Add Spin
import { ReloadOutlined } from "@ant-design/icons";
const Chat=({chartData})=>{
    console.log("Chat component received data:", chartData);
      const [pageIndex, setPageIndex] = useState(0);
    const itemsPerPage = 5;
  const paginatedChartData = chartData.slice(
    pageIndex * itemsPerPage,
    (pageIndex + 1) * itemsPerPage
  );

    return (
        <>
              <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 10,
                  }}
                >
                  <Button
                    type="primary"
                    onClick={() =>
                      setPageIndex((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={pageIndex === 0}
                    style={{ marginRight: 10 }}
                  >
                    Previous
                  </Button>
                  <Button
                    type="primary"
                    onClick={() =>
                      setPageIndex((prev) =>
                        (prev + 1) * itemsPerPage < chartData.length
                          ? prev + 1
                          : prev
                      )
                    }
                    disabled={
                      (pageIndex + 1) * itemsPerPage >= chartData.length
                    }
                  >
                    Next
                  </Button>
                </div>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={paginatedChartData}
                      margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date"  interval={0}
                      angle={-40}
                      textAnchor="end"
                      height={60}/>

                      
                      <YAxis
                        tickFormatter={(min) => {
                          const hours = Math.floor(min / 60);
                          const mins = min % 60;
                          return `${hours}h ${mins}m`;
                        }}
                        label={{
                          value: "Duration",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(min) => {
                          const h = Math.floor(min / 60);
                          const m = min % 60;
                          return `${h}h ${m}m`;
                        }}
                      />
                      <Bar
                        dataKey="duration"
                        fill="#2b4e79ff"
                        name="Total Duration"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div></>
    );
}
export default Chat;