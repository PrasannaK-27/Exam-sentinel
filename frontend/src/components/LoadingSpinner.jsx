const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin`} />
      {text && <p className="text-slate-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
