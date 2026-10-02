import { useEffect, useState } from "react";

/**
 * Rotating word for the Home hero heading.
 * The current word slides up and fades out FIRST, then the next word slides up and fades in, so two words are
 * never visible at the same time. All words share one grid cell inside an overflow-hidden box; that box always
 * reserves the width of the longest word, so nothing around it moves.
 * Do not put this inside an element that uses background-clip:text (Safari would draw every word at once).
 */
export default function RotatingWords({ words, interval = 3000, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const [{ index, prev }, setPos] = useState({ index: 0, prev: -1 });
  useEffect(() => {
    if (words.length < 2) return;
    const id = window.setInterval(() => setPos((p) => ({ prev: p.index, index: (p.index + 1) % words.length })), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <>
      {/* screen readers get one stable word instead of a changing heading */}
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden="true" className="rotating-words">
        {words.map((w, i) => (
          <span key={w} className={`rotating-word ${className} ${i === index ? "is-active" : i === prev ? "is-leaving" : ""}`}>{w}</span>
        ))}
      </span>
    </>
  );
}
