import { Spinner } from 'react-bootstrap';

// size: 'sm' | 'md' | 'lg'
// fullPage: centers with padding on a full container
export default function Loading({ size = 'md', variant = 'primary', text = 'Loading...', fullPage = true, className = '' }) {
  const dims = size === 'lg' ? { width: '3.5rem', height: '3.5rem' } : size === 'sm' ? { width: '1.5rem', height: '1.5rem' } : { width: '2.5rem', height: '2.5rem' };
  const Wrapper = ({ children }) => (
    fullPage ? (
      <div className={`container py-5 text-center ${className}`}>
        {children}
      </div>
    ) : (
      <div className={`text-center ${className}`}>{children}</div>
    )
  );

  return (
    <Wrapper>
      <Spinner animation="border" role="status" variant={variant} style={dims}>
        <span className="visually-hidden">{text}</span>
      </Spinner>
    </Wrapper>
  );
}
