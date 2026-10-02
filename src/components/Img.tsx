import { useState } from "react";
interface Props { file: string; alt: string; className?: string; eager?: boolean }
/** Loads /assets/images/<file>. If the file is missing, shows a labelled placeholder. */
export default function Img({ file, alt, className = "", eager }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-gradient-to-br from-brand to-brand-dark p-3 text-center text-xs text-white/80 ${className}`}>
        Add image: {file}
      </div>
    );
  }
  return <img src={`/assets/images/${file}`} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
