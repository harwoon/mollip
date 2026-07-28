import React, { useState } from 'react'
import TotalStudy from '../features/record/components/TotalStudy.jsx'
import TabSelector from '../features/record/components/TabSelector.jsx'
import DateSelector from '../features/record/components/DateSelector.jsx'

export default function RecordPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [recordType, setRecordType] = useState("daily")

  return (
    <div>
      <div>
        <div>
          <h2>기록</h2>
          <TabSelector
            currentType={recordType}
            onChangeType={setRecordType}
          />
        </div>

        <DateSelector
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
        />
      </div>

      <TotalStudy
        selectedDate={selectedDate}
        type={recordType}
      />

    </div>
  )
}