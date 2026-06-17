interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const getPageNumbers = (): (number | string)[] => {
        const delta = 2;
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }

        pages.push(1);

        let left = Math.max(2, currentPage - delta);
        let right = Math.min(totalPages - 1, currentPage + delta);

        if (currentPage - delta > 2) {
            pages.push('...');
        }

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        if (currentPage + delta < totalPages - 1) {
            pages.push('...');
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</button>
            {getPageNumbers().map((page, idx) => (
                <button
                    key={idx}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === currentPage}
                    style={{ fontWeight: page === currentPage ? 'bold' : 'normal' }}
                >
                    {page}
                </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
        </div>
    );
};

export default Pagination;