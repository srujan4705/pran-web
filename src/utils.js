export function createPageUrl(pageName) {
  return `/${pageName === 'Home' ? '' : pageName.toLowerCase()}`;
}

// If the app uses query params for routing (common in some templates):
export function createPageUrlQuery(pageName) {
  return `/?page=${pageName}`;
}

// Let's check which one is used. Looking at AlumniCard.jsx:
// to={createPageUrl("AlumniDetail") + `?id=${alumni.id}`}
// This suggests createPageUrl returns a path.

export { createPageUrl as default };
