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

export function getCourseModules(courseId) {
  return request(`/api/courses/${encodeURIComponent(courseId)}/modules`);
}

export function createCourseModule(courseId, module) {
  return request(`/api/courses/${encodeURIComponent(courseId)}/modules`, {
    method: "POST",
    body: JSON.stringify(module),
  });
}

// Module PDF & Quiz API helpers
export function uploadModulePdf(moduleId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${API_BASE_URL}/api/modules/${encodeURIComponent(moduleId)}/pdfs`, {
    method: 'POST',
    body: formData,
  }).then(res => {
    if (!res.ok) {
      return res.json().catch(() => ({})).then(err => { throw new Error(err.detail || `PDF upload failed (${res.status})`); });
    }
    return res.json();
  });
}

export function getModulePdfs(moduleId) {
  return request(`/api/modules/${encodeURIComponent(moduleId)}/pdfs`);
}

// Module PDF preview / download helpers
export function getModulePdfPreviewUrl(moduleId, pdfId) {
  return `${API_BASE_URL}/api/modules/${encodeURIComponent(moduleId)}/pdfs/${encodeURIComponent(pdfId)}/file`;
}

export function getModulePdfDownloadUrl(moduleId, pdfId) {
  return `${getModulePdfPreviewUrl(moduleId, pdfId)}?download=true`;
}

export function createModuleQuiz(moduleId, quiz) {
  return request(`/api/modules/${encodeURIComponent(moduleId)}/quizzes`, {
    method: 'POST',
    body: JSON.stringify(quiz),
  });
}

export function getModuleQuiz(moduleId) {
  return request(`/api/modules/${encodeURIComponent(moduleId)}/quizzes`);
}

export function getModuleQuizAttempts(moduleId, studentId) {
  return request(
    `/api/modules/${encodeURIComponent(moduleId)}/quiz-attempts?student_id=${encodeURIComponent(studentId)}`
  );
}

export function submitModuleQuizAttempt(moduleId, attempt) {
  return request(`/api/modules/${encodeURIComponent(moduleId)}/quiz-attempts`, {
    method: "POST",
    body: JSON.stringify(attempt),
  });
}

export function getCourseQuiz(courseId) {
  return request(`/api/courses/${encodeURIComponent(courseId)}/quizzes`);
}

export function saveCourseQuiz(courseId, quiz) {
  return request(`/api/courses/${encodeURIComponent(courseId)}/quizzes`, {
    method: "POST",
    body: JSON.stringify(quiz),
  });
}
