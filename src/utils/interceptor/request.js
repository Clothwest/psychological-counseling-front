import interceptor from "./interceptors"
// 登录和个人设置
export const loginRequest = (data) => interceptor.post('/api/auth/login', data)
export const changePasswordRequest = (data) => interceptor.post('/api/users/changePassword', data)
export const uploadAvatarRequest = (file) => interceptor.post('/api/users/avatar', file)
// 用户管理-admin
export const fetchUsers = (currentPage, pageSize, username) => interceptor.get('/api/admin/users/pageQuery', { params: { page: currentPage, size: pageSize, username: username } })
export const addUser = (username, name, phone, role, college, gender, password) => interceptor.post('/api/admin/users/create', { username: username, name: name, phone: phone, role: role, college: college, gender: gender, password: password })
export const deleteUser = (id) => interceptor.delete('/api/admin/users/' + id)
export const updateUser = (id, name, phone, role, college, gender, password) => interceptor.put('/api/admin/users/update/' + id, { name: name, phone: phone, role: role, college: college, gender: gender, password: password })
export const listUsers = () => interceptor.get('/api/admin/users/list')
// 初访管理-admin
export const getPendingInitialVisits = () => interceptor.get('')
export const changeAppointmentStatus = (id, status, visitorId) => interceptor.put('/api/admin/initial-visit-applications/' + id + '/review', { status: status, assignedInterviewerId: visitorId, rejectionReason: "" })
export const fetchInitialVisitRecordsAdmin = (currentPage, pageSize) => interceptor.get('/api/admin/initial-visit-applications', { params: { pageNum: currentPage, pageSize: pageSize } })
export const updateAppointment = (id, scheduleSlotId) => interceptor.put('/api/admin/initial-visit-applications/' + id, { scheduleSlotId: scheduleSlotId })
export const cancelAppointmentAdmin = (id) => interceptor.post('/api/admin/initial-visit-applications/' + id + '/cancel')
// 问卷管理-admin
export const fetchQuestions = (currentPage, pageSize) => interceptor.get('/api/admin/questionnaires', { params: { pageNum: currentPage, pageSize: pageSize } })
export const deleteQuestion = (id) => interceptor.delete('/api/admin/questionnaires/' + id)
export const updateQuestion = (id, questionText) => interceptor.put('/api/admin/questionnaires/' + id, { questionText: questionText })
export const addQuestion = (questionText) => interceptor.post('/api/admin/questionnaires', { questionText: questionText })
// 值班管理-admin
export const fetchSchedules = (currentPage, pageSize) => interceptor.get('/api/admin/schedule-templates', { params: { pageNum: currentPage, pageSize: pageSize } })
export const addSchedule = (staffId, dayOfWeek, startTime, endTime) => interceptor.post('/api/admin/schedule-templates', {
    staffId: staffId,
    recurrenceType: "WEEKLY",
    dayOfWeek: dayOfWeek,
    startTime: startTime,
    endTime: endTime,
    slotDurationMinutes: 60,
    location: "",
    effectiveFrom: "2025-06-21",
    effectiveTo: "2025-09-30",
    isActive: true
})
export const updateSchedule = (id, staffId, dayOfWeek, startTime, endTime) => interceptor.put('/api/admin/schedule-templates/' + id, {
    id: id,
    staffId: staffId,
    recurrenceType: "WEEKLY",
    dayOfWeek: dayOfWeek,
    startTime: startTime,
    endTime: endTime,
    slotDurationMinutes: 60,
    location: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
})
export const deleteSchedule = (id) => interceptor.delete('/api/admin/schedule-templates/' + id)
export const fetchStaffList = (id) => interceptor.get('/api/admin/users/' + id)
export const fetchSlots = (currentPage, pageSize) => interceptor.get('/api/admin/schedule-slots/pageQuery', { params: { pageNum: currentPage, pageSize: pageSize } })
export const createSlots = (startDate, endDate) => interceptor.post('/api/admin/schedule-slots/generate', { startDate: startDate, endDate: endDate })
export const deleteSlot = (id) => interceptor.delete('/api/admin/' + id)
// 预约管理-student
export const fetchAvailableSlots = (date) => interceptor.get('/api/student/initialVisit/available', { params: { queryDate: date } })
export const createAppointment = (id, staffId, requestedDate, requestedTime, answers) => interceptor.post('/api/student/initialVisit/submit', {scheduleSlotId: id, assignedInterviewerId: staffId, requestedDate: requestedDate, requestedTime: requestedTime, answers: answers })
export const getQuestionnaire = () => interceptor.get('/api/student/questionnaires/random')
export const fetchInitialVisitRecords = (currentPage,  pageSize) => interceptor.get('/api/student/initialVisit', { params: { page: currentPage, size: pageSize}})
export const cancelAppointment = (id) => interceptor.post('/api/student/initialVisit/' + id + '/cancel')
