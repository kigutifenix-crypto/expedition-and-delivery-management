
export type Status = 'pendente' | 'em_transito' | 'concluido' | 'cancelado';

export interface Product {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  serialNumber: string;
  warrantyMonths: number;
}

export interface Volume {
  id: string;
  number: number;
  description: string;
  quantity: number;
  weight: number;
  observation?: string;
}

export interface Feedback {
  rating: number;
  deliveryQuality?: number;
  installationQuality?: number;
  serviceQuality?: number;
  equipmentCondition?: number;
  comments?: string;
}

export interface Expedition {
  id: string;
  date: string;
  nf: string;
  orderNumber: string;
  clientName: string;
  address: string;
  carrier: string;
  freightType: 'FOB' | 'CIF';
  responsible: string;
  observations: string;
  status: Status;
  products: Product[];
  volumes: Volume[];
  photos: string[];
  customerContactDone?: boolean;
  customerContactNotes?: string;
  assemblyTechnician?: string;
  deliveryInfo?: DeliveryInfo;
}

export interface DeliveryInfo {
  arrivalDate?: string;
  responsibleName?: string;
  responsibleRole?: string;
  checklist: {
    unloaded: boolean;
    installed: boolean;
    tested: boolean;
    working: boolean;
    trained: boolean;
  };
  deliveryPhotos: string[];
  signature?: string;
  signerName?: string;
  signerDoc?: string;
  feedback?: Feedback;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'expedicao' | 'motorista' | 'supervisor' | 'cliente';
  avatar?: string;
}
