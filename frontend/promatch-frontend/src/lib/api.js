import { axiosInstance } from "./axios";


export const signup = async (signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData)
    return response.data
  }

export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData)
    return response.data
  }

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout")
  return response.data
}

export const getAuthUser = async () => {
  try{
    const response = await axiosInstance.get("/auth/me")
    return response.data
  }catch(error){
    return null;
  }
  
}

export const onboarding = async (onboardingData) => {
  const response = await axiosInstance.post("/auth/onboarding", onboardingData)
  return response.data
}

export const getAllSubjects = async () => {
  const response = await axiosInstance.get("/subjects/allsubjects")
  return response.data
}

export const getAllRoles = async () => {
  const response = await axiosInstance.get("/roles/allroles")
  return response.data
}

export const getAllLocations = async () => {
  const response = await axiosInstance.get("/locations/alllocations")
  return response.data
}

export const getAllLanguages = async () => {
  const response = await axiosInstance.get("/languages/alllanguages")
  return response.data
}


export const uploadAvatar = async (file) => {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await axiosInstance.post("/cloudinary/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return response.data
}


export async function getMyProffessors(){
  const response = await axiosInstance.get("/users/proffesorsconnected")
  return response.data
}


export async function getRecommendedProfessorsBySubjects(){
  const response = await axiosInstance.get("/users/recommended-by-subjects")
  return response.data
}

// Búsqueda paginada de profesores con filtros y orden
export async function searchProfessors(params) {
  // params: { q, locationId, languageId, subjectId, priceMin, priceMax, sort, page, limit }
  const response = await axiosInstance.get("/users/professors/search", {
    params,
  });
  return response.data; // { data, page, limit, total, hasMore }
}

export async function createConnection(userId){
  const response = await axiosInstance.put(`/users/professor/${userId}/connect`);
  return response.data
}

export async function getProfessorById(professorId){
  const response = await axiosInstance.get(`/users/professor/${professorId}`);
  return response.data
}

export async function checkConnectionStatus(professorId){
  const response = await axiosInstance.get(`/users/professor/${professorId}/connection-status`);
  return response.data
}








export const connectMercadoPago = async () => {
  const response = await axiosInstance.get("/mercadopago/connect")
  return response.data
}

export const getMercadoPagoStatus = async () => {
  const response = await axiosInstance.get("/mercadopago/status")
  return response.data
}

export const createPayment = async (professorId) => {
  const response = await axiosInstance.post(`/mercadopago/payment/${professorId}`)
  return response.data
}


export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export async function getActivityHistory() {
  const response = await axiosInstance.get("/activity/history");
  return response.data;
}

export async function createVirtualClass(participants, channelId) {
  const response = await axiosInstance.post("/activity/virtual-class", {
    participants,
    channelId
  });
  return response.data;
}

export async function getUnreadCounts() {
  const response = await axiosInstance.get("/chat/unread");
  return response.data;
}

// Eliminar usuario actual
export async function deleteMe() {
  const response = await axiosInstance.delete("/users/me");
  return response.data;
}