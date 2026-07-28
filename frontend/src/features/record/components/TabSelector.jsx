import React from 'react'

export default function TabSelector({ currentType, onChangeType }) {
  return (
    <div>
      <button 
        className={`tab-btn ${currentType === 'daily' ? 'active' : ''}`}
        onClick={() => onChangeType('daily')}
      >
        일간
      </button>
      <button 
        className={`tab-btn ${currentType === 'weekly' ? 'active' : ''}`}
        onClick={() => onChangeType('weekly')}
      >
        주간
      </button>
      <button 
        className={`tab-btn ${currentType === 'monthly' ? 'active' : ''}`}
        onClick={() => onChangeType('monthly')}
      >
        월간
      </button>
    </div>
  )
}