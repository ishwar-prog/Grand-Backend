import React from 'react';

// Regex with capturing group - split keeps the matched URLs in the array
const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?]|www\.[^\s<]+[^\s<.,:;"')\]!?])/gi;

const LinkifyText = ({ children }) => {
  if (!children || typeof children !== 'string') return children;

  return children.split(URL_REGEX).map((part, i) =>
    URL_REGEX.test(part) ? (
      <a
        key={i}
        href={part.startsWith('www.') ? `https://${part}` : part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:text-purple-300 hover:underline break-all transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : part
  );
};

export default LinkifyText;
