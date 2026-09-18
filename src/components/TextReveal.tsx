import { motion } from 'motion/react';

interface TextRevealProps {
  text: string;
  className?: string;
  highlightWord?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export function TextReveal({ text, className = '', highlightWord, as = 'span' }: TextRevealProps) {
  const words = text.split(' ');

  const content = (
    <span className="inline-block overflow-hidden">
      {words.map((word, i) => {
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase());

        return (
          <motion.span
            key={i}
            className="inline-block mr-[0.25em] overflow-hidden align-baseline"
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.6,
              delay: i * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {isHighlight ? (
              <span className="highlight-lime">{word}</span>
            ) : (
              word
            )}
          </motion.span>
        );
      })}
    </span>
  );

  const Tag = as;
  return <Tag className={className}>{content}</Tag>;
}
