import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) disabled:opacity-50 hover:bg-(--color-base-200) transition-colors"
      >
        Previous
      </button>
      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            currentPage === page
              ? "bg-(--color-primary) text-white font-semibold"
              : "border border-(--color-base-300) text-(--color-neutral) hover:bg-(--color-base-200)"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 border border-(--color-base-300) rounded-md text-sm text-(--color-neutral) disabled:opacity-50 hover:bg-(--color-base-200) transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
