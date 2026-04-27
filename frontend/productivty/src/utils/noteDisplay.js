export function formatRelativeTime(dateString) {
  if (!dateString) {
    return 'Recently';
  }

  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (Number.isNaN(seconds) || seconds < 60) {
    return 'just now';
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  }

  if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return new Date(dateString).toLocaleDateString();
}

export function getNotePreview(note, maxLength = 140) {
  const source = note?.summary || note?.content || '';
  const cleaned = source
    .replace(/[#*_`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return 'No content yet';
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}
