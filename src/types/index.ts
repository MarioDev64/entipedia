export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: 'new' | 'in_progress' | 'in_review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  order: number;
  createdAt: Date;
}

export interface Client {
  id: number;
  name: string;
  type: 'person' | 'company';
  valueDop: string;
  startDate: string;
  endDate: string;
  createdAt: Date;
}

export interface File {
  id: number;
  name: string;
  description: string | null;
  fileType: string;
  fileUrl: string;
  createdAt: Date;
  size: number;
}
