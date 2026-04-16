export default function ErrorState({ message }) {
  return (
    <div className="state-box state-error">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}
