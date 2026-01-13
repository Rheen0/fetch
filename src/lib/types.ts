export interface LostItemReport {
  report_id: number;
  student_id: number;
  item_name: string;
  description: string | null;
  image_url: string | null;
  category: string;
   last_seen_location: string | null; 
  status: 'active' | 'resolved' | 'cancelled';
  reported_at: string;
}

export interface FoundItem {
  found_id: number;
  security_id: number;
  item_name: string;
  image_url: string | null;
  category: string;
  found_location: string | null;
  status: 'pending' | 'claimed' | 'returned';
  found_at: string;
}

export interface Match {
  match_id: number;
  report_id: number;
  found_id: number;
  match_score: number;
  notified: boolean;
  matched_at: string;
}

export interface MatchedFoundItem extends FoundItem {
  match_score: number;
  match_id: number;
  security_name: string;
  description: string;
}

export interface LostItemWithMatches {
  report: LostItemReport;
  matches: MatchedFoundItem[];
  studentId: number;
}

export interface StudentStats {
  activeReports: number;
  pendingClaims: number;
  itemsClaimed: number;
  totalMatches: number;
}