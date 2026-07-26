export interface School {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  regional: string
  contactPerson: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastVisited: string | null
}

export interface SchoolStock {
  id: string
  name: string
  address: string
  regional: string
  totalStudents: number
  totalTeachers: number
  latitude: number
  longitude: number
  contactPerson: string
  isFromStock: boolean
}

export interface Visit {
  id: string
  schoolId: string
  schoolName: string
  userId: string
  userName: string
  visitDate: string
  status: "Selesai" | "Proses" | "Dijadwalkan"
  notes: string
  picName: string
  picPhone: string
  totalStudents: number
  totalTeachers: number
  hasBilingual: boolean
  createdAt: string
}

export interface Pipeline {
  id: string
  schoolId: string
  schoolName: string
  contactPerson: string
  stage: "Prospect" | "Presentasi" | "Proposal" | "MoU" | "Not This Time"
  lastAction: string
  pricePerStudentMonth: number | null
  dealPricePerStudentMonth: number | null
  totalStudents: number
  updatedAt: string
}

export interface Photo {
  id: string
  schoolId: string
  schoolName: string
  uploadedBy: string
  storagePath: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "sales"
  avatarUrl: string | null
  createdAt: string
}
