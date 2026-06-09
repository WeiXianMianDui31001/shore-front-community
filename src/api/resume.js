import request from './request'

export function fetchTemplates(type) {
  return request
    .get('/resume/templates', { params: type != null ? { type } : {} })
    .then((res) => res.data || [])
}

export function fetchTemplateDetail(id) {
  return request.get(`/resume/templates/${id}`).then((res) => res.data)
}

export function fetchResumeDetail(id) {
  return request.get(`/resume/${id}`).then((res) => res.data)
}

export function fetchMyResumes(page = 1, size = 20) {
  return request.get('/resume/my', { params: { page, size } }).then((res) => res.data)
}

export function createResume(body) {
  return request.post('/resume', body).then((res) => res.data)
}

export function updateResume(id, body) {
  return request.put(`/resume/${id}`, body).then((res) => res.data)
}

export function previewResumeHtml(templateId, contentJson) {
  return request.post('/resume/preview-html', { templateId, contentJson }).then((res) => res.data)
}

export function startResumeExport(resumeId) {
  return request.post(`/resume/${resumeId}/export`).then((res) => res.data)
}

export function getResumeExportStatus(resumeId, exportId) {
  return request.get(`/resume/${resumeId}/export/${exportId}/status`).then((res) => res.data)
}

export function downloadResumeExport(exportId) {
  return request.get(`/resume/export/${exportId}/download`, { responseType: 'blob' })
}

export function uploadResumePhoto(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post('/resume/upload-photo', fd).then((res) => res.data)
}
