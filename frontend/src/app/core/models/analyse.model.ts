export interface AnalyseResponse {
  client_id: number;
  segmentation: {
    client_id: number;
    segment: number;
    age: number;
    anciennete: number;
    nb_sinistres: number;
  };
  risque: {
    client_id: number;
    score_risque: number;
    nb_sinistres: number;
    nb_retards: number;
    explication?: Record<string, number>;
    explication_textuelle?: string[];
  };
  pricing: {
    client_id: number;
    segment: number;
    score_risque: number;
    prime_actuelle: number | null;
    prime_recommandee: number;
    variation_pct: number | null;
  };
  recommandations: {
    client_id: number;
    segment: number;
    score_risque: number;
    recommandations: string[];
  };
  fraude: {
    client_id: number;
    score_suspicion: number;
    fraude_suspecte: boolean;
    alertes: string[];
  };
  compliance: {
    client_id: number;
    statut_conformite: string;
    violations: string[];
  };
  analyse_ia?: {
    resume: string;
    analyse_metier: string;
    points_forts: string[];
    points_faibles: string[];
    actions_recommandees: string[];
    conclusion: string;
  };
}

export interface ChatMessage {
  question: string;
  answer: string;
  isUser?: boolean;
}