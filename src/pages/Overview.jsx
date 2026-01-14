import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { memberService } from '../services/memberService'
import PageLayout from '../components/layout/PageLayout'
import './overview.css'

const Overview = () => {
  const [stats, setStats] = useState({
    total: 0,
    kids: 0,
    adults: 0,
    singles: 0,
    married: 0,
    widows: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const prevPathnameRef = useRef(location.pathname)

  const loadData = async () => {
    try {
      setLoading(true)
      const statsData = await memberService.fetchStats()
      setStats(statsData)
    } catch {
      // Suppress errors for overview
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load data on mount
    loadData()

    // Listen for storage changes (when members are deleted/added)
    const handleStorageChange = (e) => {
      if (e.key === 'church_members') {
        loadData()
      }
    }

    // Listen for custom events (for same-tab updates)
    const handleMemberUpdate = () => {
      loadData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('memberUpdated', handleMemberUpdate)

    // Reload when navigating to overview page
    const pathnameChanged = prevPathnameRef.current !== location.pathname
    if (pathnameChanged && location.pathname === '/overview') {
      loadData()
      prevPathnameRef.current = location.pathname
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('memberUpdated', handleMemberUpdate)
    }
  }, [location.pathname])

  // Also reload when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const statCards = [
    {
      title: 'Total Members',
      value: stats.total,
      description: 'All registered church members',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      isTotal: true,
      filters: { search: '', maritalStatus: '', minAge: '', maxAge: '' },
    },
    {
      title: 'Kids',
      value: stats.kids,
      description: 'Members aged 18 and below',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      filters: { search: '', maritalStatus: '', minAge: 0, maxAge: 18 },
    },
    {
      title: 'Adults',
      value: stats.adults,
      description: 'Members above 18 years',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      filters: { search: '', maritalStatus: '', minAge: 19, maxAge: '' },
    },
    {
      title: 'Singles',
      value: stats.singles,
      description: 'Single members',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      filters: { search: '', maritalStatus: 'single', minAge: '', maxAge: '' },
    },
    {
      title: 'Married',
      value: stats.married,
      description: 'Married members',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      filters: { search: '', maritalStatus: 'married', minAge: '', maxAge: '' },
    },
    {
      title: 'Widowed',
      value: stats.widows,
      description: 'Widowed members',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      filters: { search: '', maritalStatus: 'widowed', minAge: '', maxAge: '' },
    },
  ]

  return (
    <PageLayout title="Overview" subtitle="Church members statistics at a glance.">
      <div className="overview__grid">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`overview__card ${card.isTotal ? 'overview__card--total' : ''}`}
            style={{ background: card.gradient }}
            onClick={() => navigate('/members', { state: { filters: card.filters } })}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/members', { state: { filters: card.filters } })
              }
            }}
          >
            <h3 className="overview__card-title">{card.title}</h3>
            <p className="overview__card-value">{loading ? '...' : card.value.toLocaleString()}</p>
            <p className="overview__card-description">{card.description}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}

export default Overview

