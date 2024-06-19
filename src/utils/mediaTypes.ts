export interface MediaItem {
  seasons: any;
  id: string;
  title: string;
  year?: number;
  release_date?: Date;
  poster?: string;
  type: "show" | "movie";
}
