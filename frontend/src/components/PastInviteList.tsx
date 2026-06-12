import { useEffect, useState } from 'react';
import { fetchInvites } from '../api/client';
import { InviteSummary } from '../types';
import { InviteCard } from './InviteCard';

const PAGE_SIZE = 5;

export function PastInviteList() {
  const [invites, setInvites] = useState<InviteSummary[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    loadInvites(page);
  }, [page]);

  const loadInvites = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvites(pageNum, PAGE_SIZE);
      setInvites(data.invites);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invites.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="past-invites">
      <h2>Past invites</h2>

      {loading && <div className="loading">Loading invites...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && total === 0 && (
        <div className="empty-state">
          <p>No invites yet. Create your first one!</p>
        </div>
      )}

      {!loading && !error && invites.length > 0 && (
        <>
          <div className="invite-grid">
            {invites.map((invite) => (
              <InviteCard key={invite.id} invite={invite} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Past invites pages">
              <button
                type="button"
                className="pagination-button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination-button${pageNum === page ? ' pagination-button-active' : ''}`}
                  onClick={() => setPage(pageNum)}
                  aria-current={pageNum === page ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                className="pagination-button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
