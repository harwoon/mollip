import React, { useState, useEffect } from "react"
import { getTodoTrend } from "../api/user.js"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function TodoAchievementRecord({ type, start, end, userId }) {

    const [record, setRecord] = useState([]) 
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchTodoData = async () => {
            setLoading(true)
            setError("")
            try {
                const data = await getTodoTrend(type, start, end, userId)
                setRecord(data.data || [])
            } catch (err) {
                console.error("Todo 기록 조회 실패:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        };

        if (start && end && type) { 
            fetchTodoData()
        }
    }, [type, start, end, userId])

    if (loading) {
        return <div style={{ padding: "20px 0", color: "#666" }}>달성률을 불러오는 중입니다...</div>
    }

    if (error) {
        return <div style={{ padding: "20px 0", color: "red" }}>{error}</div>
    }

    if (record.length === 0) {
        return <div style={{ padding: "20px 0", color: "#666" }}>해당 기간의 Todo 데이터가 없습니다.</div>
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ backgroundColor: "#fff", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                    <p style={{ margin: "0 0 5px 0", fontWeight: "bold", color: "#333" }}>{label}</p>
                    <p style={{ margin: 0, color: "#7E57C2", fontWeight: "600" }}>달성률: {data.achievementRate}%</p>
                    <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "12px" }}>
                        완료: {data.completedCount}개 / 전체: {data.totalCount}개
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div style={{ width: "100%", height: "300px", marginTop: "20px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginBottom: "15px", fontSize: "16px", color: "#333", margin: "0 0 15px 0" }}>
                Todo 목표 달성률
            </h3>
            
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={record} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                    
                    <XAxis 
                        dataKey="label" 
                        tick={{ fill: "#888", fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10} 
                    />
                    
                    <YAxis 
                        domain={[0, 100]} 
                        tick={{ fill: "#888", fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(value) => `${value}%`}
                    />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                    
                    <Bar 
                        dataKey="achievementRate" 
                        fill="#7E57C2" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000} 
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}