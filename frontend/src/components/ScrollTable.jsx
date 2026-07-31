import { Fragment, useEffect, useState } from 'react';

export const TABLE_PAGE_SIZE = 5;

export function TablePagination({ page, pageSize, pageCount, total, onPageChange }) {
  if (pageCount <= 1) return null;

  return (
    <footer className="scroll-table__footer">
      <span className="scroll-table__count">
        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
      </span>
      <div className="scroll-table-pagination">
        <button
          type="button"
          className="scroll-table-pagination__btn"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="scroll-table-pagination__status">
          Page {page + 1} of {pageCount}
        </span>
        <button
          type="button"
          className="scroll-table-pagination__btn"
          disabled={page >= pageCount - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </footer>
  );
}

export default function ScrollTable({
  rows,
  renderRow,
  getRowKey,
  head,
  pageSize = TABLE_PAGE_SIZE,
  wrapClassName = '',
  tableClassName = 'table table--compact',
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const slice = rows.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [rows.length, rows.map((row, index) => getRowKey(row, index)).join('|')]);

  useEffect(() => {
    if (page > pageCount - 1) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  return (
    <>
      <div className={`table-wrap table-wrap--scroll scroll-table-wrap ${wrapClassName}`.trim()}>
        <table className={tableClassName}>
          {head}
          <tbody>
            {slice.map((row, index) => (
              <Fragment key={getRowKey(row, index)}>{renderRow(row, index)}</Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        total={rows.length}
        onPageChange={setPage}
      />
    </>
  );
}
