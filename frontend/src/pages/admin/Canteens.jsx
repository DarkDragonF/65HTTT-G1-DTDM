import { useState, useEffect, useCallback } from 'react';
import { getAdminCanteensList, approveCanteen, suspendCanteen } from '../../api/adminApi';
import { useNotification } from '../../hooks/useNotification';
import './Canteens.css';

const Canteens = () => {
  const { showToast, confirm } = useNotification();
  const [canteens, setCanteens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadCanteens = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminCanteensList({
        search: search || undefined,
        status: statusFilter || undefined
      });
      setCanteens(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load canteens list:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadCanteens();
    }, 450);
    return () => clearTimeout(delayDebounce);
  }, [loadCanteens]);

  const handleApprove = async (id, name) => {
    const isAccepted = await confirm(
      'Approve Canteen',
      `Are you sure you want to approve canteen "${name}"? This will activate the canteen and generate a contract.`
    );
    if (!isAccepted) return;

    setIsLoading(true);
    try {
      await approveCanteen(id);
      showToast(`Canteen "${name}" approved and active!`, 'success');
      await loadCanteens();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error approving canteen.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async (id, name) => {
    const isAccepted = await confirm(
      'Suspend Canteen',
      `Are you sure you want to suspend canteen "${name}"?`
    );
    if (!isAccepted) return;

    setIsLoading(true);
    try {
      await suspendCanteen(id);
      showToast(`Canteen "${name}" suspended.`, 'warning');
      await loadCanteens();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error suspending canteen.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-canteens-view">
      <div className="canteens-header">
        <h3>Canteens Approval & Operations</h3>
        <p>Review new canteen registration proposals, authorize vendors, and inspect generated contracts.</p>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by canteen name, description, or owner..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div className="select-filters">
          <div className="filter-group">
            <label>Filter by Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active / Approved</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Canteens Table/Grid */}
      {isLoading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Retrieving merchant registries...</p>
        </div>
      ) : canteens.length === 0 ? (
        <div className="empty-results-card">
          <p>No canteens matched the search criteria.</p>
        </div>
      ) : (
        <div className="canteens-table-card">
          <table className="canteens-data-table">
            <thead>
              <tr>
                <th>Canteen Profile</th>
                <th>Owner Details</th>
                <th>Status</th>
                <th>Contract Status</th>
                <th>Administrative Controls</th>
              </tr>
            </thead>
            <tbody>
              {canteens.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="canteen-cell-profile">
                      <div className="canteen-cell-logo">🏢</div>
                      <div className="canteen-cell-info">
                        <strong>{c.name}</strong>
                        <span>{c.description || 'No description provided'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="owner-cell-info">
                      <strong>{c.owner?.full_name || `Owner #${c.owner_id}`}</strong>
                      <span>{c.owner?.email}</span>
                      <span>{c.owner?.phone || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge-custom ${c.status}`}>
                      {c.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="contract-cell-status">
                      {c.contracts && c.contracts.length > 0 ? (
                        <>
                          <span className={`contract-badge ${c.contracts[0].status}`}>
                            📄 {c.contracts[0].status?.toUpperCase()}
                          </span>
                          <span className="contract-date">
                            {new Date(c.contracts[0].created_at).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <span className="no-contract-badge">No Contract</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions-buttons-cell">
                      {c.status === 'pending' && (
                        <button 
                          className="btn-action-approve" 
                          onClick={() => handleApprove(c.id, c.name)}
                        >
                          ✔️ Approve & Sign
                        </button>
                      )}
                      {c.status === 'active' && (
                        <button 
                          className="btn-action-suspend" 
                          onClick={() => handleSuspend(c.id, c.name)}
                        >
                          ⚠️ Suspend Canteen
                        </button>
                      )}
                      {c.status === 'suspended' && (
                        <button 
                          className="btn-action-approve" 
                          onClick={() => handleApprove(c.id, c.name)}
                        >
                          ✔️ Restore & Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Canteens;
