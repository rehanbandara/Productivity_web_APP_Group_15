const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const YOUTUBE_URL_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

export const validateNote = ({ title, contentType, topicId }) => {
  const errors = {};

  if (!title || title.trim() === '') {
    errors.title = 'Title is required.';
  } else if (title.trim().length > 255) {
    errors.title = 'Title must not exceed 255 characters.';
  }

  if (!contentType) {
    errors.contentType = 'Content type is required.';
  } else if (!['HTML', 'MARKDOWN'].includes(contentType)) {
    errors.contentType = 'Content type must be HTML or MARKDOWN.';
  }

  if (topicId !== '' && topicId !== null && topicId !== undefined) {
    const num = Number(topicId);
    if (!Number.isInteger(num) || num <= 0) {
      errors.topicId = 'Topic ID must be a positive integer.';
    }
  }

  return errors;
};

export const validateTag = ({ name, color }) => {
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Tag name is required.';
  } else if (name.trim().length > 100) {
    errors.name = 'Tag name must not exceed 100 characters.';
  }

  if (color && color.trim() !== '') {
    if (!HEX_COLOR_REGEX.test(color.trim())) {
      errors.color = 'Color must be a valid hex value (e.g. #FF5733).';
    }
  }

  return errors;
};

export const validateTopic = ({ name, color, description }) => {
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Topic name is required.';
  } else if (name.trim().length > 100) {
    errors.name = 'Topic name must not exceed 100 characters.';
  }

  if (color && color.trim() !== '') {
    if (!HEX_COLOR_REGEX.test(color.trim())) {
      errors.color = 'Color must be a valid hex value (e.g. #3A86FF).';
    }
  }

  if (description && description.length > 500) {
    errors.description = 'Description must not exceed 500 characters.';
  }

  return errors;
};

export const validateYouTubeUrl = (youtubeUrl) => {
  const trimmedUrl = youtubeUrl?.trim() || '';

  if (!trimmedUrl) {
    return 'Please enter a YouTube URL';
  }

  if (!YOUTUBE_URL_REGEX.test(trimmedUrl)) {
    return 'Invalid YouTube URL format';
  }

  return '';
};