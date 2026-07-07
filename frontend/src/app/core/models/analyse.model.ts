export interface AnalyseResponse {
  client_id: number;
  segmentation: {
    segment_predit: string;
    nb_sinistres: number;
  };
  risque: {
    score_risque: number;
    nb_sinistres: number;
    nb_retards: number;
  };
  pricing: {
    segment: string;
    score_risque: number;
    prime_actuelle: number | null;
    prime_recommandee: number;
    variation_pct: number | null;
  };
  recommandations: {
    segment: string;
    recommandations: string[];
    telematics_eligible: boolean;
    telematics_potential_reduction: string;
  };
  fraude: {
    nb_sinistres_analyses: number;
    score_suspicion: number;
    fraude_suspecte: boolean;
    alertes: string[];
  };
  compliance: {
    statut_conformite: string;
    violations: string[];
  };
}

export interface ChatMessage {
  question: string;
  answer: string;
  isUser?: boolean;
}