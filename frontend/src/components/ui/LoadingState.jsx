import { Loader } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="state-box">
      <Loader size={18} className="spinning" />
      <span>Loading...</span>
    </div>
  );
}