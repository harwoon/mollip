import { useState, useEffect } from "react"
import { HexColorPicker } from "react-colorful"
import { createGroup, updateGroup } from "../api/group"
import "./GroupForm.css"

export default function GroupForm({ mode, group, onSuccess, onCancel }) {
    const [groupName, setGroupName] = useState("")
    const [groupColor, setGroupColor] = useState("#FFFFFF")
    const [groupTime, setGroupTime] = useState("")
    const [showPicker, setShowPicker] = useState(false)
    const [error, setError] = useState("")

    // 그룹 수정 시 기본 값 가져오기
    useEffect(() => {
        if(mode === "edit" && group) {
            setGroupName(group.groupName)
            setGroupColor(group.groupColor)
            setGroupTime(group.groupTime)
        } else {
            setGroupName("")
            setGroupColor("#FFFFFF")
            setGroupTime("")
        }
        setError("")
    }, [mode, group])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            if (mode === "edit") {
                await updateGroup(group._id, { groupName, groupColor, groupTime: Number(groupTime)})
                alert("그룹이 수정되었습니다.")
            } else {
                await createGroup({ groupName, groupColor, groupTime: Number(groupTime)})
                alert("그룹이 생성되었습니다.")
            }
            onSuccess()
        } catch (err) {
            setError(err.message)
            alert(mode === "edit" ? "그룹 수정에 실패했습니다." : "그룹 생성에 실패했습니다.")
        }
    }

    return (
        <form className="groupForm" onSubmit={handleSubmit}>
            <h2>{mode === "edit" ? "그룹 수정하기" : "그룹 생성하기"}</h2>
            <div>
                그룹명
                <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="그룹명을 입력하세요."/>
            </div>
            <div className="colorField">
                그룹 대표 컬러
                <div className="colorFieldRow">
                    <button
                        type="button"
                        className="colorSwatch"
                        style={{ backgroundColor: groupColor }}
                        onClick={() => setShowPicker(prev => !prev)}
                    />
                    <span>{groupColor}</span>
                </div>
                {showPicker && (
                    <div className="colorPickerPopover">
                        <HexColorPicker color={groupColor} onChange={setGroupColor} />
                    </div>
                )}
            </div>
            <div>
                그룹 조건 시간(h)
                <input type="number" min="0" value={groupTime} onChange={(e) => setGroupTime(e.target.value)} placeholder="그룹 조건 시간을 입력하세요."/>
            </div>
            <div>
                <button type="button" onClick={onCancel}>
                    취소
                </button>
                <button type="submit">
                    {mode === "edit" ? "수정완료" : "그룹 생성"}
                </button>
            </div>
        </form>
    )
}
