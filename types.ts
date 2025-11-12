export interface ComponentRelationship {
  targetId: string;
  description: string;
}

export interface ComponentModel {
  id: string;
  type: 'image' | 'line';
  x: number;
  y: number;
  width?: number; // For images
  height?: number; // For images
  x2?: number; // For lines
  y2?: number; // For lines
  label: string;
  description: string;
  imageUrl?: string; // To store the base64 data URL for the image
  relationships?: ComponentRelationship[];
}

export interface Model {
  components: ComponentModel[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}