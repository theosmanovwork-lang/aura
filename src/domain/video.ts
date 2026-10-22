export type AgeRating = '0+' | '6+' | '12+' | '16+' | '18+';

export type ModerationStatus = 'pending' | 'published' | 'rejected';

export type Video = Readonly<{
  id: string;
  authorId: string;
  trendId: string;
  title: string;
  videoUri: string;
  isAiGenerated: boolean;
  ageRating: AgeRating;
  moderationStatus: ModerationStatus;
  likeCount: number;
  viewCount: number;
  createdAt: number;
}>;
