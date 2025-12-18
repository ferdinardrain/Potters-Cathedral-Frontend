import { useMemo, useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { memberService } from '../services/memberService'
import PageLayout from '../components/layout/PageLayout'
import './overview.css'

const Overview = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const prevPathnameRef = useRef(location.pathname)

  const loadMembers = async () => {
    try {
      setLoading(true)
      // Load all members without filters for overview stats
      const data = await memberService.fetchMembers({})
      setMembers(data)
    } catch (err) {
      // Suppress errors for overview
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load members on mount
    loadMembers()

    // Listen for storage changes (when members are deleted/added)
    const handleStorageChange = (e) => {
      if (e.key === 'church_members') {
        loadMembers()
      }
    }

    // Listen for custom events (for same-tab updates)
    const handleMemberUpdate = () => {
      loadMembers()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('memberUpdated', handleMemberUpdate)

    // Reload when navigating to overview page
    const pathnameChanged = prevPathnameRef.current !== location.pathname
    if (pathnameChanged && location.pathname === '/overview') {
      loadMembers()
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
        loadMembers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const stats = useMemo(() => {
    const kids = members.filter((member) => Number(member.age) <= 18).length
    const adults = members.filter((member) => Number(member.age) > 18).length
    const singles = members.filter((member) => 
      member.maritalStatus?.toLowerCase() === 'single'
    ).length
    const married = members.filter((member) => 
      member.maritalStatus?.toLowerCase() === 'married'
    ).length
    const widows = members.filter((member) => 
      member.maritalStatus?.toLowerCase() === 'widowed'
    ).length

    return {
      kids,
      adults,
      singles,
      married,
      widows,
      total: members.length,
    }
  }, [members])

  const statCards = [
    {
      title: 'Total Members',
      value: stats.total,
      description: 'All registered church members',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      isTotal: true,
    },
    {
      title: 'Kids',
      value: stats.kids,
      description: 'Members aged 18 and below',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      title: 'Adults',
      value: stats.adults,
      description: 'Members above 18 years',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    {
      title: 'Singles',
      value: stats.singles,
      description: 'Single members',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    {
      title: 'Married',
      value: stats.married,
      description: 'Married members',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      title: 'Widows',
      value: stats.widows,
      description: 'Widowed members',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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

