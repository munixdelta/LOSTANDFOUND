import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const [items, setItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('Lost')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName')

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/items`, config)
      setItems(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchItems()
      return
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/items/search?name=${searchQuery}`, config
      )
      setItems(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const itemData = { itemName, description, type, location, date, contactInfo }

    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/items/${editingId}`, itemData, config)
        setEditingId(null)
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/items`, itemData, config)
      }
      clearForm()
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong')
    }
  }

  const clearForm = () => {
    setItemName('')
    setDescription('')
    setType('Lost')
    setLocation('')
    setDate('')
    setContactInfo('')
    setEditingId(null)
  }

  const handleEdit = (item) => {
    setEditingId(item._id)
    setItemName(item.itemName)
    setDescription(item.description)
    setType(item.type)
    setLocation(item.location)
    setDate(item.date)
    setContactInfo(item.contactInfo)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/items/${id}`, config)
        fetchItems()
      } catch (err) {
        console.log(err)
      }
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Campus Lost & Found</h2>
        <div>
          <span className="me-3">Welcome, {userName}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Add / Edit Item Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>{editingId ? 'Edit Item' : 'Report Lost/Found Item'}</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Item Name</label>
                <input type="text" className="form-control" value={itemName}
                  onChange={(e) => setItemName(e.target.value)} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Type</label>
                <select className="form-select" value={type}
                  onChange={(e) => setType(e.target.value)}>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="2" value={description}
                onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" value={location}
                  onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={date}
                  onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Contact Info</label>
                <input type="text" className="form-control" value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-success me-2">
              {editingId ? 'Update' : 'Submit'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={clearForm}>
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Search */}
      <div className="input-group mb-4">
        <input type="text" className="form-control" placeholder="Search by item name..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        <button className="btn btn-outline-secondary"
          onClick={() => { setSearchQuery(''); fetchItems(); }}>Clear</button>
      </div>

      {/* Items List */}
      <div className="row">
        {items.length === 0 && (
          <p className="text-center text-muted">No items found.</p>
        )}
        {items.map((item) => (
          <div className="col-md-6 mb-3" key={item._id}>
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h5 className="card-title">{item.itemName}</h5>
                  <span className={`badge ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>
                    {item.type}
                  </span>
                </div>
                <p className="card-text">{item.description}</p>
                <p className="mb-1"><strong>Location:</strong> {item.location}</p>
                <p className="mb-1"><strong>Date:</strong> {item.date}</p>
                <p className="mb-1"><strong>Contact:</strong> {item.contactInfo}</p>
                <p className="mb-2 text-muted">
                  <small>Posted by: {item.user?.name || 'Unknown'}</small>
                </p>
                {item.user?._id === userId && (
                  <div>
                    <button className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
