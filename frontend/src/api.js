const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `API request failed (${response.status})`);
  }

  return response.json();
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getCourses(search = "") {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return request(`/api/courses${query}`);
}

export function createCourse(course) {
  return request("/api/courses", {
    method: "POST",
    body: JSON.stringify(course),
  });
}

export function getCoursePdfs(courseId) {
  return request(`/api/courses/${encodeURIComponent(courseId)}/pdfs`);
}

export async function uploadCoursePdf(courseId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/courses/${encodeURIComponent(courseId)}/pdfs`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `PDF upload failed (${response.status})`);
  }

  return response.json();
}

export function getCoursePdfPreviewUrl(courseId, pdfId) {
  return `${API_BASE_URL}/api/courses/${encodeURIComponent(courseId)}/pdfs/${encodeURIComponent(pdfId)}/file`;
}

export function getCoursePdfDownloadUrl(courseId, pdfId) {
  return `${getCoursePdfPreviewUrl(courseId, pdfId)}?download=true`;
}
