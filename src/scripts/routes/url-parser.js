const parseActivePathname = () => {
  const pathname = window.location.hash.slice(1).toLowerCase() || '/';
  return pathname;
};

const getActivePathname = () => {
  const pathname = parseActivePathname();
  return pathname;
};

const parsePathname = (pathname) => {
  const pathParts = pathname.split('/');
  return {
    resource: pathParts[1] || null,
    id: pathParts[2] || null,
  };
};

const getRoute = (pathname) => {
  const parsedPath = parsePathname(pathname);
  let route = `/${parsedPath.resource || ''}`;
  if (parsedPath.id) {
    route += '/:id';
  }
  return route;
};

const getActiveRoute = () => {
  const pathname = getActivePathname();
  return getRoute(pathname);
};

export {
  getActivePathname,
  getActiveRoute,
  getRoute,
  parseActivePathname,
  parsePathname,
};