import React, { useState, useEffect } from "react"
import { getStudyTrend } from "../api/user.js"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function SubjectRecord({ type, start, end, userId }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStudyData = async () => {
            setLoading(true)
            try {
                if (start && end && userId) {
                    const record = await getStudyTrend(type, start, end, userId)
                    setData(record.data || [])
                }
            } catch (error) {
                console.error("공부 시간 추이 조회 실패:", error)
                setData([])
            } finally {
                setLoading(false)
            }
        };

        fetchStudyData()
    }, [type, start, end, userId])

    if (loading) {
        return <div style={{ padding: "20px 0", color: "#666" }}>데이터를 불러오는 중입니다...</div>;
    }

    if (data.length === 0) {
        return <div style={{ padding: "20px 0", color: "#666" }}>해당 기간의 공부 기록이 없습니다.</div>;
    }

    return (
        <div style={{ width: "100%", height: "300px", marginTop: "20px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginBottom: "15px", fontSize: "16px", color: "#333", margin: "0 0 15px 0" }}>
                총 공부 시간 추이
            </h3>
            
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                    
                    <XAxis 
                        dataKey="label" 
                        tick={{ fill: "#888", fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10} 
                    />
                    
                    <YAxis 
                        tick={{ fill: "#888", fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    
                    <Tooltip 
                        formatter={(value) => [`${value}분`, "공부 시간"]}
                        labelStyle={{ color: "#333", fontWeight: "bold", marginBottom: "5px" }}
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                    />
                    
                    <Line 
                        type="monotone"
                        dataKey="studyTime"
                        stroke="#7E57C2"
                        strokeWidth={3} 
                        dot={{ r: 4, fill: "#7E57C2", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}