export interface Card {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  position: {
    x: number;
    y: number;
  };
  angle?: number;
}

export interface Suggestion {
  id: string;
  text: string;
}
