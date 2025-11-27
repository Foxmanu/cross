export const getApiBaseUrl = () => {
  const orgName = localStorage.getItem("organizationName");
  if (!orgName) {
    console.warn("Organization name not set in localStorage");
    return "https://workerpool2.inuka.ai"; // fallback without org name
  }
  return `https://workerpool2.inuka.ai/${orgName}`;
};

export const getApiEndpoint = (path) => {
  return `${getApiBaseUrl()}${path}`;
};